#!/usr/bin/env bash
#
# User-space PostgreSQL 18 cluster for local ADAPT Technologies development.
# Data lives under ~/.local/share/adapt-pg, socket under /tmp/adapt-pg, port 5433.
# This mirrors the standard system cluster but does NOT require sudo.
#
#   bash scripts/dev-pg.sh start   start the cluster (if not running)
#   bash scripts/dev-pg.sh stop    stop the cluster (graceful)
#   bash scripts/dev-pg.sh status  show cluster status
#   bash scripts/dev-pg.sh create  create the adapt role + databases (idempotent)
#
set -euo pipefail

PGDATA="${PGDATA:-$HOME/.local/share/adapt-pg}"
PGSOCKET="${PGSOCKET:-/tmp/adapt-pg}"
PGPORT="${PGPORT:-5433}"

# Prefer a local PostgreSQL binary; fall back to PATH.
if command -v "/usr/lib/postgresql/18/bin/pg_ctl" >/dev/null 2>&1; then
  PGBIN="/usr/lib/postgresql/18/bin"
elif command -v pg_ctl >/dev/null 2>&1; then
  PGBIN="$(dirname "$(command -v pg_ctl)")"
else
  echo "ERROR: PostgreSQL binaries not found. Install postgresql 18." >&2
  exit 1
fi

PGCTL="$PGBIN/pg_ctl"
PSQL="$PGBIN/psql"

start() {
  if [ -f "$PGDATA/postmaster.pid" ] && kill -0 "$(head -n1 "$PGDATA/postmaster.pid")" 2>/dev/null; then
    echo "PostgreSQL already running on port $PGPORT."
    return 0
  fi
  mkdir -p "$PGSOCKET"
  if [ ! -f "$PGDATA/PG_VERSION" ]; then
    echo "Initializing cluster at $PGDATA ..."
    "$PGBIN/initdb" -D "$PGDATA" -U "$USER" -A trust >/dev/null
  fi
  "$PGCTL" -D "$PGDATA" -l "$PGDATA/server.log" \
    -o "-k $PGSOCKET -p $PGPORT -c listen_addresses=127.0.0.1" \
    start >/dev/null
  echo "PostgreSQL started on 127.0.0.1:$PGPORT (socket $PGSOCKET)."
}

stop() {
  if [ -f "$PGDATA/postmaster.pid" ] && kill -0 "$(head -n1 "$PGDATA/postmaster.pid")" 2>/dev/null; then
    "$PGCTL" -D "$PGDATA" stop -m fast >/dev/null
    echo "PostgreSQL stopped."
  else
    echo "PostgreSQL is not running."
  fi
}

status() {
  if [ -f "$PGDATA/postmaster.pid" ] && kill -0 "$(head -n1 "$PGDATA/postmaster.pid")" 2>/dev/null; then
    echo "Running on 127.0.0.1:$PGPORT."
  else
    echo "Not running."
  fi
}

create() {
  start
  "$PSQL" -h "$PGSOCKET" -U "$USER" -d postgres -v ON_ERROR_STOP=1 <<'SQL'
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'adapt') THEN
    CREATE ROLE adapt LOGIN;
  END IF;
END
$$;
SQL
  for db in adapt_dev adapt_test; do
    if ! "$PSQL" -h "$PGSOCKET" -U "$USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$db'" | grep -q 1; then
      "$PSQL" -h "$PGSOCKET" -U "$USER" -d postgres -c "CREATE DATABASE $db OWNER adapt;"
      echo "Created database $db (owner: adapt)."
    fi
  done
}

case "${1:-status}" in
  start) start ;;
  stop) stop ;;
  status) status ;;
  create) create ;;
  *)
    echo "Usage: $0 {start|stop|status|create}" >&2
    exit 1
    ;;
esac