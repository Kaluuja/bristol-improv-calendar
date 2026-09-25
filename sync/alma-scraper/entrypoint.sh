#!/bin/sh
# Start a bare Xvfb (no auth cookie - xvfb-run's Xauthority handling broke
# Chromium's display connection; -ac is safe as the server listens on nothing
# and lives only inside this container), then run the scraper against it.
Xvfb :99 -screen 0 1366x850x24 -ac -nolisten tcp &
export DISPLAY=:99
sleep 2
exec node /app/scrape.mjs
