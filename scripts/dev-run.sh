#!/usr/bin/env bash
#
# Reliable local dev runner for ADAPT Technologies.
#
# Starts the user-space PostgreSQL cluster (port 5433) and the Next.js dev
# server bound to 0.0.0.0:3000 so it is reachable in a browser.
#
# Preferred path: systemd --user services (adapt-pg.service, adapt-next.service).
# Those auto-start at boot (lingering enabled) and self-heal if either process
# dies. When they are not installed this script falls back to launching the
# dev server detached with setsid + nohup.
#
#   bash scripts/dev-run.sh start   start Postgres + dev server
#   bash scripts/dev-run.sh stop    stop the dev server (Postgres too with --all)
#   bash scripts/dev-run.sh status  show what is running
#   bash scripts/dev-run.sh restart restart the dev server
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-3000}"
HOST="${HOST:-0.0.0.0}"
PIDFILE="${PIDFILE:-/tmp/adapt-next.pid}"
LOGFILE="${LOGFILE:-/tmp/adapt-next.log}"
DATABASE_URL="${DATABASE_URL:-postgresql://adapt@127.0.0.1:5433/adapt_dev}"

# Prefer the systemd user units when they exist: systemd supervises the
# processes, restarts them on crash, and starts them at boot via lingering.
have_systemd() {
  command -v systemctl >/dev/null 2>&1 &&
    systemctl --user cat adapt-next.service >/dev/null 2>&1 &&
    systemctl --user cat adapt-pg.service >/dev/null 2>&1
}

wait_http() {
  for _ in $(seq 1 60); do
    if curl -s -o /dev/null "http://127.0.0.1:${PORT}/" 2>/dev/null; then
      return 0
    fi
    sleep 0.5
  done
  return 1
}

# --- systemd path -----------------------------------------------------------

sd_start() {
  systemctl --user start adapt-pg.service
  systemctl --user start adapt-next.service
  if wait_http; then
    echo "Dev server + Postgres running via systemd: http://127.0.0.1:${PORT}/"
  else
    echo "Started via systemd but http://127.0.0.1:${PORT}/ is not responding yet."
    echo "Check: journalctl --user -u adapt-next.service -n 40 --no-pager"
  fi
}

sd_stop() {
  systemctl --user stop adapt-next.service
  echo "Dev server stopped (systemd)."
  if [ "${1:-}" = "--all" ]; then
    systemctl --user stop adapt-pg.service
    echo "Postgres stopped (systemd)."
  fi
}

sd_status() {
  echo "adapt-pg.service:   $(systemctl --user is-active adapt-pg.service)"
  echo "adapt-next.service: $(systemctl --user is-active adapt-next.service)"
  if curl -s -o /dev/null "http://127.0.0.1:${PORT}/" 2>/dev/null; then
    echo "Dev server: running on http://127.0.0.1:${PORT}/."
  else
    echo "Dev server: not responding on http://127.0.0.1:${PORT}/."
  fi
}

# --- legacy fallback --------------------------------------------------------

# Kill every Next.js listener/dev process, including the "next-server" child
# whose process name does not match "node" (which is what makes naive
# killall node leave broken servers bound to the port).
kill_next() {
  pkill -9 -f "next-server" 2>/dev/null || true
  pkill -9 -f "next/dist/bin/next" 2>/dev/null || true
  pkill -9 -f "next dev" 2>/dev/null || true
  pkill -9 -f "next start" 2>/dev/null || true
  sleep 1
}

free_port() {
  if command -v fuser >/dev/null 2>&1; then
    fuser -k "${PORT}/tcp" 2>/dev/null || true
  fi
  if command -v lsof >/dev/null 2>&1; then
    lsof -ti "tcp:${PORT}" 2>/dev/null | xargs -r kill -9 2>/dev/null || true
  fi
  sleep 1
}

legacy_start() {
  kill_next
  free_port
  bash "$ROOT/scripts/dev-pg.sh" start
  cd "$ROOT"
  rm -f "$PIDFILE"
  setsid env DATABASE_URL="$DATABASE_URL" \
    nohup node "$ROOT/node_modules/next/dist/bin/next" dev \
    --port "$PORT" --hostname "$HOST" \
    < /dev/null > "$LOGFILE" 2>&1 &
  echo "$!" > "$PIDFILE"
  disown || true

  if wait_http; then
    echo "Dev server: http://127.0.0.1:${PORT}/  (log: ${LOGFILE})"
  else
    echo "Dev server did not respond; see ${LOGFILE}"
  fi
}

legacy_stop() {
  kill_next
  free_port
  rm -f "$PIDFILE"
  echo "Dev server stopped."
  if [ "${1:-}" = "--all" ]; then
    bash "$ROOT/scripts/dev-pg.sh" stop
  fi
}

legacy_status() {
  bash "$ROOT/scripts/dev-pg.sh" status
  if curl -s -o /dev/null "http://127.0.0.1:${PORT}/" 2>/dev/null; then
    echo "Dev server: running on http://127.0.0.1:${PORT}/."
  else
    echo "Dev server: not running."
  fi
}

# --- dispatch ---------------------------------------------------------------

ACTION="${1:-start}"
case "$ACTION" in
  start)   if have_systemd; then sd_start; else legacy_start; fi ;;
  stop)    if have_systemd; then sd_stop "${2:-}"; else legacy_stop "${2:-}"; fi ;;
  restart) if have_systemd; then sd_stop; sd_start; else legacy_stop; legacy_start; fi ;;
  status)  if have_systemd; then sd_status; else legacy_status; fi ;;
  *)
    echo "Usage: $0 {start|stop [--all]|restart|status}" >&2
    exit 1
    ;;
esac
