#!/usr/bin/env bash
# Daily sync on Dockhead: update this checkout, then test + sync inside a
# throwaway Node container (Dockhead has Docker but no Node). Run from cron
# via alert-on-failure.sh - see sync/dockhead/README.md.
#
# Everything is inside main() so bash reads the whole file before `git pull`
# can rewrite it mid-run.
set -uo pipefail

REPO=/home/ste/improv-calendar
ENV_FILE=/home/ste/improv-calendar.env
LOG=/home/ste/improv-calendar-sync.log

main() {
  # Keep the log to ~5MB. Rewrite in place (not mv) so cron's open >> handle stays valid.
  if [ -f "$LOG" ] && [ "$(stat -c%s "$LOG")" -gt 5000000 ]; then
    tail -n 20000 "$LOG" > "$LOG.tmp" && cat "$LOG.tmp" > "$LOG" && rm -f "$LOG.tmp"
  fi

  cd "$REPO" || return 1
  git pull -q --ff-only || { echo "git pull failed"; return 1; }
  echo "code: $(git log --oneline -1)"

  docker run --rm --user "$(id -u):$(id -g)" \
    -e HOME=/tmp -e TZ=Europe/London -e NPM_CONFIG_UPDATE_NOTIFIER=false \
    --env-file "$ENV_FILE" \
    -v "$REPO/sync:/app" -w /app \
    node:24-slim \
    sh -c 'npm ci --no-audit --no-fund --loglevel=error && npm test && npm run sync -- --verbose'
}

main "$@"; exit $?
