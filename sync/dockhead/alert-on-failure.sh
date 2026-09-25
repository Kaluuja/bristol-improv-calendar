#!/usr/bin/env bash
# Usage: alert-on-failure.sh "<label>" <failures-before-alert> <command...>
#
# Runs the command (output passes straight through to cron's log). If it
# fails <n> times in a row, sends a Telegram message with the last few lines,
# then a reminder every 7 further failures. Success resets the count.
#
# Exit code 3 means "ran, and already sent its own alert" (the sync's health
# report), so it isn't alerted twice.
#
# Telegram credentials come from TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID in
# /home/ste/improv-calendar.env. Without them it just logs.
set -uo pipefail

ENV_FILE=/home/ste/improv-calendar.env
STATE_DIR=/home/ste/.local/state/improv-alerts

main() {
  local label=$1 threshold=$2; shift 2
  local state="$STATE_DIR/$(printf '%s' "$label" | tr -c 'a-zA-Z0-9' '-')"
  local out; out=$(mktemp)
  mkdir -p "$STATE_DIR"

  echo "=== $label: start $(date '+%F %T %Z')"
  "$@" 2>&1 | tee "$out"
  local code=${PIPESTATUS[0]}
  echo "=== $label: exit $code at $(date '+%T')"

  if [ "$code" -eq 0 ] || [ "$code" -eq 3 ]; then
    rm -f "$state" "$out"
    return "$code"
  fi

  local count=$(( $(cat "$state" 2>/dev/null || echo 0) + 1 ))
  echo "$count" > "$state"

  if [ "$count" -ge "$threshold" ] && [ $(( (count - threshold) % 7 )) -eq 0 ]; then
    local tail_lines
    tail_lines=$(grep -vE 'keysym|xkbcomp|^>|^\s*$' "$out" | tail -n 8)
    send "⚠️ $label failed ($count in a row, exit $code) on Dockhead.

$tail_lines"
  fi
  rm -f "$out"
  return "$code"
}

send() {
  local token="" chat=""
  if [ -r "$ENV_FILE" ]; then
    token=$(grep -E '^TELEGRAM_BOT_TOKEN=' "$ENV_FILE" | cut -d= -f2-)
    chat=$(grep -E '^TELEGRAM_CHAT_ID=' "$ENV_FILE" | cut -d= -f2-)
  fi
  if [ -z "$token" ] || [ -z "$chat" ]; then
    echo "(alert not sent: Telegram not configured in $ENV_FILE)"
    return 0
  fi
  curl -sS -o /dev/null -w "Telegram alert: HTTP %{http_code}\n" \
    "https://api.telegram.org/bot$token/sendMessage" \
    --data-urlencode "chat_id=$chat" --data-urlencode "text=$1" \
    -d disable_web_page_preview=true
}

main "$@"; exit $?
