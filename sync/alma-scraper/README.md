# Alma Tavern scraper (Dockhead)

The Alma Tavern & Theatre lists exclusively on Ticket Tailor, which sits behind a
Cloudflare JS challenge that blocks plain HTTP (including GitHub Actions runners).
A real headed Chromium from a residential IP passes it, so this scraper runs on
Dockhead (same home IP) in Docker. It's a separate job from the main sync (which also runs on Dockhead; see [../dockhead/](../dockhead/README.md)). Its cron line is wrapped in `alert-on-failure.sh`, so two failures in a row show up in Echo's morning brief.

## How it works

1. Playwright loads the box-office listing, waits for the Cloudflare challenge to
   clear (~5s), and parses the event cards.
2. Each event's description page is read (same browser session, so no repeat
   challenge) and classified with the same improv keyword signals as
   `../src/classifier.ts`.
3. Improv events are upserted to the same Airtable base using the same
   `Fingerprint` scheme as `../src/dedupe.ts` (create as `Status: Pending` /
   `Source: Sync`, refresh `Last Seen` on re-sighting, never touch
   `Source: manual` records). Pending events then appear in Echo's morning
   brief for approval in Airtable, like everything else.

Multi-day runs (e.g. a three-night play) become one record on the opening night.

## Failure behaviour

Exit 2 (without touching Airtable) if the challenge never clears or zero cards
parse. Cron logs to `~/improv-alma/scrape.log` on Dockhead. Cloudflare fails it
now and then, so `alert-on-failure.sh` only raises an alert (in the morning
brief) after **two failures in a row**.

## Deployed setup on Dockhead

- Runs from the repo checkout: `/home/ste/improv-calendar/sync/alma-scraper/`
  (since Sept 2026; before that, a hand-copied folder in `~/improv-alma/`, which
  now only holds the logs).
- Secrets: `/home/ste/improv-calendar.env`, shared with the main sync.
- **Changes need an image rebuild** (the daily `git pull` doesn't rebuild it):
  `docker build -t alma-scraper ~/improv-calendar/sync/alma-scraper`
- Cron (ste): Mon & Thu 07:15. The full line is in [../dockhead/README.md](../dockhead/README.md).
- Dry run: `docker run --rm --ipc=host --env-file ~/improv-calendar.env -e DRY_RUN=1 alma-scraper`
- **`--ipc=host` is required**: without it Chromium hangs silently on the
  default 64MB `/dev/shm` (observed on first deploy). A 12-minute in-process
  watchdog also aborts any hung run with exit 2.

## Local test (Windows, headed — a browser window will open)

```
cd alma-scraper
npm install
set DRY_RUN=1 && node scrape.mjs   # needs AIRTABLE_* in env (see ../.env)
```

## If Cloudflare escalates

Symptoms: exit 2 with "challenge never cleared" in the log. Levers, in order:
longer challenge wait; `playwright` version bump (newer Chromium); switch to
Firefox (`firefox.launch`); community stealth patches (patchright). If all fail,
fall back to a monthly manual check of the Ticket Tailor page.
