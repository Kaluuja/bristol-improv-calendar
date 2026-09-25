# Bristol Improv Calendar

Scrapers (`sync/`) → Airtable (with Telegram approval) → daily export (`scripts/export-events.mjs`) → static site (`src/app.jsx`) on Netlify. Start with [README.md](README.md). The details are in `docs/`.

## Rules

- **The repo is public and Netlify serves every file in it.** Never commit secrets, Airtable/Telegram IDs or `.env` files. n8n exports keep their placeholders.
- **App changes go in `src/app.jsx`**, then `npm run build`. Never hand-edit `assets/app.js` or put app logic in `index.html`.
- **Never hand-edit `events.json` / `events.ics`.** They're regenerated daily. Hand-added events go in `data/manual-events.json`.
- **Dates:** the sync runs in Europe/London (`sync/src/tz.ts` + `TZ` in the workflow) and stores true instants in Airtable. The export converts them to London time in `parseWallClock`; naive values (manual events) are already London time. Adapters needing a year for "Mon 9 Feb"-style dates use `inferYear()` in `sync/src/adapters/helpers/dates.ts`. Never compare to "now" to guess a year yourself. `npm test` in both places covers this.
- **Health alerts:** a source that errors or returns 0 events fails the sync run (GitHub emails) and sends a Telegram message, unless it's listed in `KNOWN_BROKEN` in `sync/src/health.ts`. Fix a source → remove it from that list.
- `sync/` is its own npm package (TypeScript, `tsx`). The root `package.json` is the site plus esbuild. From the root: `npm run sync:dry` to test the scrapers without writing, `npm test` for the export.
- `sync/alma-scraper/` runs on Dockhead, not in CI. Editing it here doesn't deploy it.
- British English in all user-facing copy.

## Before handing over a change

- Site: `npm run build`, `npm test`, open it locally (`.claude/launch.json` has a static server config).
- Scraper: `npm run sync:dry` and check the source you touched fetched events without a `✗`.
