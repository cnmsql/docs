#!/usr/bin/env bash
#
# backfill-versions.sh
#
# One-time seeding of versioned_docs from existing operator release tags.
# For each tag it checks out that tag's docs/src and cuts a Docusaurus
# version named after the minor line (e.g. v0.5.0 -> 0.5).
#
# Usage:
#   OPERATOR_REPO=/path/to/cnmsql/cnmsql ./scripts/backfill-versions.sh v0.1.0 v0.2.0 v0.3.0 v0.4.0 v0.5.0
#
# Run from the website repo root. Requires `npm ci` to have run first.
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OPERATOR_REPO="${OPERATOR_REPO:?set OPERATOR_REPO to the operator repo path}"

if [ "$#" -eq 0 ]; then
  echo "usage: backfill-versions.sh <tag> [tag...]" >&2
  exit 1
fi

# Remember the operator's current ref so we can restore it afterwards.
ORIG_REF="$(git -C "$OPERATOR_REPO" rev-parse --abbrev-ref HEAD)"
[ "$ORIG_REF" = "HEAD" ] && ORIG_REF="$(git -C "$OPERATOR_REPO" rev-parse HEAD)"
restore() { git -C "$OPERATOR_REPO" checkout --quiet "$ORIG_REF"; }
trap restore EXIT

for tag in "$@"; do
  minor="$(echo "${tag#v}" | cut -d. -f1-2)"   # v0.5.0 -> 0.5
  echo "==> $tag (version $minor)"
  git -C "$OPERATOR_REPO" checkout --quiet "$tag"
  "$ROOT/scripts/sync-current.sh" "$OPERATOR_REPO/docs"
  npm --prefix "$ROOT" run docs:version "$minor"
done

echo "done. cut versions: $*"
echo "current/ is left at the last tag's content; the release/update workflow will overwrite it from main."
