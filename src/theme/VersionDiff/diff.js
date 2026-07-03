import {diffLines} from 'diff';

// Number of unchanged lines kept as context around each change; larger runs of
// unchanged lines are folded into a single "gap" marker (GitHub-style).
const CONTEXT = 3;

function toLines(value) {
  const lines = value.split('\n');
  // A trailing newline yields a spurious empty final element; drop it.
  if (lines.length && lines[lines.length - 1] === '') {
    lines.pop();
  }
  return lines;
}

/**
 * Turn two strings into a flat list of rows for rendering:
 *   {type: 'add' | 'del' | 'ctx', text}
 *   {type: 'gap', count}   // N folded unchanged lines
 */
export function buildDiffRows(oldStr, newStr) {
  const parts = diffLines(oldStr ?? '', newStr ?? '');
  const rows = [];

  parts.forEach((part, i) => {
    if (part.added || part.removed) {
      const type = part.added ? 'add' : 'del';
      for (const text of toLines(part.value)) {
        rows.push({type, text});
      }
      return;
    }

    // Unchanged block: keep only context near an adjacent change, fold the rest.
    const lines = toLines(part.value);
    const hasBefore = i > 0;
    const hasAfter = i < parts.length - 1;
    const head = hasBefore ? CONTEXT : 0;
    const tail = hasAfter ? CONTEXT : 0;

    if (lines.length <= head + tail) {
      for (const text of lines) {
        rows.push({type: 'ctx', text});
      }
      return;
    }

    lines.slice(0, head).forEach((text) => rows.push({type: 'ctx', text}));
    rows.push({type: 'gap', count: lines.length - head - tail});
    lines
      .slice(lines.length - tail)
      .forEach((text) => rows.push({type: 'ctx', text}));
  });

  return rows;
}

export function countChanges(rows) {
  let added = 0;
  let removed = 0;
  for (const row of rows) {
    if (row.type === 'add') added += 1;
    else if (row.type === 'del') removed += 1;
  }
  return {added, removed};
}
