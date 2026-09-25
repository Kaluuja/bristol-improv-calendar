# Bristol Improv Calendar

Scrapers (`sync/`) → Airtable (with Telegram approval) → daily export (`scripts/export-events.mjs`) → static site (`src/app.jsx`) on Netlify. Start with [README.md](README.md). The details are in `docs/`.

## Rules

- **The repo is public and Netlify serves every file in it.** Never commit secrets, Airtable/Telegram IDs or `.env` files. n8n exports keep their placeholders.
- **App changes go in `src/app.jsx`**, then `npm run build`. Never hand-edit `assets/app.js` or put app logic in `index.html`.
- **Never hand-edit `events.json` / `events.ics`.** They're regenerated daily. Hand-added events go in `data/manual-events.json`.
- **Dates are a known trap.** Read `docs/known-issues.md` (timezones) before touching any `Date` in `sync/` or `parseWallClock` in the export. The two sides compensate for each other, so change them together or not at all.
- `sync/` is its own npm package (TypeScript, `tsx`). The root `package.json` is the site plus esbuild. From the root: `npm run sync:dry` to test the scrapers without writing, `npm test` for the export.
- `sync/alma-scraper/` runs on Dockhead, not in CI. Editing it here doesn't deploy it.
- British English in all user-facing copy.

## Before handing over a change

- Site: `npm run build`, `npm test`, open it locally (`.claude/launch.json` has a static server config).
- Scraper: `npm run sync:dry` and check the source you touched fetched events without a `✗`.
