# Bristol Improv Calendar — Product Review & Phase 2 Brief (12 July 2026)

Self-contained handover document. An LLM (or human) with access to this repo should be able
to act on any item below without needing the conversation that produced it.

---

## 1. What this product is

A free "what's on in Bristol improv" calendar — shows, workshops, jams, drop-ins — at
<https://bristol-improv-calendar.netlify.app/>. Built and run by Ste Brown (Kaluuja on
GitHub), an improv producer/performer in Bristol. Goals: be *the* single source for Bristol
improv listings; grow the local scene; low-maintenance (Ste has a full-time NHS job).
Monetisation is a Ko-fi tip link only. Site is currently badged "Beta".

## 2. Architecture (verified 12 July 2026)

Two repos plus n8n:

```
[12 venue/aggregator sources] → improv-calendar-sync (separate repo, TypeScript)
      GitHub Action every 2 days, 06:00 UTC: fetch → dedupe → classify → Airtable
                                    │
                        Airtable "Events" table
                        (new events land as Pending; n8n on Dockhead sends a
                         Telegram message with Approve/Reject buttons; only
                         Status = Approved gets published)
                                    │
      GitHub Action export-events.yml IN THIS REPO (daily, cron 06:00 UTC,
      actually fires ~08:00–10:00 due to GitHub scheduling delays)
                                    │
      scripts/export-events.mjs → events.json + events.ics
      committed to main → Netlify auto-deploy (no build command)
                                    │
      index.html + vendored React 18.3.1 UMD + assets/app.js
      (compiled from src/app.jsx by esbuild)
```

The ingest side lives at `C:/Users/ste2k/Projects/improv-calendar-sync`
(github.com/Kaluuja/improv-calendar-sync, **private**). Adapters in `src/adapters/`:
Bristol Improv Theatre (Spektrix API), Hen & Chicken + PRSC (The Events Calendar ICS
feeds), Wardrobe Theatre (JSON API), Bristol Old Vic / Tobacco Factory / Bristol Beacon /
Redgrave / St George's / Folk House (HTML scrapers), Headfirst Bristol + Eventbrite
(aggregators). Keyword classifier in `src/classifier.ts` filters to improv and assigns
Show/Workshop/Jam/Drop-in. Dedupe by fingerprint (normalised title + start + venue).
n8n's only role is the Telegram approve/reject loop (workflow JSON exported in that
repo's `docs/`). `.env` and `dist/` are correctly gitignored.

### Hard rules for anyone touching this repo

- **Never edit `index.html` or `assets/app.js` for app changes.** The app source is
  `src/app.jsx`; rebuild with `npm run build`. A GitHub Action (`build-app.yml`) also
  rebuilds on push as a safety net.
- Netlify has **no build command** — everything committed must be final static output.
- React is vendored in `assets/vendor/` (no CDN); keep it that way.
- British English throughout the UI.
- Accessibility to GOV.UK / WCAG standards is an explicit owner priority.

### Airtable fields used by the export

`Status`, `Start` (ISO datetime), `End` (optional), `Title`, `Venue`, `Type`,
`Tickets URL`, `Event URL`. Secrets `AIRTABLE_API_KEY` / `AIRTABLE_BASE_ID` are GitHub
Actions secrets.

## 3. Current state (data snapshot, 12 July 2026)

- 230 events published (previous month onwards), 177 future, horizon out to June 2027.
- Export pipeline healthy: daily runs succeeding, `events.ics` generating.
- Ingest pipeline healthy: sync last ran 11 July, newest event first-seen 7 July; the
  approval funnel is clear (3 Pending, none future; 235 Approved, 33 Rejected).
- **Venue skew (future events): Bristol Improv Theatre 129, Bristol Old Vic 25, Wardrobe
  Theatre 19, everything else ≤1.** Verified as an accurate picture of the scene, not a
  scraper failure: the Hen & Chicken feed was fetched live (30 events) and run through
  the real classifier — it correctly kept the one improv event (Wednesday Night Improv,
  arriving via Headfirst) and dropped 29 stand-up/music/talk nights. PRSC's feed works
  and currently lists no improv. "Open Jam Night" no longer appears in H&C's feed at all
  (ended or moved — not a scraper miss).
