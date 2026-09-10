#!/usr/bin/env bash

set -euo pipefail

echo "== Harness Verification =="

run_if_present() {
  local script="$1"
  if npm run | grep -E "^[[:space:]]+$script$" >/dev/null 2>&1; then
    echo "== $script =="
    npm run "$script"
  else
    echo "skip: npm script '$script' not found"
  fi
}

if [[ -f package-lock.json ]]; then
  npm ci
fi

run_if_present lint
run_if_present typecheck
run_if_present test
run_if_present build

echo "VERIFICATION_PASS"
