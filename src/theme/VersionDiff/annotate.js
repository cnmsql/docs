// DOM annotation for the version-diff "highlights" mode. Kept free of React and
// CSS-module imports (styles are passed in) so it can be unit-tested against a
// real DOM in isolation. All mutations are tracked and reverted by the returned
// cleanup, and any thrown error rolls everything back rather than breaking the
// page.
import {canonKey, headingLevel, headingText, isHeading, lcsPairs, plainText} from './blocks';
import {wordDiffHtml} from './words';

const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function buildCard(styles, base, current, baseLabel, currentLabel) {
  const {beforeHtml, afterHtml} = wordDiffHtml(
    plainText(base),
    plainText(current),
    styles.del,
    styles.ins,
  );
  const card = document.createElement('div');
  card.className = styles.card;
  card.dataset.versionDiff = 'card';
  card.innerHTML = `
    <div class="${styles.col}">
      <div class="${styles.colHead}">Before · ${escapeHtml(baseLabel)}</div>
      <div class="${styles.colBody}">${beforeHtml}</div>
    </div>
    <div class="${styles.col}">
      <div class="${styles.colHead} ${styles.colHeadAfter}">After · ${escapeHtml(currentLabel)}</div>
      <div class="${styles.colBody}">${afterHtml}</div>
    </div>`;
  return card;
}

// A modified heading is a section rename: render the title delta inline rather
// than as a full two-column card, so it reads like a heading, not a paragraph.
function buildHeadingCard(styles, base, current, baseLabel, currentLabel) {
  const {beforeHtml, afterHtml} = wordDiffHtml(
    headingText(base),
    headingText(current),
    styles.del,
    styles.ins,
  );
  const level = headingLevel(current) || headingLevel(base) || 2;
  const card = document.createElement('div');
  // Level-keyed modifier classes (h2/h3/h4...) size the title to match the
  // surrounding rendered headings. A level N heading applies headingLevelN.
  card.className = `${styles.headingDelta} ${styles[`headingLevel${level}`] ?? ''}`;
  card.dataset.versionDiff = 'card';
  card.innerHTML = `<div class="${styles.headingLabel}">Renamed · ${escapeHtml(baseLabel)} → ${escapeHtml(currentLabel)}</div><div class="${styles.headingOld}">${beforeHtml}</div><div class="${styles.headingNew}">${afterHtml}</div>`;
  return card;
}

// One card for a run of removed blocks. A run that begins with a heading is a
// whole deleted section and is titled as such; otherwise it is a plain removal.
function buildRemovedCard(styles, blocks, baseLabel) {
  const section = isHeading(blocks[0]);
  const card = document.createElement('div');
  card.className = section ? styles.deletedSection : styles.removedCard;
  card.dataset.versionDiff = 'card';

  const label = section
    ? `Deleted section · was in ${escapeHtml(baseLabel)}`
    : `Removed · was in ${escapeHtml(baseLabel)}`;
  let inner = `<div class="${styles.colHead}">${label}</div>`;

  if (section) {
    inner += `<div class="${styles.secDelTitle}">${escapeHtml(headingText(blocks[0]))}</div>`;
    const rest = blocks.slice(1).map(plainText).filter(Boolean).join('\n\n');
    if (rest) inner += `<div class="${styles.removedBody}">${escapeHtml(rest)}</div>`;
  } else {
    const body = blocks.map(plainText).filter(Boolean).join('\n\n');
    inner += `<div class="${styles.removedBody}">${escapeHtml(body)}</div>`;
  }
  card.innerHTML = inner;
  return card;
}

// Split an ordered index list into runs of consecutive integers.
function consecutiveRuns(indices) {
  const runs = [];
  let run = null;
  for (const i of indices) {
    if (run && i === run.end + 1) run.end = i;
    else {
      run = {start: i, end: i};
      runs.push(run);
    }
  }
  return runs;
}

// Split a consecutive run into heading-delimited segments. Blocks before the
// first heading form a leading (non-section) segment; each heading starts a new
// section segment that runs until the next heading. `textAt(i)` yields a block.
function headingSegments(run, textAt) {
  const segs = [];
  for (let i = run.start; i <= run.end; i += 1) {
    const heading = isHeading(textAt(i));
    if (heading || segs.length === 0) {
      segs.push({heading, indices: [i]});
    } else {
      segs[segs.length - 1].indices.push(i);
    }
  }
  return segs;
}

