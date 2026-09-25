# Airtable, approval and dedupe

Airtable is the hub between the scrapers and the site. Base **Improv Calendar**, table **Events**.

## Fields

| Field | Type | Written by | Notes |
| --- | --- | --- | --- |
| `Title` | text | sync | |
| `Start` | date/time | sync | See [known-issues.md](known-issues.md#timezones-events-an-hour-out-in-bst). The stored value isn't always a true instant. |
| `End` | date/time | sync | Optional. If it's missing, the `.ics` feed assumes the event runs 2 hours. |
| `Venue` | text | sync | Normalised display name (e.g. "Hen & Chicken", "PRSC") |
| `Address` | text | nobody | Exists in the base; the sync doesn't write it |
| `Event URL` | url | sync | |
| `Tickets URL` | url | sync | |
| `Type` | single select | sync on **create only** | Show, Workshop, Jam, Drop-in, Other. Protected once it exists, so fix it by hand in Airtable and it stays fixed. |
| `Status` | single select | sync on **create only** (`Pending`), then n8n or you | Pending, Approved, Rejected, Needs review. Protected. |
| `Source` | text | sync | `Sync` for scraped records. `manual` means the sync never updates or deletes the record. |
| `Fingerprint` | text | sync | The dedupe key (below) |
| `Source Event ID` | text | sync | ID from the source (ICS UID, Spektrix instance, URL…) |
| `First Seen` | date/time | sync on create | |
| `Last Seen` | date/time | sync every run | A stale `Last Seen` on a future event means the source stopped listing it |
| `Telegram Notified` | checkbox | n8n | Stops the same event being pinged twice |
| `Notes (internal)` | long text | you | Never published |

## Lifecycle of a record

1. **Created** by the sync (or the Alma scraper) as `Status = Pending`, `Source = Sync`.
2. **Notified**: the hourly n8n workflow sends a Telegram message with Approve / Reject / Keep pending buttons and ticks `Telegram Notified`.
3. **Decided**: the button press sets `Status` (the n8n handler workflow PATCHes Airtable).
4. **Refreshed** on every later sync that still finds it. Everything except `Type` and `Status` gets overwritten with the source's latest data, and `Last Seen` is bumped.
5. **Published**: the daily export ([scripts/export-events.mjs](../scripts/export-events.mjs)) takes every `Status = Approved` record and writes `events.json` / `events.ics`.
6. **Deleted**: each sync run removes non-manual records whose `Start` is before the first day of the previous month.

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

## n8n Telegram workflows (Dockhead)

Exports are in [docs/n8n/](n8n/). The IDs, tokens and chat ID in them are placeholders (`YOUR_AIRTABLE_BASE_ID`, `YOUR_CALENDAR_BOT_TOKEN`, `YOUR_TELEGRAM_CHAT_ID`, `REPLACE_CREDENTIAL`). Keep it that way when you re-export, because **this repo is public**.

- **Calendar Event Notifier** (`n8n-calendar-notifier-workflow.json`): hourly. Fetches `Pending` records where `Telegram Notified` isn't ticked, sends each one to Telegram with inline buttons, then ticks `Telegram Notified`.
- **Calendar Approval Handler** (`n8n-calendar-handler-workflow.json`): Telegram `callback_query` trigger. Parses `approve|reject|pending:<recordId>`, PATCHes `Status`, and confirms in the chat.

The bot token is stored in n8n credentials as "Telegram Calendar Bot". The webhook points at Dockhead's Tailscale URL.

The **morning brief** also reads from here: `pending_brief.py` (in `sync/alma-scraper/`) runs at 06:45 daily on Dockhead and writes the pending list to `/home/hermes/vault/context/improv-pending.md`.
