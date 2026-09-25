# Bristol Improv Calendar

What's on in Bristol improv: shows, workshops, jams and drop-ins.
Live at <https://bristol-improv-calendar.netlify.app/>.

This repo holds the whole pipeline: the scrapers that find events, and the site that shows them.
(It absorbed the old private `improv-calendar-sync` repo in September 2026. That repo still has the scraper's git history.)

> **This repo is public.** Secrets live in GitHub Actions secrets and git-ignored `.env` files only.

## How events get from a venue website to the calendar

```
 venue sites / aggregators                     Ticket Tailor (Alma Tavern)
          │                                              │
  sync/  (GitHub Action, every 2 days, 06:00 UTC)   sync/alma-scraper/  (Docker on Dockhead, Mon+Thu 07:15)
          │  fetch → dedupe → classify                   │  Playwright, gets past the Cloudflare check
          └──────────────┬───────────────────────────────┘
                         ▼
                 Airtable "Events" table   ← new events land as Status = Pending
                         │
         n8n on Dockhead: Telegram message with Approve / Reject buttons (hourly)
                         │
                         ▼  Status = Approved
        scripts/export-events.mjs  (GitHub Action, daily 06:00 UTC)
          + data/manual-events.json (hand-added events)
                         │
                         ▼
          events.json + events.ics committed to main → Netlify deploys
                         │
                         ▼
          index.html + assets/app.js (React) render the calendar
```

## Repo layout

| Path | What it is |
| --- | --- |
| `src/app.jsx` | The React app (single file). **Edit this, not `assets/app.js` or `index.html`.** |
| `assets/app.js` | Compiled app, committed so the site stays plain static files. |
| `assets/vendor/` | Self-hosted React 18.3.1 UMD builds. |
| `index.html` | Page shell, meta tags, GoatCounter analytics. |
| `events.json`, `events.ics` | Generated daily. Don't hand-edit; your changes get overwritten. |
| `data/manual-events.json` | Hand-added events that Airtable doesn't have (e.g. out-of-town shows). |
| `scripts/export-events.mjs` | Airtable → `events.json` / `events.ics`. Tests in `export-events.test.mjs`. |
| `_headers` | Netlify headers (serves `events.ics` as `text/calendar`). |
| `sync/` | The scraper: TypeScript, one adapter per source. It has its own `package.json`. |
| `sync/alma-scraper/` | Separate Playwright scraper for the Alma Tavern, deployed on Dockhead. See its [README](sync/alma-scraper/README.md). |
| `docs/` | Reference docs (below). |
| `.github/workflows/` | `sync.yml` (scrape), `export-events.yml` (publish), `build-app.yml` (rebuild the app bundle on push). |

## Docs

- [docs/sources.md](docs/sources.md): every event source, how it's fetched, and how to add one
- [docs/airtable.md](docs/airtable.md): Airtable schema, the approval flow, dedupe rules, the n8n Telegram workflows
- [docs/known-issues.md](docs/known-issues.md): known bugs and sharp edges (**read the timezone section before touching dates**)
- [docs/product-review-2026-07.md](docs/product-review-2026-07.md): July 2026 product review and the phase-2 backlog

## Working on it locally

**The site**

```
npm install
npm run build          # compile src/app.jsx → assets/app.js
npm test               # export script tests
npx http-server -p 8080 .
```

A GitHub Action also rebuilds `assets/app.js` on push, so a forgotten local build can't leave the site stale.

**The scraper**

```
cd sync && npm install && cd ..
npm run sync:dry       # fetch + classify every source, print results, write nothing
npm run sync           # the same, then write to Airtable (needs sync/.env)
```

`sync/.env` needs `AIRTABLE_API_KEY` and `AIRTABLE_BASE_ID` (copy `sync/.env.example`).
The key needs **write** access to the Events table.

**The export**

```
AIRTABLE_API_KEY=… AIRTABLE_BASE_ID=… node scripts/export-events.mjs
```

The export refuses to publish if the event count drops by more than half (a guard against an Airtable outage wiping the calendar). Set `ALLOW_SHRINK=1` if the drop is genuine.

## Hosting and services

- **Netlify** deploys `main` as-is, with no build command. Every file in the repo is publicly served, `sync/` included, so never commit a secret.
- **GitHub Actions secrets:** `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, plus optional `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` for sync alerts.
- **Sync alerts:** if a source errors or returns nothing, the sync run fails (GitHub emails you) and sends a Telegram message, which also lists events taken off the calendar. Sources already known to be broken are listed in `sync/src/health.ts` and don't fail the run. Each run's report is also on its GitHub Actions summary page.
- **Dockhead** (home server): n8n Telegram approval workflows, and the Alma scraper at `/home/ste/improv-alma/`.
- **GoatCounter** analytics: `wednightimprov.goatcounter.com`.
- **Buttondown** newsletter signup: `buttondown.com/Kaluuja`.

## Calendar feed

`events.ics` (`https://bristol-improv-calendar.netlify.app/events.ics`) is a subscribable iCalendar feed of the same events. It isn't linked from the UI yet.