// Annotate the live rendered page in place. Returns a cleanup that fully
// restores the DOM, so toggling highlights off leaves no trace.
export function annotate(container, items, removals, baseLabel, currentLabel, styles) {
  const domBlocks = Array.from(container.children).filter(
    (el) => el.textContent && el.textContent.trim() !== '',
  );
  // Align source blocks to rendered blocks by text, tolerating DOM nodes that
  // have no source counterpart (admonition wrappers, etc.).
  const pairs = lcsPairs(
    items.map((it) => canonKey(it.current)),
    domBlocks.map((el) => canonKey(el.textContent)),
  );
  const srcToDom = new Map(pairs.map(([s, d]) => [s, domBlocks[d]]));

  const inserted = [];
  const hidden = [];
  const classed = [];
  const addClass = (el, cls) => {
    el.classList.add(cls);
    classed.push([el, cls]);
  };
  const cleanup = () => {
    inserted.forEach((n) => n.remove());
    hidden.forEach((el) => {
      el.style.display = '';
    });
    classed.forEach(([el, cls]) => el.classList.remove(cls));
  };

  try {
    // Modified blocks: swap the live block for a before/after card.
    items.forEach((it, s) => {
      if (it.status !== 'modified') return;
      const el = srcToDom.get(s);
      if (!el) return;
      const card = isHeading(it.current)
        ? buildHeadingCard(styles, it.base, it.current, baseLabel, currentLabel)
        : buildCard(styles, it.base, it.current, baseLabel, currentLabel);
      el.after(card);
      inserted.push(card);
      el.style.display = 'none';
      hidden.push(el);
    });

    // Added blocks, split at heading boundaries. Each heading-led segment is a
    // whole new section: its blocks share one rail under a "New section" header.
    // Leading (non-heading) additions get per-block rails.
    const addedRuns = consecutiveRuns(
      items.map((it, i) => (it.status === 'added' ? i : -1)).filter((i) => i >= 0),
    );
    for (const run of addedRuns) {
      for (const seg of headingSegments(run, (i) => items[i].current)) {
        const els = seg.indices.map((i) => srcToDom.get(i)).filter(Boolean);
        if (els.length === 0) continue;

        if (seg.heading) {
          const header = document.createElement('div');
          header.className = styles.secAddHeader;
          header.dataset.versionDiff = 'card';
          const title = headingText(items[seg.indices[0]].current);
          header.textContent = title ? `✚ New section: ${title}` : '✚ New section';
          els[0].before(header);
          inserted.push(header);
          els.forEach((el, k) => {
            addClass(el, styles.secAdd);
            if (k === 0) addClass(el, styles.secFirst);
            if (k === els.length - 1) addClass(el, styles.secLast);
          });
        } else {
          els.forEach((el) => addClass(el, styles.railAdd));
        }
      }
    }

    // Place a removal next to the nearest block that *did* map to the DOM: after
    // the closest preceding matched block, else before the closest following
    // one. Only if the page has no matched block at all does it go to the top.
    const lastAfter = new Map();
    const anchorFor = (after) => {
      for (let s = after; s >= 0; s -= 1) {
        if (srcToDom.has(s)) return {node: lastAfter.get(s) ?? srcToDom.get(s), where: 'after', key: s};
      }
      for (let s = after + 1; s < items.length; s += 1) {
        if (srcToDom.has(s)) return {node: srcToDom.get(s), where: 'before', key: null};
      }
      return null;
    };

    // A deleted *section* (a heading-led removal run) is a whole section that
    // was removed from the base. It should sit at a section boundary in the
    // rendered page — after all content that now belongs to the preceding
    // section, right before the next rendered heading — rather than immediately
    // after `after`, which can land it mid-section when the new version added
    // trailing paragraphs to that section. Find the next rendered heading past
    // `after`, then anchor after the last matched block before it (so the card
    // precedes any "new section" chip too); fall back to before the heading,
    // then to the normal anchor.
    const sectionAnchorFor = (after) => {
      let nextHeading = -1;
      for (let s = after + 1; s < items.length; s += 1) {
        if (srcToDom.has(s) && isHeading(items[s].current)) {
          nextHeading = s;
          break;
        }
      }
      if (nextHeading > after) {
        for (let s = nextHeading - 1; s > after; s -= 1) {
          if (srcToDom.has(s)) {
            return {node: lastAfter.get(s) ?? srcToDom.get(s), where: 'after', key: s};
          }
        }
        return {node: srcToDom.get(nextHeading), where: 'before', key: null};
      }
      return anchorFor(after);
    };

    // Group consecutive removed base blocks, then split each run at heading
    // boundaries: a heading-led segment becomes one "Deleted section" card, a
    // leading segment a plain "Removed" card.
    const remByIndex = new Map(removals.map((r) => [r.baseIndex, r]));
    // NOTE: do not spread `remByIndex.keys()` — some build targets miscompile the
    // Map iterator spread into a single iterator object, collapsing all runs.
    // Derive sorted indices from the removals array directly.
    const remRuns = consecutiveRuns(
      removals.map((r) => r.baseIndex).sort((a, b) => a - b),
    );
    for (const run of remRuns) {
      for (const seg of headingSegments(run, (i) => remByIndex.get(i)?.base ?? '')) {
        const entries = seg.indices.map((i) => remByIndex.get(i)).filter(Boolean);
        if (entries.length === 0) continue;
        const card = buildRemovedCard(styles, entries.map((e) => e.base), baseLabel);
        const a = seg.heading
          ? sectionAnchorFor(entries[0].after)
          : anchorFor(entries[0].after);
        if (!a) container.prepend(card);
        else if (a.where === 'after') {
          a.node.after(card);
          lastAfter.set(a.key, card);
        } else {
          a.node.before(card);
        }
        inserted.push(card);
      }
    }

    return cleanup;
  } catch (err) {
    // A live-DOM feature must never break the page: undo any partial work.
    cleanup();
    // eslint-disable-next-line no-console
    console.error('[VersionDiff] annotation failed, highlights disabled:', err);
    return () => {};
  }
}