- Type mix (future): 85 shows, 77 drop-ins, 12 workshops, 3 jams.
- `events.ics` feed exists and works but is deliberately **not linked from the UI** —
  Ste is soak-testing it on his own phone first.
- No analytics of any kind. No way to know visits, repeat usage, or which features get used.
- Feedback form (Google Form) and an "account interest" signup form (Google Form) exist
  in the UI; response volume unknown.

## 4. Findings

### 4.1 Data & pipeline

| # | Finding | Where | Severity |
|---|---------|-------|----------|
| D1 | **Silent per-source failure.** `runPipeline` catches each adapter's errors, logs them to the Actions console, and the workflow still exits green. If the BIT Spektrix API (73% of all listings) broke tomorrow, nothing would alert anyone — the site would just quietly thin out over weeks. Fix: fail the workflow (or send a Telegram alert via the existing n8n bot) when any adapter errors or returns 0 events, and track a per-source expected-minimum. | improv-calendar-sync `src/pipeline.ts:48-61` | **High** |
| D1b | **Classifier recall risk.** A non-BIT event without an improv keyword in title/description is dropped as "no improv signals" — a hypothetical new "Open Jam Night" at a pub would be invisible unless its blurb says "improv". Options: (a) weekly digest of *dropped* events at known comedy venues for a human eyeball; (b) an LLM pass (Haiku-class) on the ambiguous middle — cheap at ~50 events/run; (c) keep growing `ALWAYS_INCLUDE`. | improv-calendar-sync `src/classifier.ts:144-184` | Medium |
| D1c | `docs/sources.md` in the sync repo is stale: says BIT uses the ICS feed (moved to Spektrix API — the ICS feed now returns 0 VEVENTs); Folk House adapter missing from the list; Alma Tavern adapter was removed from `src/` but lingers in `dist/`. | improv-calendar-sync `docs/sources.md` | Low |
| D2 | No empty-feed guard: if the Airtable "Approved" filter ever returns 0 rows (view renamed, token scope change), the export happily publishes an empty calendar. | [export-events.mjs:147-165](../scripts/export-events.mjs) | Medium |
| D3 | `lastUpdated` is rewritten every run, so the Action commits and triggers a Netlify build **every day even when nothing changed** (~365 noise commits/year + build minutes). | [export-events.mjs:157-162](../scripts/export-events.mjs) | Low |
| D4 | No failure alerting beyond GitHub's default email. If the export silently starts failing, staleness only shows via the "last updated" footer. | export-events.yml | Low |
| D5 | ICS `URL:` values aren't escaped (a comma in a URL would corrupt the line). Low likelihood, one-line fix via `escapeICSText`. | [export-events.mjs:130](../scripts/export-events.mjs) | Low |
| D6 | `.ics` MIME type depends on Netlify defaults. Add a `_headers` file setting `text/calendar; charset=utf-8` for `/events.ics` to be safe across calendar clients. | repo root | Low |

### 4.2 Frontend correctness & code health

