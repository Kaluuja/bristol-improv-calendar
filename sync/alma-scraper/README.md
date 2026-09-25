# Alma Tavern scraper (Dockhead)

The Alma Tavern & Theatre lists exclusively on Ticket Tailor, which sits behind a
Cloudflare JS challenge that blocks plain HTTP (including GitHub Actions runners).
A real headed Chromium from a residential IP passes it, so this scraper runs on
Dockhead (same home IP) in Docker. It's a separate job from the main sync (which also runs on Dockhead; see [../dockhead/](../dockhead/README.md)). Its cron line is wrapped in `alert-on-failure.sh`, so two failures in a row send a Telegram alert.

## How it works

1. Playwright loads the box-office listing, waits for the Cloudflare challenge to
   clear (~5s), and parses the event cards.
2. Each event's description page is read (same browser session, so no repeat
   challenge) and classified with the same improv keyword signals as
   `../src/classifier.ts`.
3. Improv events are upserted to the same Airtable base using the same
   `Fingerprint` scheme as `../src/dedupe.ts` (create as `Status: Pending` /
   `Source: Sync`, refresh `Last Seen` on re-sighting, never touch
   `Source: manual` records). Pending events then flow through the existing
   n8n Telegram approve/reject loop.

Multi-day runs (e.g. a three-night play) become one record on the opening night.

## Failure behaviour

Exit 2 (without touching Airtable) if the challenge never clears or zero cards
parse — cron logs to `~/improv-alma/scrape.log` on Dockhead.

## Deployed setup on Dockhead (installed 13 July 2026)

- Files at `/home/ste/improv-alma/` (this folder + `.env` with
  `AIRTABLE_API_KEY` / `AIRTABLE_BASE_ID`, mode 600)
- Image: `docker build -t alma-scraper /home/ste/improv-alma`
- Cron (ste): Mon & Thu 07:15 —
  `docker run --rm --ipc=host --env-file /home/ste/improv-alma/.env alma-scraper >> /home/ste/improv-alma/scrape.log 2>&1`
- Dry run: add `-e DRY_RUN=1` to the docker command.
- **`--ipc=host` is required** — without it Chromium hangs silently on the
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
