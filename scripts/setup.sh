#!/usr/bin/env bash
# One-shot local setup: env files, JWT secrets, installs, Postgres, migrate, then
# run the client and server. Ctrl+C stops both processes.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLIENT="$ROOT/client"
SERVER="$ROOT/server"
CLIENT_URL="http://localhost:5173"
SERVER_URL="http://localhost:3000"

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

copy_env_if_missing() {
  local example="$1"
  local dest="$2"

  if [[ -f "$dest" ]]; then
    echo "Keeping existing ${dest#"$ROOT/"}"
    return
  fi

  cp "$example" "$dest"
  echo "Created ${dest#"$ROOT/"} from $(basename "$example")"
}

env_value() {
  local file="$1"
  local key="$2"
  local line=""

  line="$(grep -E "^${key}=" "$file" | tail -n 1 || true)"
  printf '%s' "${line#*=}"
}

is_blank() {
  local value="$1"

  value="${value#\"}"
  value="${value%\"}"
  value="${value#\'}"
  value="${value%\'}"
  [[ -z "${value//[[:space:]]/}" ]]
}

set_env_value() {
  local file="$1"
  local key="$2"
  local value="$3"
  local tmp

  tmp="$(mktemp)"
  if grep -qE "^${key}=" "$file"; then
    awk -v key="$key" -v value="$value" '
      index($0, key "=") == 1 { print key "=" value; next }
      { print }
    ' "$file" >"$tmp"
    mv "$tmp" "$file"
  else
    printf '%s=%s\n' "$key" "$value" >>"$file"
    rm -f "$tmp"
  fi
}

ensure_jwt_secrets() {
  local file="$SERVER/.env"
  local access game

  access="$(env_value "$file" JWT_ACCESS_TOKEN_SECRET)"
  game="$(env_value "$file" JWT_GAME_SESSION_SECRET)"

  if is_blank "$access"; then
    access="$(openssl rand -hex 32)"
    set_env_value "$file" JWT_ACCESS_TOKEN_SECRET "$access"
    echo "Generated JWT_ACCESS_TOKEN_SECRET"
  fi

  if is_blank "$game"; then
    game="$(openssl rand -hex 32)"
    while [[ "$game" == "$access" ]]; do
      game="$(openssl rand -hex 32)"
    done
    set_env_value "$file" JWT_GAME_SESSION_SECRET "$game"
    echo "Generated JWT_GAME_SESSION_SECRET"
  fi
}

wait_for_http() {
  local url="$1"
  local name="$2"
  local i

  for ((i = 1; i <= 60; i++)); do
    if curl -sf -o /dev/null --connect-timeout 1 "$url"; then
      echo "$name is ready at $url"
      return 0
    fi
    sleep 0.5
  done

  echo "Timed out waiting for $name at $url" >&2
  return 1
}

open_browser() {
  local url="$1"

  if command -v open >/dev/null 2>&1; then
    open "$url"
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$url"
  else
    echo "Open $url in a browser"
  fi
}

stop_tree() {
  local pid="$1"
  local child

  if [[ -z "$pid" ]] || ! kill -0 "$pid" 2>/dev/null; then
    return
  fi

  while read -r child; do
    [[ -n "$child" ]] && stop_tree "$child"
  done < <(pgrep -P "$pid" 2>/dev/null || true)

  kill "$pid" 2>/dev/null || true
}

cleanup() {
  trap - EXIT INT TERM
  stop_tree "${SERVER_PID:-}"
  stop_tree "${CLIENT_PID:-}"
}

if [[ ! -d "$CLIENT" || ! -d "$SERVER" ]]; then
  echo "Expected client/ and server/ next to this script's parent directory." >&2
  exit 1
fi

require_command node
require_command npm
require_command docker
require_command openssl
require_command curl

if ! docker info >/dev/null 2>&1; then
  echo "Docker is installed but the daemon is not running. Start Docker Desktop and retry." >&2
  exit 1
fi

echo "==> Preparing environment files"
copy_env_if_missing "$SERVER/.env.example" "$SERVER/.env"
copy_env_if_missing "$CLIENT/.env.example" "$CLIENT/.env"
ensure_jwt_secrets

client_origin="$(env_value "$SERVER/.env" CLIENT_ORIGIN)"
if ! is_blank "$client_origin"; then
  CLIENT_URL="$client_origin"
fi

echo "==> Installing dependencies"
npm install --prefix "$CLIENT"
npm install --prefix "$SERVER"

echo "==> Starting Postgres and applying migrations"
(
  cd "$SERVER"
  docker compose up -d --wait --wait-timeout 60
  npm run db:migrate
)

echo "==> Starting app"
trap cleanup EXIT INT TERM

npm run dev --prefix "$SERVER" &
SERVER_PID=$!
npm run dev --prefix "$CLIENT" &
CLIENT_PID=$!

wait_for_http "$SERVER_URL" "Server"
wait_for_http "$CLIENT_URL" "Client"
open_browser "$CLIENT_URL"

echo "ClickRush is running. Press Ctrl+C to stop the client and server."
wait "$SERVER_PID" "$CLIENT_PID"
