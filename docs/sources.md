# Event sources

Checked against the code in September 2026. The list of sources in use lives in [sync/src/cli.ts](../sync/src/cli.ts). Adapters are in [sync/src/adapters/](../sync/src/adapters/).

## Main sync (GitHub Actions, `sync/`)

| Source name | Venue | How it's fetched |
| --- | --- | --- |
| `bristol-improv-theatre` | Bristol Improv Theatre | **Spektrix API** (`system.spektrix.com/bristolimprovtheatre/api/v3/events` + `/instances`). One record per performance. Covers 6+ months. The file is still called `bristol-improv-theatre-scraper.ts`, but it no longer scrapes HTML or reads the ICS feed. |
| `prsc` | PRSC | ICS feed (`prsc.org.uk/?post_type=tribe_events&ical=1…`) via `helpers/ics-parser.ts` |
| `hen-and-chicken` | Hen & Chicken | ICS feed (`henandchicken.com/?post_type=tribe_events&ical=1…`) via `helpers/ics-parser.ts` |
| `wardrobe-theatre` | Wardrobe Theatre | Scrapes the pages of a **hardcoded list of recurring shows** (`RECURRING_SHOWS`: Closer Each Day, Impromptu Shakespeare). New Wardrobe shows only get picked up via Headfirst unless you add them to that list. |
| `bristol-folk-house` | The Folk House | HTML: `/live-music/?page=N`, up to 8 pages |
| `tobacco-factory` | Tobacco Factory Theatres | HTML: `/whats-on/` |
| `bristol-beacon` | Bristol Beacon | HTML: site search for "improv" |
| `bristol-old-vic` | Bristol Old Vic | HTML: `/whats-on`, up to 6 pages; date ranges are expanded into individual performances |
| `redgrave-theatre` | Redgrave Theatre | HTML: `/events/` (date from the URL pattern) |
| `st-georges-bristol` | St George's Bristol | HTML: `/whats-on/` |
| `headfirst` | (aggregator) | HTML + JSON-LD times from: comedy and theatre listings, plus the venue pages for Hen & Chicken, PRSC, Wardrobe, Folk House and Loco Klub |
| `eventbrite` | (aggregator) | Eventbrite search `/d/united-kingdom--bristol/improv/`, reading the embedded `__SERVER_DATA__` JSON |

When the same event comes from several sources, **venue sources beat Headfirst, and Headfirst beats Eventbrite** (see [airtable.md](airtable.md#deduplication)).

## Alma Tavern (Dockhead, `sync/alma-scraper/`)

The Alma lists only on Ticket Tailor, which sits behind a Cloudflare JS challenge that blocks GitHub Actions. So it runs separately: headed Chromium via Playwright in Docker on Dockhead, Mon and Thu at 07:15. It uses the same fingerprint scheme and classifier signals as the main sync. See [its README](../sync/alma-scraper/README.md) for deployment and what to do if Cloudflare tightens up.

**Deployment is manual.** Changes to `sync/alma-scraper/` don't reach Dockhead until you copy them to `/home/ste/improv-alma/` and rebuild the Docker image.

## Hand-added events

For anything no scraper can see (e.g. Balls! at the Mission Theatre, Bath), add a record to [data/manual-events.json](../data/manual-events.json). It uses the Airtable field shape with naive London times. The export merges these in and drops any that duplicate an Airtable event (same title and date).

Or add the record straight into Airtable with `Source = manual`. The sync never overwrites or deletes those.

## What counts as improv

[sync/src/classifier.ts](../sync/src/classifier.ts) filters every fetched event. An event is kept if one of these applies:

- it's at an always-improv venue (Bristol Improv Theatre), or
- it matches `ALWAYS_INCLUDE`, a list of known shows (Showstopper, Austentatious, Closer Each Day, Just For A Moment…), or
- it has an improv signal (`improv`, `improvised`, `theatresports`, `long form`…) and no strong non-improv signal.

It also assigns `Type` (Show / Workshop / Jam / Drop-in / Other). Events before the first day of the previous month are dropped.

Run `npm run sync:dry` to see what gets filtered and why (each rejection prints a reason).

## Adding a source

1. Copy the closest adapter in `sync/src/adapters/` (ICS → `prsc.ts`, HTML → `redgrave-theatre.ts`). Implement `SourceAdapter`: a `name` and a `fetch(): Promise<Event[]>`.
2. Build each event's `fingerprint` with `generateFingerprint()` from `dedupe.ts`.
3. Export it from `adapters/index.ts` and add it to the `sources` array in `cli.ts`.
4. Give it a priority in `SOURCE_PRIORITY` (`dedupe.ts`). Add venue aliases to `VENUE_ALIASES` / `VENUE_DISPLAY_NAMES` if the name varies between sources.
5. Add the venue to `venueStyles` in `src/app.jsx` (colour + `group`), or it'll show under "Other".
6. `npm run sync:dry` and eyeball the output.

**Dates:** read [known-issues.md](known-issues.md#timezones-events-an-hour-out-in-bst) before you construct a `Date`.

## Ideas not yet built

- More Eventbrite organisers
- Facebook Events (needs API access)
