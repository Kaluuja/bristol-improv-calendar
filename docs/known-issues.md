# Known issues and sharp edges

Most important first. Delete an entry once it's fixed.

## Four sources are broken on GitHub Actions

Found 25 September 2026. These are listed in `KNOWN_BROKEN` in [sync/src/health.ts](../sync/src/health.ts), so each alert reports them without failing the run. Remove an entry once it's fixed; the report says "working again" when one recovers.

| Source | Problem | Since | Impact |
| --- | --- | --- | --- |
| `bristol-old-vic` | 0 events from GitHub, 126 from home. Blocked without an error. | unknown | **Biggest gap.** Old Vic improv shows only arrive if Headfirst lists them. |
| `hen-and-chicken` | ICS feed returns `403` to GitHub | ~29 June 2026 | Small: Headfirst's H&C page covers it |
| `eventbrite` | `405` to GitHub, even with a browser User-Agent | ~29 June 2026 | Small: lowest-priority source |
| `redgrave-theatre` | 0 events **everywhere**: the site moved `/events/` → `/whats-on`, so the scraper matches nothing | unknown | Small: Redgrave rarely has improv |

The first three all work from a home connection, so they're blocking GitHub's datacenter IPs. **The likely fix is to run the whole sync on Dockhead** (home IP, already London time, already runs the Alma scraper) on a cron that does `git pull && npm ci && npm run sync`, and turn the GitHub schedule off. Redgrave needs its scraper rewriting for the new page.

## Junk titles slip through

A September 2026 run produced an event titled "Book Tickets" (a scraper reading a button as a title) and "What Ever Happened to Baby Jane? 12 7.00pm at Bristol Improv Theatre" (Headfirst title with the date glued on). They land as Pending, so you'll see them in Telegram. Reject them there, and fix the adapter if they recur.

## The classifier misses improv that doesn't say "improv"

Outside the Bristol Improv Theatre, an event needs an improv keyword or an `ALWAYS_INCLUDE` match. Real example from a September 2026 dry run: "Play It Back – Playback Theatre Workshop" (playback theatre is improvised) was filtered out. Add names to `ALWAYS_INCLUDE` (or signals to `IMPROV_SIGNALS`) in [sync/src/classifier.ts](../sync/src/classifier.ts) as you spot them.

## Wardrobe only knows two shows

The Wardrobe adapter scrapes a hardcoded `RECURRING_SHOWS` list. Anything else at the Wardrobe relies on Headfirst listing it.

## Venue name variants make duplicates

See [airtable.md](airtable.md#deduplication). Fix by adding to `VENUE_ALIASES`.

## Alma scraper is deployed by hand

It runs from a copy at `/home/ste/improv-alma/` on Dockhead, not from this repo, so edits here do nothing until you copy them over and rebuild the image. Its classifier signals and fingerprint function are copies of `classifier.ts` / `dedupe.ts` rather than shared imports, so they drift apart if you only update one. (Its fingerprint still uses the UTC date, which only differs from the main sync for shows starting between midnight and 1am.)

## Past events from before 25 Sept 2026 may show an hour early

Until the timezone fix, the sync stored BST times an hour late and the export compensated. Now the sync stores true times and the export converts them normally. Every record the sync still sees got rewritten on the first fixed run. Past events it no longer sees kept the old values, so they show an hour early on the site's "past events" view. They drop off the calendar at the start of November.

## Netlify serves the whole repo

There's no publish directory, so `sync/`, `scripts/`, `docs/` etc. are all fetchable from the live site. That's harmless while the repo is public anyway, and it's the reason **no secret may ever be committed**. If it starts to bother you, add a `netlify.toml` with a publish directory (bigger change) or a `_redirects` rule that 404s those paths (small change).
