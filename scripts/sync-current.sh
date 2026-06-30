#!/usr/bin/env bash
#
# sync-current.sh <operator-docs-dir>
#
# Pulls authored documentation from the operator repo (cnmsql/cnmsql) into the
# website repo. The website never authors content itself:
#   <docs-dir>/src/*.md   -> ./current/      (page content)
#   <docs-dir>/sidebars.js -> ./sidebars.js  (navigation, authored with content)
#
# Theme/chrome (docusaurus.config.js, src/css, static) is owned by the website
# repo and is NOT pulled.
#
set -euo pipefail

DOCS="${1:?usage: sync-current.sh <operator-docs-dir>}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DST="$ROOT/current"

if [ ! -d "$DOCS/src" ]; then
  echo "error: $DOCS/src not found" >&2
  exit 1
fi

mkdir -p "$DST"
# Clean stale content but keep the directory itself.
find "$DST" -mindepth 1 -maxdepth 1 -exec rm -rf {} +

# Copy authored markdown and co-located doc assets; never copy theme css.
rsync -a --exclude 'css/' "$DOCS/src"/ "$DST"/

# Navigation lives with the content.
if [ -f "$DOCS/sidebars.js" ]; then
  cp "$DOCS/sidebars.js" "$ROOT/sidebars.js"
fi

echo "synced $(find "$DST" -name '*.md' | wc -l | tr -d ' ') markdown files into current/"
