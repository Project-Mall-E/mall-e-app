#!/usr/bin/env bash
# Sync React Native agent skills from vercel-labs/agent-skills into .agents/react-native-skills.
# Run from repo root: ./scripts/sync-react-native-skills.sh [ref]
# Ref defaults to 'main'. Use a tag or commit SHA to pin.
set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TARGET_DIR="$REPO_ROOT/.agents/react-native-skills"
REF="${1:-main}"
UPSTREAM_REPO="https://github.com/vercel-labs/agent-skills.git"
TMP_DIR=$(mktemp -d)

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

echo "Fetching react-native-skills from agent-skills@${REF}..."
git clone --depth 1 --branch "$REF" "$UPSTREAM_REPO" "$TMP_DIR" 2>/dev/null || {
  # Branch might not exist for shallow clone; try fetching without branch
  git clone --depth 1 "$UPSTREAM_REPO" "$TMP_DIR"
  (cd "$TMP_DIR" && git fetch --depth 1 origin "$REF" && git checkout "$REF")
}

SRC="$TMP_DIR/skills/react-native-skills"
if [[ ! -d "$SRC" ]]; then
  echo "Error: skills/react-native-skills not found in upstream repo." >&2
  exit 1
fi

mkdir -p "$REPO_ROOT/.agents"
rm -rf "$TARGET_DIR"
cp -R "$SRC" "$TARGET_DIR"

COMMIT=$(cd "$TMP_DIR" && git rev-parse HEAD)
echo "$REF $COMMIT" > "$TARGET_DIR/.source"
echo "Synced to $TARGET_DIR (upstream $REF @ $COMMIT)."
