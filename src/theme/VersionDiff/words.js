import {diffWordsWithSpace} from 'diff';

const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

// Word-level redline between two plain-text strings, returned as a pair of HTML
// fragments: `before` marks deletions, `after` marks insertions. `delClass` and
// `insClass` are CSS-module class names supplied by the caller.
export function wordDiffHtml(before, after, delClass, insClass) {
  const parts = diffWordsWithSpace(before ?? '', after ?? '');
  let beforeHtml = '';
  let afterHtml = '';
  for (const p of parts) {
    const text = escapeHtml(p.value);
    if (p.added) {
      afterHtml += `<mark class="${insClass}">${text}</mark>`;
    } else if (p.removed) {
      beforeHtml += `<mark class="${delClass}">${text}</mark>`;
    } else {
      beforeHtml += text;
      afterHtml += text;
    }
  }
  return {beforeHtml, afterHtml};
}
