# CNMSQL documentation website

Versioned documentation site for [cnmsql/cnmsql](https://github.com/cnmsql/cnmsql),
built with [Docusaurus](https://docusaurus.io/) and published to GitHub Pages.

## How it works

Documentation **content is authored in the operator repo** (`cnmsql/cnmsql`,
under `docs/src/` with navigation in `docs/sidebars.js`) so it is reviewed
alongside the code. This repo owns the **website chrome** (theme, config,
static assets) and the **generated version snapshots**.

```
operator release  ──repository_dispatch──▶  this repo: pull tag, cut version, deploy
operator main docs ─repository_dispatch──▶  this repo: refresh "next", deploy
```

- `current/` — the unreleased **next** docs, synced from operator `main`. Not authored here.
- `versioned_docs/version-X.Y/` + `versioned_sidebars/` — frozen snapshots, one per
  operator **minor** release. Each version keeps its own content *and* sidebar.
- `versions.json` — the list of published versions (newest first).

The version dropdown shows every released version plus `next`.

## Triggers (`.github/workflows/release-docs.yml`)

| Event | Source | Action |
|-------|--------|--------|
| `repository_dispatch: docs-release` | operator release published | cut `version-X.Y`, commit, deploy |
| `repository_dispatch: docs-update` | operator push to `main` (docs) | refresh `current`, commit, deploy |
| `workflow_dispatch` | manual | pull a given ref; cut a version if one is provided |

## Local development

```bash
npm ci
npm start        # dev server (current/next docs + versions)
npm run build    # production build
npm run serve    # serve the production build
```

## License

Documentation content is licensed under
[Creative Commons Attribution 4.0 International (CC BY 4.0)](LICENSE) — the
CNCF-standard documentation license. The operator code in `cnmsql/cnmsql` is
licensed separately under Apache-2.0.
