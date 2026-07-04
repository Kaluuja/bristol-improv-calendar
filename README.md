# Bristol Improv Calendar

What's on in Bristol improv — shows, workshops, jams and drop-ins.
Live at <https://bristol-improv-calendar.netlify.app/> (Netlify, deploys straight from `main`, no build command).

## How it works

- **`src/app.jsx`** — the React app (single file). Edit this, not `assets/app.js`.
- **`assets/app.js`** — compiled output, committed to the repo so the site stays plain static files. Rebuild with `npm run build`. A GitHub Action ([build-app.yml](.github/workflows/build-app.yml)) also rebuilds it automatically on push, so a forgotten local build can't leave the site stale.
- **`assets/vendor/`** — pinned React 18.3.1 UMD builds, self-hosted (no CDN dependency).
- **`events.json` / `events.ics`** — generated daily at 06:00 UTC by [export-events.yml](.github/workflows/export-events.yml), which pulls approved events from Airtable via [scripts/export-events.mjs](scripts/export-events.mjs) and commits the result.

## Local development

```
npm install
npm run build          # compile src/app.jsx -> assets/app.js
npx http-server -p 8080 .
```

## Calendar feed

`events.ics` is a subscribable iCalendar feed of the same events
(`https://bristol-improv-calendar.netlify.app/events.ics`). Not yet linked from the UI.
