# Known issues and sharp edges

Most important first. Delete an entry once it's fixed.

## Timezones: events an hour out in BST

**Status:** worked around in the export, not fixed. Found 13 August 2026.

What goes wrong:

- Most adapters build dates with the local-time constructor (`new Date(y, m, d, 19, 30)`, `.setHours()`), and `airtable.ts` stores `start.toISOString()`. The result depends on the **timezone of the machine running it**.
- GitHub Actions runs in UTC. A 19:30 BST curtain is stored as `19:30Z`, which is an hour late as a true instant. That covers BIT, Old Vic, Wardrobe, Headfirst and Eventbrite: nearly every record.
- The Alma scraper (Dockhead, Europe/London) and the ICS path (`helpers/ics-parser.ts`, H&C and PRSC) store **correct** instants.

How the export compensates: `parseWallClock()` in [scripts/export-events.mjs](../scripts/export-events.mjs) treats every `Start`/`End` as floating London wall-clock time. That fixes the majority, but makes the correctly-stored records an hour **early** in BST (e.g. Instant Wit at the Alma, Sat 3 Oct 2026, 20:00, published as 19:00).

**The real fix. It's one change now that both halves live in this repo:**

1. Add `TZ: Europe/London` to the `Run sync` step env in [.github/workflows/sync.yml](../.github/workflows/sync.yml). Every adapter then builds correct instants, matching Dockhead and the ICS path.
2. In the **same commit**, replace `parseWallClock` in the export with a normal UTC → Europe/London conversion, and update `export-events.test.mjs`.
3. Run the sync once. The records correct themselves: `Start` isn't protected and the fingerprint has no time in it, so each record is updated in place with no duplicates.

If you do only half of this, every summer event swings an hour the other way.

A smaller wrinkle to check while you're in there: `getDateOnly()` in `dedupe.ts` takes the **UTC** date. Once instants are correct, an event starting between 00:00 and 01:00 BST would fingerprint as the previous day. That's rare for improv, but worth switching to the London date.

## Source failures are silent

`pipeline.ts` catches each adapter's error, logs `✗ source: message`, and carries on. The run still exits 0 and the workflow goes green. So a venue that redesigns its site quietly stops producing events, and you only notice when the calendar looks thin. This is the P0 in the [product review](product-review-2026-07.md).

Cheap fix: exit non-zero (or post to Telegram) when any source errors, **or returns 0 events** where it used to return some.

**This is already happening.** Found 25 September 2026: on GitHub Actions, **Hen & Chicken** (`403` on the ICS feed) and **Eventbrite** (`405`) have failed on every run since about 29 June 2026, three months of green ticks. Both work from a home connection, so they're blocking GitHub's datacenter IPs. Eventbrite already sends a browser User-Agent, so that one is IP-based. The ICS fetch in `helpers/ics-parser.ts` sends no User-Agent, so a browser UA *might* fix Hen & Chicken; worth one try.

Impact so far is small. Hen & Chicken events still arrive via Headfirst's venue page, and Eventbrite is the lowest-priority source. Fix options: run these two from Dockhead like the Alma scraper, or accept Headfirst's coverage and remove them.

## Phantom next-year dates

Found 25 September 2026. Some scrapers see a date with no year ("Mon 9 Feb") and guess the year. On the day of the show the date counts as passed, so the scraper files it a year later, creating a phantom event. Examples: a dozen Wardrobe "Closer Each Day" / "Impromptu Shakespeare" records dated 2027, each "last seen" exactly a year earlier, and "My Date with Pierce Brosnan" via Headfirst.

The stale-event step ([airtable.md](airtable.md#lifecycle-of-a-record)) now pulls these off the calendar after 14 days. The real fix is in each adapter's year inference: treat today as "this year", and only roll to next year when the date is well in the past (e.g. more than a month). Check `wardrobe-theatre.ts` and `headfirst.ts` first.

## The classifier misses improv that doesn't say "improv"

Outside the Bristol Improv Theatre, an event needs an improv keyword or an `ALWAYS_INCLUDE` match. Real example from a September 2026 dry run: "Play It Back – Playback Theatre Workshop" (playback theatre is improvised) was filtered out. Add names to `ALWAYS_INCLUDE` (or signals to `IMPROV_SIGNALS`) in [sync/src/classifier.ts](../sync/src/classifier.ts) as you spot them.

## Wardrobe only knows two shows

The Wardrobe adapter scrapes a hardcoded `RECURRING_SHOWS` list. Anything else at the Wardrobe relies on Headfirst listing it.

## Venue name variants make duplicates

See [airtable.md](airtable.md#deduplication). Fix by adding to `VENUE_ALIASES`.

## Alma scraper is deployed by hand

It runs from a copy at `/home/ste/improv-alma/` on Dockhead, not from this repo, so edits here do nothing until you copy them over and rebuild the image. Its classifier signals are a copy of `classifier.ts` rather than a shared import, so they drift apart if you only update one.

## Netlify serves the whole repo

There's no publish directory, so `sync/`, `scripts/`, `docs/` etc. are all fetchable from the live site. That's harmless while the repo is public anyway, and it's the reason **no secret may ever be committed**. If it starts to bother you, add a `netlify.toml` with a publish directory (bigger change) or a `_redirects` rule that 404s those paths (small change).
