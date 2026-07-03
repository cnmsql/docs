// Block-level diffing between two markdown documents.
//
// We deliberately work at the granularity of top-level markdown "blocks"
// (paragraphs, headings, list groups, code fences, tables) rather than lines,
// because the goal is to annotate the *rendered* page: one block ≈ one rendered
// DOM element, so a block diff maps cleanly onto what the reader sees.

// Split markdown into top-level blocks. Blank lines separate blocks, except
// inside fenced code, which is kept whole even when it contains blank lines.
export function splitBlocks(md) {
  const lines = (md ?? '').replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let buf = [];
  let fence = null;

  const flush = () => {
    const text = buf.join('\n').replace(/\s+$/, '');
    if (text.trim() !== '') {
      blocks.push(text);
    }
    buf = [];
  };

  for (const line of lines) {
    if (fence) {
      buf.push(line);
      const close = line.match(/^\s*(`{3,}|~{3,})\s*$/);
      if (close && close[1][0] === fence[0] && close[1].length >= fence.length) {
        fence = null;
        flush();
      }
      continue;
    }
    const open = line.match(/^\s*(`{3,}|~{3,})/);
    if (open) {
      flush();
      fence = open[1];
      buf.push(line);
      continue;
    }
    if (line.trim() === '') {
      flush();
    } else {
      buf.push(line);
    }
  }
  flush();
  return blocks;
}

// Strip markdown syntax down to the visible text, so a source block can be
// compared against a rendered element's textContent. Also strips zero-width
// characters that Docusaurus injects into heading anchors (U+200B, etc.) so
// that the word-level diff and plain-text rendering always agree.
export function plainText(md) {
  return (md ?? '')
    .replace(/^\s*(`{3,}|~{3,}).*$/gm, '') // fence delimiter lines
    .replace(/`([^`]+)`/g, '$1') // inline code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links -> text
    .replace(/[*_~]{1,3}/g, '') // emphasis
    .replace(/^\s{0,3}#{1,6}\s*/gm, '') // headings
    .replace(/^\s{0,3}>\s?/gm, '') // blockquote
    .replace(/^\s*[-*+]\s+/gm, '') // unordered bullets
    .replace(/^\s*\d+\.\s+/gm, '') // ordered bullets
    .replace(/^\s*:::.*$/gm, '') // admonition fences
    .replace(/^[\s|:-]*-{3,}[\s|:-]*$/gm, '') // table separator rows / hr
    .replace(/[|]/g, ' ') // table pipes
    .replace(/[\u200B-\u200D\uFEFF\u2060]/g, '') // zero-width chars (Docusaurus anchors)
    .replace(/\s+/g, ' ')
    .trim();
}

// A short, normalized fingerprint used to test block equality/order cheaply.
// Whitespace is dropped entirely: rendered code blocks concatenate their lines
// with no separators (textContent has no newlines), so a whitespace-insensitive
// key is the only way source and DOM agree on code.
// When plainText is empty (image-only blocks, admonition fences, etc.) the key
// falls back to the bare text to avoid false LCS matches.
export function canonKey(md) {
  const p = plainText(md);
  if (!p) {
    return (md ?? '')
      .replace(/[\u200B-\u200D\uFEFF\u2060]/g, '')
      .replace(/\s+/g, '')
      .toLowerCase()
      .slice(0, 200);
  }
  return p
    .replace(/\s+/g, '')
    .toLowerCase()
    .slice(0, 200);
}

// True when a block is a markdown ATX heading (starts a section).
export function isHeading(md) {
  return /^\s{0,3}#{1,6}\s/.test(md ?? '');
}

// The heading level (1-6) of a heading block, else 0 for non-headings.
export function headingLevel(md) {
  const m = /^\s{0,3}(#{1,6})\s/.exec(md ?? '');
  return m ? m[1].length : 0;
}

// The visible text of a heading block (leading #'s stripped), else ''.
export function headingText(md) {
  const m = /^\s{0,3}#{1,6}\s+(.*)$/.exec((md ?? '').split('\n')[0]);
  return m ? plainText(m[1]) : '';
}

function tokens(md) {
  return plainText(md)
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

// Decide whether a removed block and an added block are the same block edited,
// rather than two unrelated changes. We look at word overlap two ways:
//   overlap coefficient = shared / smaller block  — robust to one side growing
//                         or shrinking a lot (a common docs edit: expand a para)
//   Jaccard             = shared / union          — a floor that stops a short
//                         heading matching any big paragraph that contains it.
// Returns a score (higher = more similar) or 0 when it is not a modification.
export function modScore(a, b) {
  const ta = new Set(tokens(a));
  const tb = new Set(tokens(b));
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter += 1;
  const overlap = inter / Math.min(ta.size, tb.size);
  const jaccard = inter / (ta.size + tb.size - inter);
  if (inter < 2 || overlap < 0.6 || jaccard < 0.2) return 0;
  return overlap + jaccard;
}

// Longest common subsequence over two key arrays, returned as [i, j] index
// pairs (into a and b respectively) in document order.
export function lcsPairs(a, b) {
  const n = a.length;
  const m = b.length;
  const dp = Array.from({length: n + 1}, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      dp[i][j] =
        a[i] === b[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const pairs = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      pairs.push([i, j]);
      i += 1;
      j += 1;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      i += 1;
    } else {
      j += 1;
    }
  }
  return pairs;
}

// Diff `base` -> `current`. Returns:
//   items:    one entry per current block, in order, with a status:
//             'unchanged' | 'added' | 'modified' (modified carries its `base` text)
//   removals: base blocks with no counterpart, anchored after a current index
export function alignBlocks(baseMd, currentMd) {
  const base = splitBlocks(baseMd);
  const current = splitBlocks(currentMd);
  const pairs = lcsPairs(base.map(canonKey), current.map(canonKey));

  const items = current.map((text) => ({status: 'unchanged', current: text, base: null}));
  const removals = [];

  // Each gap between consecutive matched anchors holds the base blocks that
  // vanished and the current blocks that appeared there. Pair them greedily by
  // best word overlap: the strongest removed↔added matches become modifications
  // (before/after), and whatever is left over is a pure removal or addition.
  let prevI = 0;
  let prevJ = 0;
  const anchors = [...pairs, [base.length, current.length]];

  for (const [mi, mj] of anchors) {
    const removedBlocks = base.slice(prevI, mi);
    const addedIdx = [];
    for (let j = prevJ; j < mj; j += 1) addedIdx.push(j);

    const candidates = [];
    removedBlocks.forEach((removed, ri) => {
      addedIdx.forEach((aj, ai) => {
        const score = modScore(removed, current[aj]);
        if (score > 0) candidates.push({ri, ai, score});
      });
    });
    candidates.sort((x, y) => y.score - x.score);

    const usedR = new Set();
    const usedA = new Set();
    for (const c of candidates) {
      if (usedR.has(c.ri) || usedA.has(c.ai)) continue;
      usedR.add(c.ri);
      usedA.add(c.ai);
      const aj = addedIdx[c.ai];
      items[aj] = {status: 'modified', current: current[aj], base: removedBlocks[c.ri]};
    }

    addedIdx.forEach((aj, ai) => {
      if (!usedA.has(ai)) items[aj] = {status: 'added', current: current[aj], base: null};
    });
    removedBlocks.forEach((removed, ri) => {
      if (!usedR.has(ri)) {
        removals.push({after: prevJ - 1, base: removed, baseIndex: prevI + ri});
      }
    });

    prevI = mi + 1;
    prevJ = mj + 1;
  }

  const changed = items.filter((i) => i.status !== 'unchanged').length + removals.length;
  return {items, removals, changed};
}
