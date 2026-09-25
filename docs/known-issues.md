# Known issues and sharp edges

Most important first. Delete an entry once it's fixed.

## Redgrave scraper matches nothing

Found 25 September 2026. The Redgrave site moved its listings from `/events/` to `/whats-on`, and [redgrave-theatre.ts](../sync/src/adapters/redgrave-theatre.ts) still looks for `/event/YYYY/MM/slug/ID/` links, so it returns 0 events. It's listed in `KNOWN_BROKEN` in [sync/src/health.ts](../sync/src/health.ts), so it doesn't trigger alerts. Low impact, since Redgrave rarely has improv. Rewrite the scraper for the new page, then remove it from `KNOWN_BROKEN`.

## Venues that block GitHub's servers

Bristol Old Vic, Hen & Chicken and Eventbrite all refuse requests from GitHub Actions (Old Vic silently returns nothing; the others give 403/405). They're fine from a home connection, which is why the sync runs on Dockhead. The GitHub `sync.yml` fallback will be missing all three.

## Junk titles slip through

A September 2026 run produced an event titled "Book Tickets" (a scraper reading a button as a title) and "What Ever Happened to Baby Jane? 12 7.00pm at Bristol Improv Theatre" (Headfirst title with the date glued on). They land as Pending, so they show up in the morning brief. Reject them in Airtable, and fix the adapter if they recur.

## The classifier misses improv that doesn't say "improv"

Outside the Bristol Improv Theatre, an event needs an improv keyword or an `ALWAYS_INCLUDE` match. Real example from a September 2026 dry run: "Play It Back – Playback Theatre Workshop" (playback theatre is improvised) was filtered out. Add names to `ALWAYS_INCLUDE` (or signals to `IMPROV_SIGNALS`) in [sync/src/classifier.ts](../sync/src/classifier.ts) as you spot them.

## Wardrobe only knows two shows

The Wardrobe adapter scrapes a hardcoded `RECURRING_SHOWS` list. Anything else at the Wardrobe relies on Headfirst listing it.

## Venue name variants make duplicates

See [airtable.md](airtable.md#deduplication). Fix by adding to `VENUE_ALIASES`.

## Alma scraper needs a manual rebuild

It runs from a Docker image built from `sync/alma-scraper/`. The daily `git pull` updates the files but not the image, so after changing the scraper run `docker build -t alma-scraper ~/improv-calendar/sync/alma-scraper` on Dockhead. Its classifier signals and fingerprint function are copies of `classifier.ts` / `dedupe.ts` rather than shared imports, so they drift apart if you only update one. (Its fingerprint still uses the UTC date, which only differs from the main sync for shows starting between midnight and 1am.)

## Past events from before 25 Sept 2026 may show an hour late

Until the timezone fix, the sync stored BST times an hour late and the export compensated. Now the sync stores true times and the export converts them normally. Every record the sync still sees got rewritten on the first fixed run. Records it no longer sees kept the old values, so a BST one shows an hour **late**. That leaves only past events on the site's "past events" view, which drop off the calendar at the start of November. (The one future case, a delisted BIT showcase on 20 Oct, was moved to Needs review.)

## Netlify serves the whole repo

There's no publish directory, so `sync/`, `scripts/`, `docs/` etc. are all fetchable from the live site. That's harmless while the repo is public anyway, and it's the reason **no secret may ever be committed**. If it starts to bother you, add a `netlify.toml` with a publish directory (bigger change) or a `_redirects` rule that 404s those paths (small change).
