#!/usr/bin/env bash
# Usage: alert-on-failure.sh "<label>" <failures-before-alert> <command...>
#
# Runs the command (output passes straight through to cron's log). Once it
# has failed <n> times in a row, it raises an alert: writes
# <STATE_DIR>/<label>.alert, which morning_brief.py puts in Echo's morning
# brief (and sends Telegram too, if configured). Success clears the alert
# and the failure count.
#
# Exit code 3 means "ran, and already reported its own problems" (the sync's
# health report), so it isn't alerted twice.
set -uo pipefail

ENV_FILE=/home/ste/improv-calendar.env
STATE_DIR=/home/ste/.local/state/improv-alerts

main() {
  local label=$1 threshold=$2; shift 2
  local slug; slug=$(printf '%s' "$label" | tr -c 'a-zA-Z0-9' '-')
  local count_file="$STATE_DIR/$slug.failures" alert_file="$STATE_DIR/$slug.alert"
  local out; out=$(mktemp)
  mkdir -p "$STATE_DIR"

  echo "=== $label: start $(date '+%F %T %Z')"
  "$@" 2>&1 | tee "$out"
  local code=${PIPESTATUS[0]}
  echo "=== $label: exit $code at $(date '+%T')"

  if [ "$code" -eq 0 ] || [ "$code" -eq 3 ]; then
    rm -f "$count_file" "$alert_file" "$out"
    return "$code"
  fi

  local count=$(( $(cat "$count_file" 2>/dev/null || echo 0) + 1 ))
  echo "$count" > "$count_file"

  if [ "$count" -ge "$threshold" ]; then
    local tail_lines
    tail_lines=$(grep -vE 'keysym|xkbcomp|^>|^\s*$' "$out" | tail -n 5)
    local message="$label failed $count time(s) in a row (last: $(date '+%a %d %b %H:%M'), exit $code). Last output:
$tail_lines"
    printf '%s\n' "$message" > "$alert_file"
    # Optional instant ping; only on first crossing, then weekly-ish reminders
    if [ $(( (count - threshold) % 7 )) -eq 0 ]; then send_telegram "⚠️ $message"; fi
  fi
  rm -f "$out"
  return "$code"
}

send_telegram() {
  local token="" chat=""
  if [ -r "$ENV_FILE" ]; then
    token=$(grep -E '^TELEGRAM_BOT_TOKEN=' "$ENV_FILE" | cut -d= -f2-)
    chat=$(grep -E '^TELEGRAM_CHAT_ID=' "$ENV_FILE" | cut -d= -f2-)
  fi
  [ -n "$token" ] && [ -n "$chat" ] || return 0
  curl -sS -o /dev/null -w "Telegram alert: HTTP %{http_code}\n" \
    "https://api.telegram.org/bot$token/sendMessage" \
    --data-urlencode "chat_id=$chat" --data-urlencode "text=$1" \
    -d disable_web_page_preview=true
}

main "$@"; exit $?
