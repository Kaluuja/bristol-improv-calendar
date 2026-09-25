# Running the sync on Dockhead

The sync runs on Dockhead, not GitHub Actions. Bristol Old Vic, Hen & Chicken and Eventbrite all block GitHub's servers, but not a home connection. Dockhead is also already on UK time, and it's where Echo's morning brief picks up approvals and problems.

## What's where

| Thing | Where |
| --- | --- |
| Checkout of this repo (public; `git pull` every run) | `/home/ste/improv-calendar/` |
| Secrets for the sync, the Alma scraper and the brief: `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID` (mode 600). Optional `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` for instant alerts; currently blank. | `/home/ste/improv-calendar.env` |
| Sync log (self-trims at 5MB) | `/home/ste/improv-calendar-sync.log` |
| Alma scraper log | `/home/ste/improv-alma/scrape.log` |
| Status files: `sync-health.json`, `*.alert`, failure counters | `/home/ste/.local/state/improv-alerts/` |
| What Echo reads | `/home/hermes/vault/context/improv-pending.md` |

`crontab -l` as `ste`:

```
# 05:30 daily sync (before the 06:00 UTC export and the 06:45 brief)
30 5 * * * /home/ste/improv-calendar/sync/dockhead/alert-on-failure.sh "Improv calendar sync" 1 /home/ste/improv-calendar/sync/dockhead/run-sync.sh >> /home/ste/improv-calendar-sync.log 2>&1 # improv-calendar sync

# 06:45 daily: approvals + problems into Echo's 07:00 morning brief
45 6 * * * python3 /home/ste/improv-calendar/sync/dockhead/morning_brief.py | sudo -n -u hermes tee /home/hermes/vault/context/improv-pending.md > /dev/null 2>> /home/ste/improv-alma/pending-brief.log # improv-alma pending brief

# Alma scraper, Mon + Thu. Alerts after 2 failures in a row (Cloudflare fails it now and then)
15 7 * * 1,4 /home/ste/improv-calendar/sync/dockhead/alert-on-failure.sh "Alma scraper" 2 docker run --rm --ipc=host --env-file /home/ste/improv-calendar.env alma-scraper >> /home/ste/improv-alma/scrape.log 2>&1 # improv-alma scraper
```

`run-sync.sh` does `git pull`, then runs `npm ci && npm test && npm run sync` inside a `node:24-slim` container (Dockhead has Docker, not Node). **Code changes deploy themselves:** push to `main` and the next morning's run uses them. The exception is the Alma scraper, which runs from a Docker image. After changing `sync/alma-scraper/`, rebuild it:

```
docker build -t alma-scraper ~/improv-calendar/sync/alma-scraper
```

## How you hear about problems

Everything comes through **Echo's morning brief**. `morning_brief.py` writes an "Improv calendar" section with:

- **Waiting for approval**: Pending events, with a link to Airtable where you approve or reject them (set `Status`)
- **Problems**, only when there are any:
  - a source erroring or returning no events (from the sync's health report, `sync-health.json`)
  - events taken off the calendar because no source has listed them for 14 days
  - the sync or Alma scraper crashing (`*.alert` files from `alert-on-failure.sh`; the Alma one needs 2 failures in a row)
  - the sync not having reported for 36 hours

**If Dockhead itself is down**, there's no brief at all. The daily export on GitHub then fails its "Check the Dockhead sync is still running" step once Airtable hasn't been refreshed for 3 days, and GitHub emails you.

Sources known to be broken (`KNOWN_BROKEN` in `sync/src/health.ts`) are left out of the brief.

**Want instant alerts instead?** Fill in `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in the env file (e.g. the Improv Calendar bot's token from @BotFather; press Start in that bot's chat first). Problems then also arrive as Telegram messages when they happen. Nothing else changes.

## Everyday commands

```
tail -50 ~/improv-calendar-sync.log                          # last sync
python3 ~/improv-calendar/sync/dockhead/morning_brief.py     # preview what Echo will see
~/improv-calendar/sync/dockhead/run-sync.sh                  # sync now (writes to Airtable)
```

**Pausing:** comment out the cron line (`crontab -e`). The GitHub `Sync Events to Airtable` workflow can be run by hand as a fallback (Actions → Run workflow), but it can't reach the three blocked venues. Don't run both at once, or you'll get duplicate Airtable records.

**Rebuilding from scratch:**
1. `git clone https://github.com/Kaluuja/bristol-improv-calendar.git ~/improv-calendar`
2. Create `~/improv-calendar.env` (mode 600, keys above).
3. `docker pull node:24-slim`, then the `docker build` line above.
4. Add the three cron lines.

The brief line needs `ste` to be allowed `sudo -u hermes tee` (already set up).
