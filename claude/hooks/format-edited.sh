#!/usr/bin/env bash
# Formats the file that was just edited with the project's local Prettier.
#
# Why this exists: without it, every change becomes an "edit -> run lint ->
# find a quote style issue -> edit again" cycle. Formatting should never cost
# a reasoning turn.
#
# Adapted from ai-dev-standards: jq is not installed on this machine, so the
# payload is parsed with node (always present in this repo) when jq is absent.
#
# Silent by contract: a failure here must never interrupt the agent's work.
set -uo pipefail

payload=$(cat)

if command -v jq >/dev/null 2>&1; then
  file=$(printf '%s' "$payload" | jq -r '.tool_input.file_path // empty' 2>/dev/null)
elif command -v node >/dev/null 2>&1; then
  file=$(printf '%s' "$payload" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{process.stdout.write(JSON.parse(s).tool_input?.file_path||"")}catch{}})' 2>/dev/null)
else
  exit 0
fi

[ -n "$file" ] || exit 0
[ -f "$file" ] || exit 0

case "$file" in
  *.ts | *.tsx | *.js | *.jsx | *.mjs | *.cjs | *.json | *.md | *.yml | *.yaml) ;;
  *) exit 0 ;;
esac

root="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null)}"
[ -n "$root" ] || exit 0
[ -x "$root/node_modules/.bin/prettier" ] || exit 0

# --ignore-unknown respects .prettierignore (generated files, lockfiles, ...).
(cd "$root" && ./node_modules/.bin/prettier --write --ignore-unknown "$file") >/dev/null 2>&1

exit 0
