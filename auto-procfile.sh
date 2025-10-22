#!/usr/bin/env bash
set -euo pipefail

echo "Running npm ci..."
npm ci

echo "Running npm run build..."
npm run build

candidates=(
  "dist/main.js"
  "dist/server.js"
  "dist/index.js"
)

found=""
for candidate in "${candidates[@]}"; do
  if [[ -f "$candidate" ]]; then
    found="$candidate"
    break
  fi
done

if [[ -z "$found" ]]; then
  mapfile -t files < <(find dist -type f -name '*.js' -regex '.*(server|main)\\.js$' | sort)
  if [[ ${#files[@]} -gt 0 ]]; then
    found="${files[0]}"
  fi
fi

if [[ -z "$found" ]]; then
  mapfile -t listen_files < <(grep -RIl --include='*.js' '\\.listen(' dist | sort)
  if [[ ${#listen_files[@]} -gt 0 ]]; then
    found="${listen_files[0]}"
  fi
fi

if [[ -z "$found" ]]; then
  echo "No suitable server entry file found in dist/" >&2
  exit 1
fi

procfile_path="Procfile"
echo "web: node $found" > "$procfile_path"

echo "Procfile updated with entry: web: node $found"
posix_path="$found"
echo "Local test command: node ./$(printf '%s' "$posix_path")"
