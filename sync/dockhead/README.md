# Running the sync on Dockhead

The scheduled sync runs on Dockhead, not GitHub Actions. Bristol Old Vic, Hen & Chicken and Eventbrite all block GitHub's servers, but not a home connection. Dockhead is also already on UK time and already runs the [Alma scraper](../alma-scraper/README.md).

## What's set up (25 Sept 2026)

| Thing | Where |
| --- | --- |
| Checkout of this repo (public, pulled fresh every run) | `/home/ste/improv-calendar/` |
| Secrets: `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` (mode 600) | `/home/ste/improv-calendar.env` |
| Sync log (self-trims at 5MB) | `/home/ste/improv-calendar-sync.log` |
| Alma log | `/home/ste/improv-alma/scrape.log` |
| Failure counters for alerts | `/home/ste/.local/state/improv-alerts/` |

`crontab -l` as `ste`:

```
# Daily sync at 05:30, before the 06:00 UTC export and the 06:45 morning brief
30 5 * * * /home/ste/improv-calendar/sync/dockhead/alert-on-failure.sh "Improv calendar sync" 1 /home/ste/improv-calendar/sync/dockhead/run-sync.sh >> /home/ste/improv-calendar-sync.log 2>&1 # improv-calendar sync

# Alma scraper, Mon + Thu. Alerts after 2 failures in a row (Cloudflare fails it now and then)
15 7 * * 1,4 /home/ste/improv-calendar/sync/dockhead/alert-on-failure.sh "Alma scraper" 2 docker run --rm --ipc=host --env-file /home/ste/improv-alma/.env alma-scraper >> /home/ste/improv-alma/scrape.log 2>&1 # improv-alma scraper
```

`run-sync.sh` does `git pull`, then runs `npm ci && npm test && npm run sync` inside a `node:24-slim` container. **Code changes deploy themselves:** push to `main` and the next morning's run uses them. If the tests fail, the sync doesn't run and you get an alert.

## How you find out something's wrong

| Problem | Alert |
| --- | --- |
| A source errors or returns 0 events | Telegram, from the sync's health report (`sync/src/health.ts`) |
| Events taken off the calendar (not listed for 14 days) | Same Telegram message |
| The sync crashes (Airtable down, tests fail, `git pull` fails) | Telegram, from `alert-on-failure.sh` |
| The Alma scraper fails twice in a row | Telegram, from `alert-on-failure.sh` |
| **Dockhead is off, or cron stopped** | GitHub email: the daily export workflow fails its "Check the Dockhead sync is still running" step when Airtable hasn't been refreshed for 3 days |

With no Telegram details in the env file, the alerts are only written to the logs. The GitHub check still works.

## Setting up the Telegram details

Get the two values:

- **Bot token**: in Telegram, message **@BotFather** → `/mybots` → pick the calendar bot (the one that sends the approve/reject messages) → **API Token**. It looks like `123456789:AA…`.
- **Chat ID**: in n8n, open the **Calendar Event Notifier** workflow → **Format Message** node. It's the `chat_id:` value in the code, a number.

Put them on Dockhead:

```
ssh ste@dockhead
nano ~/improv-calendar.env      # fill in the two TELEGRAM_ lines, save
~/improv-calendar/sync/dockhead/alert-on-failure.sh "Telegram test" 1 false
```

That last line fakes a failure, so you should get a "Telegram test failed" message. Delete its counter afterwards: `rm ~/.local/state/improv-alerts/Telegram-test`.

## Everyday commands

```
tail -100 ~/improv-calendar-sync.log                        # last run
~/improv-calendar/sync/dockhead/run-sync.sh                  # run now (writes to Airtable)
```

For a dry run on Dockhead, run the `docker run` line from `run-sync.sh` with `--dry-run` added after `npm run sync --`.

**Pausing:** comment out the cron line (`crontab -e`). The GitHub `Sync Events to Airtable` workflow can be run by hand as a fallback (Actions → Run workflow), but it can't reach the three blocked venues. Don't run both at the same moment, or you'll get duplicate Airtable records.

**Rebuilding from scratch:** `git clone https://github.com/Kaluuja/bristol-improv-calendar.git ~/improv-calendar`, create `~/improv-calendar.env` (mode 600, keys above), add the cron lines, `docker pull node:24-slim`.