| # | Finding | Where | Severity |
|---|---------|-------|----------|
| F1 | `new Date('YYYY-MM-DD')` parses as **UTC midnight**, then local date methods are used. Fine in the UK (UTC/UTC+1), but any visitor west of UTC sees every event one day early. Fix: parse components manually (`const [y,m,d] = str.split('-')`). Affects `getEventsForDate`, `getAllFilteredEvents`, `formatListDate`, `maxEventDate`, `handleSearchSelect`. | [src/app.jsx:582](../src/app.jsx), 490, 629, 946, 983 | Medium |
| F2 | Hardcoded venue list: `venueStyles`/`venueGroups` don't include Bristol Old Vic — the **second-biggest venue** (25 events) is lumped into "Other" with no colour or filter entry. Venue groups should be derived from the data (or at minimum BOV added). | [src/app.jsx:361-380](../src/app.jsx) | Medium |
| F3 | Accessibility (already on the agreed backlog): day cells are `div onClick` — no `tabIndex`, `role="button"`, keyboard handler, or `aria-label`; modals have no focus trap; `textMuted` is 50%-alpha text that likely fails WCAG AA contrast; search input has no accessible label; search results have no keyboard navigation. | src/app.jsx throughout | **High** (owner priority) |
| F4 | ~1,300 lines of CSS live in a template literal *inside* the React component, re-evaluated every render and interpolating theme colours as strings. Works, but it's the main source of bundle bloat and edit-pain. Refactor: static stylesheet + CSS custom properties (`--bg`, `--text`…), dark mode by toggling a class on the root. Pure refactor, no visual change. | [src/app.jsx:1044-2386](../src/app.jsx) | Medium (maintainability) |
| F5 | No deep linking: you can't share a link to a specific day or event. Hash-based state (`#2026-07-15`) is cheap and unlocks social sharing. | src/app.jsx | Medium |
| F6 | `ListView` (and other subcomponents) are defined inside the main component, so they're re-created every render. Harmless today; will bite if they ever hold state/inputs. Move to module scope. | [src/app.jsx:959](../src/app.jsx) | Low |
| F7 | Google Fonts loaded from Google's CDN — the only remaining third-party runtime dependency (React was deliberately vendored). Self-host Nunito for consistency + GDPR tidiness. | [index.html:23-25](../index.html) | Low |
| F8 | `USE_SAMPLE_DATA` flag and `SAMPLE_EVENTS` (26 lines) ship in the production bundle. Trivial dead weight. | [src/app.jsx:8-27](../src/app.jsx) | Low |

### 4.3 Discoverability / SEO

- The site is a JS-only SPA: crawlers see an empty `<div id="root">`. Nobody searching
  "improv Bristol tonight" will find it organically.
- JSON-LD `Event` markup is already an agreed backlog item — best generated **at export
  time** (the export script writes a `<script type="application/ld+json">` payload to a
  static file the page includes, keeping the never-edit-index.html rule intact).
- Title still says "Beta". Decide whether it has earned dropping it (agreed open question).
- No custom domain. A ~£10/year domain (e.g. bristolimprovcalendar.co.uk) improves
  shareability, SEO, and survives any future move off Netlify. Netlify supports custom
  domains on the free tier; Ste already manages DNS in Cloudflare.

### 4.4 Testing & ops

- Zero tests, though `export-events.mjs` already exports `transformEvent`/`buildICS`
  specifically to be testable. A ~50-line `node:test` file + a CI step before the commit
  step would catch ICS regressions (folding, escaping, all-day/no-end-time cases).
- `build-app.yml` and `export-events.yml` both push to `main`; a same-moment run can fail
  on push. Add `git pull --rebase` before `git push` in both.

## 5. Phase 2 — ranked by value for users

Ranking assumes the audience is (a) improv-curious punters and (b) the existing Bristol
improv community. Confidence: medium-high on ordering; no analytics exist yet to confirm.

### P0 — Ingest observability (D1) *before* promoting anything

Coverage was verified accurate (see §3), so this is smaller than first thought — but the
pipeline currently fails *silently* per source, and everything below raises the cost of
unnoticed breakage. Two changes in improv-calendar-sync, an hour or two total:
1. Exit non-zero (or Telegram-alert via the existing n8n bot) when any adapter throws
   or returns 0 events.
2. A per-source floor check (e.g. BIT must return ≥ 20) so a partial break is caught too.
Optionally pair with D1b's dropped-events digest to protect recall as well as uptime.

### P1 — Launch the .ics calendar feed (already built, unlaunched)

Highest value-to-effort on the list; the feature is *done* and soak-testing on Ste's phone.
Launch work:
1. "📅 Get this in your calendar" entry in Settings + a small button by the filters.
2. A modal with: `webcal://bristol-improv-calendar.netlify.app/events.ics` link, plus
   copy-paste instructions for Google Calendar ("From URL"), Apple, Outlook.
3. Optional, trivial at export time: **filtered feeds** — `events-shows.ics`,
   `events-workshops.ics` — for people who only want one kind of thing.
4. `_headers` MIME fix (D6) first.
Ticks the "Downloadable calendar feed" roadmap item users can already see.

### P2 — Per-event "Add to calendar" + shareable links

