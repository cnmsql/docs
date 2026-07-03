// @ts-check
const fs = require('fs');
const path = require('path');

// Emits, for every doc that exists in more than one version, a small JSON file
//   static/versiondiff/<docId>.json
// holding that doc's raw markdown in each version it appears in. The client-side
// <VersionDiff> component fetches these lazily (only when the reader opens the
// diff panel) so per-page bundles stay small even though api-reference.md is big.
//
// Version content lives in two places, mirroring the docs plugin config:
//   ./current/*.md                    -> the unreleased "next" docs (name "current")
//   ./versioned_docs/version-X.Y/*.md -> released snapshots (name "X.Y")

const OUT_DIR = path.join('static', 'versiondiff');

// Docs excluded from the version-diff feature. api-reference is auto-generated
// from the operator's CRDs: it is huge (~100 KB) and made of near-identical
// tables, so a block diff is both noisy and heavy — not worth shipping.
const EXCLUDE = new Set(['api-reference']);

// Strip a leading YAML frontmatter block so diffs show prose, not metadata.
function stripFrontmatter(raw) {
  const m = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/.exec(raw);
  return m ? raw.slice(m[0].length).replace(/^\s+/, '') : raw;
}

function readDocsDir(dir) {
  /** @type {Record<string, string>} */
  const docs = {};
  if (!fs.existsSync(dir)) {
    return docs;
  }
  for (const entry of fs.readdirSync(dir)) {
    if (!entry.endsWith('.md') && !entry.endsWith('.mdx')) {
      continue;
    }
    const docId = entry.replace(/\.mdx?$/, '');
    docs[docId] = stripFrontmatter(
      fs.readFileSync(path.join(dir, entry), 'utf8'),
    );
  }
  return docs;
}

/** @type {import('@docusaurus/types').PluginModule} */
module.exports = function versionDiffPlugin(context) {
  const {siteDir} = context;

  return {
    name: 'version-diff-data',

    // Regenerate when any source markdown changes (dev hot-reload).
    getPathsToWatch() {
      return [
        path.join(siteDir, 'current', '**', '*.{md,mdx}'),
        path.join(siteDir, 'versioned_docs', '**', '*.{md,mdx}'),
      ];
    },

    async loadContent() {
      // Order newest -> oldest: unreleased "next" first, then versions.json order.
      const versionsPath = path.join(siteDir, 'versions.json');
      const released = fs.existsSync(versionsPath)
        ? JSON.parse(fs.readFileSync(versionsPath, 'utf8'))
        : [];

      /** @type {{name: string, label: string, dir: string}[]} */
      const versions = [
        {name: 'current', label: 'next', dir: path.join(siteDir, 'current')},
        ...released.map((v) => ({
          name: String(v),
          label: String(v),
          dir: path.join(siteDir, 'versioned_docs', `version-${v}`),
        })),
      ];

      // docId -> ordered [{name, label, content}]
      /** @type {Record<string, {name: string, label: string, content: string}[]>} */
      const byDoc = {};
      for (const version of versions) {
        const docs = readDocsDir(version.dir);
        for (const [docId, content] of Object.entries(docs)) {
          (byDoc[docId] ??= []).push({
            name: version.name,
            label: version.label,
            content,
          });
        }
      }

      const outDir = path.join(siteDir, OUT_DIR);
      fs.rmSync(outDir, {recursive: true, force: true});
      fs.mkdirSync(outDir, {recursive: true});

      let written = 0;
      for (const [docId, entries] of Object.entries(byDoc)) {
        // Nothing to diff against if the doc exists in a single version.
        if (entries.length < 2 || EXCLUDE.has(docId)) {
          continue;
        }
        fs.writeFileSync(
          path.join(outDir, `${docId}.json`),
          JSON.stringify({docId, versions: entries}),
        );
        written += 1;
      }

      return {written};
    },
  };
};
