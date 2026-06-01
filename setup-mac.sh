#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE="${1:-$HOME/llmwiki-workspace}"

check_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

check_cmd python3
check_cmd node

if command -v pnpm >/dev/null 2>&1; then
  NODE_CMD=pnpm
elif command -v npm >/dev/null 2>&1; then
  NODE_CMD=npm
else
  echo "Missing required command: pnpm or npm" >&2
  exit 1
fi

setup_python_env() {
  local dir="$1"
  local req="$2"
  local venv="$dir/.venv"

  if [ ! -d "$venv" ]; then
    python3 -m venv "$venv"
  fi
  "$venv/bin/python" -m pip install --upgrade pip
  "$venv/bin/python" -m pip install -r "$req"
}

mkdir -p "$WORKSPACE"

echo "Setting up API environment..."
setup_python_env "$ROOT_DIR/api" "$ROOT_DIR/api/requirements.txt"

echo "Setting up MCP environment..."
setup_python_env "$ROOT_DIR/mcp" "$ROOT_DIR/mcp/requirements.txt"

echo "Installing web dependencies..."
if [ "$NODE_CMD" = "pnpm" ]; then
  (cd "$ROOT_DIR/web" && pnpm install)
else
  (cd "$ROOT_DIR/web" && npm install)
fi

echo "Initializing and starting workspace: $WORKSPACE"
"$ROOT_DIR/llmwiki" open "$WORKSPACE"