For people who don't want a subscription, per-event actions cover the "get it into Google
Calendar/iCal" ask with zero accounts:
- Google Calendar template URL (`https://calendar.google.com/calendar/render?action=TEMPLATE&text=…&dates=…&location=…`)
- Client-side generated single-event `.ics` download (a ~20-line blob download; reuse the
  escaping rules from `buildICS`).
- Hash deep link per day (F5) + a "share" button using `navigator.share` on mobile.
Small effort, visible payoff, feeds social sharing.

### P3 — Weekly email newsletter ("This week in Bristol improv")

High strategic value: it's the audience asset, the habit-former, and the thing venues will
care about. But it's a **commitment**, so automate hard:
- **Composition**: n8n (already running on Dockhead) queries Airtable every Monday morning,
  builds the week's listing grouped by day, highlights anything new since last week.
- **Review**: n8n sends the draft to Ste on Telegram for one-tap approve (this pattern
  already exists in his n8n setup) — human tone-check without human drafting.
- **Sending**: Buttondown (free ≤100 subscribers, ~£9/month after; has an API n8n can call)
  or Kit. Double opt-in, unsubscribe link, one-line privacy note — GDPR basics.
- **Signup**: replace/augment the current Google-Form "account interest" box with a real
  email capture in the Settings modal and list footer.
Do this *after* P0 — a newsletter built on a silently-broken pipeline is worse than none.

### P4 — Favourites (localStorage, no accounts)

- Star icon on event cards/list rows; persisted to `localStorage` keyed by a stable event
  id. **Prerequisite**: events currently have no id in `events.json` — add the Airtable
  `record.id` to `transformEvent` output first (also unlocks future features).
- "⭐ Starred" option in the type filter; "export starred as .ics" comes nearly free after P2.
- Ticks the visible "Save favourite events" roadmap item.
Deliberately **not** user accounts: auth, GDPR, and backend hosting are disproportionate
until there's evidence of demand (see P5). localStorage covers ~90% of the value.

### P5 — Analytics (do alongside P1, not after)

Currently flying blind — feature ranking is guesswork without usage data.
**GoatCounter** (free, no cookies, no consent banner needed, one `<script>` tag) or
Netlify Analytics ($9/month, server-side). GoatCounter recommended: free and fits the
privacy posture. Track: visits, calendar-vs-list usage, .ics link clicks, outbound ticket
clicks (the number venues will eventually care about).

### Explicitly deferred (agreed low value right now)

- **User accounts / cross-device sync** — heavy lift, no demonstrated demand.
- **Push/email event reminders** — the .ics feed *is* the reminder mechanism.
- **Performer/group profiles** — nice community feature, big content-maintenance burden.
- **Improv-type tags (shortform/longform/musical)** — would need the classifier to
  extract them at ingest; park until there's evidence people want the filter.

## 6. Quick wins (under an hour each, any order)

1. D5 — escape ICS URLs.
2. D6 — `_headers` file with `text/calendar` for `/events.ics`.
3. D2 — export guard: abort (exit 1, no commit) if fetched events < 50% of the count
   currently in `events.json`, with an override env var.
4. D3 — skip the commit when only `lastUpdated` changed (compare `events` arrays).
5. F2 — add Bristol Old Vic to `venueStyles`/`venueGroups` (or derive groups from data).
6. F1 — safe date parsing helper replacing `new Date('YYYY-MM-DD')`.
7. F8 — strip `SAMPLE_EVENTS` from the production path.
8. Add `record.id` to `transformEvent` output (P4 prerequisite, backwards compatible).
9. Tests for `transformEvent`/`buildICS` + CI step.

## 7. Open questions for Ste

1. Has the private .ics soak test (running since ~4 July) behaved on your phone? If yes,
   P1 is unblocked.
2. Drop "Beta" from the title when P1 ships? (Suggested: yes — feed launch is a good moment.)
3. Custom domain: worth ~£10/year now, and which name?
4. What did the "account interest" Google Form actually collect so far? That's the
   closest thing to demand evidence for P3/P4 ordering.
5. Did Hen & Chicken's "Open Jam Night" actually end, or does it just no longer appear
   in listings? (It's absent from the venue's own feed — verified 12 July — so if it
   still runs, it's invisible to *any* scraper and needs a manual Airtable entry.)
