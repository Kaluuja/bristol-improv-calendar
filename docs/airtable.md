# Airtable, approval and dedupe

Airtable is the hub between the scrapers and the site. Base **Improv Calendar**, table **Events**.

## Fields

| Field | Type | Written by | Notes |
| --- | --- | --- | --- |
| `Title` | text | sync | |
| `Start` | date/time | sync | A true instant (UTC in the API; Airtable's UI shows it in your local time). Records not refreshed since 25 Sept 2026 may be an hour out; see [known-issues.md](known-issues.md). |
| `End` | date/time | sync | Optional. If it's missing, the `.ics` feed assumes the event runs 2 hours. |
| `Venue` | text | sync | Normalised display name (e.g. "Hen & Chicken", "PRSC") |
| `Address` | text | nobody | Exists in the base; the sync doesn't write it |
| `Event URL` | url | sync | |
| `Tickets URL` | url | sync | |
| `Type` | single select | sync on **create only** | Show, Workshop, Jam, Drop-in, Other. Protected once it exists, so fix it by hand in Airtable and it stays fixed. |
| `Status` | single select | sync on **create only** (`Pending`), then you | Pending, Approved, Rejected, Needs review (set by the sync when an event stops being listed; see below). Protected from overwrite on refresh. |
| `Source` | text | sync | `Sync` for scraped records. `manual` means the sync never updates or deletes the record. |
| `Fingerprint` | text | sync | The dedupe key (below) |
| `Source Event ID` | text | sync | ID from the source (ICS UID, Spektrix instance, URL…) |
| `First Seen` | date/time | sync on create | |
| `Last Seen` | date/time | sync every run | A stale `Last Seen` on a future event means the source stopped listing it |
| `Notes (internal)` | long text | you | Never published |

## Lifecycle of a record

1. **Created** by the sync (or the Alma scraper) as `Status = Pending`, `Source = Sync`.
2. **Listed** in Echo's morning brief under "Waiting for approval" (written at 06:45 by [sync/dockhead/morning_brief.py](../sync/dockhead/morning_brief.py)).
3. **Decided** by you in Airtable: set `Status` to `Approved` or `Rejected`.
4. **Refreshed** on every later sync that still finds it. Everything except `Type` and `Status` gets overwritten with the source's latest data, and `Last Seen` is bumped.
5. **Retired** if it's a future event that no source has listed for **14 days**. The sync flips `Approved`/`Pending` to `Needs review`, so it drops off the site but isn't deleted. This catches cancelled or delisted shows, records left behind when a venue changes website, and phantom next-year dates. The run log lists every record it retires. To restore one, set it back to `Approved`. It's skipped if more than half the sources failed that run, so an outage can't empty the calendar.
6. **Published**: the daily export ([scripts/export-events.mjs](../scripts/export-events.mjs)) takes every `Status = Approved` record and writes `events.json` / `events.ics`.
7. **Deleted**: each sync run removes non-manual records whose `Start` is before the first day of the previous month.

## Deduplication

All of it lives in [sync/src/dedupe.ts](../sync/src/dedupe.ts).

**Fingerprint** = `normalisedTitle | YYYY-MM-DD | normalisedVenue`

- Title: lowercased, punctuation stripped, the **subtitle after the last colon removed**, plus known aliases (`TITLE_ALIASES`).
- Date only, **no time**, because sources disagree by a few minutes. The date is taken in UTC (`toISOString`).
- Venue: lowercased, `&` → `and`, leading "the" dropped, then mapped through `VENUE_ALIASES`.

The sync upserts to Airtable by fingerprint. A matching fingerprint updates the record; no match creates one.

**Within a single run**, before writing:

1. **Exact pass**: same fingerprint → keep the highest-priority source (venue sites 1, Headfirst 2, Eventbrite 3, anything else 10) and merge the source IDs.
2. **Fuzzy pass**: same venue and same date, and any one of:
   - the titles share a leading run of ≥ 2 words that is ≥ 40% of both titles
   - ≥ 3 shared words covering ≥ 70% of the shorter title, with start times within 60 minutes
   - an identical tickets URL (with a path)

**What gets past it:** a venue name variant nobody has added to `VENUE_ALIASES` gives a different fingerprint, so you get a duplicate (e.g. "Deathmatch Improv" / "Death Match Improv" at PRSC). Fix those by adding an alias.

The export does one more dedupe of its own: manual events are dropped if an Airtable event has the same title and date.

## Approvals

There's no approval bot any more. The n8n Telegram workflows (Calendar Event Notifier / Approval Handler) are switched off on Dockhead, and their exports were removed from this repo in September 2026 (they're in git history). Echo's morning brief lists what's Pending each day, and you approve in Airtable. See [sync/dockhead/README.md](../sync/dockhead/README.md).
