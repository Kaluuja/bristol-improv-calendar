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
- ~~No analytics of any kind.~~ **Done 18 July**: GoatCounter live (see P5).
- ~~Feedback form (Google Form) and an "account interest" signup form (Google Form) exist
  in the UI; response volume unknown.~~ **Updated 18 July**: the account-interest form
  has been replaced with a real Buttondown newsletter signup embedded in Settings (see P3
  and Q4). The feedback form is unchanged.

## 4. Findings

### 4.1 Data & pipeline

| # | Finding | Where | Severity |
|---|---------|-------|----------|
| D1 | **Silent per-source failure.** `runPipeline` catches each adapter's errors, logs them to the Actions console, and the workflow still exits green. If the BIT Spektrix API (73% of all listings) broke tomorrow, nothing would alert anyone — the site would just quietly thin out over weeks. Fix: fail the workflow (or send a Telegram alert via the existing n8n bot) when any adapter errors or returns 0 events, and track a per-source expected-minimum. | improv-calendar-sync `src/pipeline.ts:48-61` | **High** |
| D1b | **Classifier recall risk.** A non-BIT event without an improv keyword in title/description is dropped as "no improv signals" — a hypothetical new "Open Jam Night" at a pub would be invisible unless its blurb says "improv". Options: (a) weekly digest of *dropped* events at known comedy venues for a human eyeball; (b) an LLM pass (Haiku-class) on the ambiguous middle — cheap at ~50 events/run; (c) keep growing `ALWAYS_INCLUDE`. | improv-calendar-sync `src/classifier.ts:144-184` | Medium |
| D1c | `docs/sources.md` in the sync repo is stale: says BIT uses the ICS feed (moved to Spektrix API — the ICS feed now returns 0 VEVENTs); Folk House adapter missing from the list; Alma Tavern adapter was removed from `src/` but lingers in `dist/`. | improv-calendar-sync `docs/sources.md` | Low |
| D2 | ~~No empty-feed guard.~~ **Fixed in PR #2**: export now refuses to publish a >50% shrink vs the current `events.json` (override with `ALLOW_SHRINK=1`). | [export-events.mjs](../scripts/export-events.mjs) | Done |
| D3 | ~~`lastUpdated` is rewritten every run, so the Action commits and triggers a Netlify build every day even when nothing changed.~~ **Fixed 18 July**: export now skips the write entirely when the new `events` array matches the previous one, so no commit/deploy fires on a no-op run. | [export-events.mjs](../scripts/export-events.mjs) | Done |
| D4 | No failure alerting beyond GitHub's default email. If the export silently starts failing, staleness only shows via the "last updated" footer. | export-events.yml | Low |
| D5 | ~~ICS `URL:` values aren't escaped.~~ **Withdrawn on closer reading of RFC 5545**: `URL` is a URI value type where commas/semicolons are legal and TEXT escaping would be wrong. Current code is correct (`SUMMARY`/`LOCATION`/`DESCRIPTION` are TEXT and already escaped). No action. | [export-events.mjs:130](../scripts/export-events.mjs) | — |
| D6 | ~~`.ics` MIME type depends on Netlify defaults.~~ **Fixed in PR #2**: `_headers` file serves `/events.ics` as `text/calendar; charset=utf-8`. | repo root | Done |

### 4.2 Frontend correctness & code health

| # | Finding | Where | Severity |
|---|---------|-------|----------|
| F1 | `new Date('YYYY-MM-DD')` parses as **UTC midnight**, then local date methods are used. Fine in the UK (UTC/UTC+1), but any visitor west of UTC sees every event one day early. Fix: parse components manually (`const [y,m,d] = str.split('-')`). Affects `getEventsForDate`, `getAllFilteredEvents`, `formatListDate`, `maxEventDate`, `handleSearchSelect`. | [src/app.jsx:582](../src/app.jsx), 490, 629, 946, 983 | Medium |
| F2 | ~~Hardcoded venue list: `venueStyles`/`venueGroups` don't include Bristol Old Vic — the second-biggest venue (25 events) is lumped into "Other" with no colour or filter entry.~~ **Fixed 18 July**: Bristol Old Vic added as its own venue group/colour. | [src/app.jsx](../src/app.jsx) | Done |
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
- **Signup — done 18 July.** The Google-Form "account interest" box in Settings has been
  replaced with a real Buttondown embed (`buttondown.com/Kaluuja`) — email capture is live
  and building a list now, ahead of any automated send.
- **Composition (not yet built)**: n8n (already running on Dockhead) queries Airtable every
  Monday morning, builds the week's listing grouped by day, highlights anything new since
  last week.
- **Review (not yet built)**: n8n sends the draft to Ste on Telegram for one-tap approve
  (this pattern already exists in his n8n setup) — human tone-check without human drafting.
- **Sending (not yet built)**: Buttondown's API (already signed up, free tier ≤100
  subscribers, ~£9/month after) or Kit. Double opt-in, unsubscribe link, one-line privacy
  note — GDPR basics.
- **Sponsorship (proposed, not built)**: a `Featured` checkbox on the Airtable Events
  table; one paid slot per issue, sold manually (bank transfer/Ko-fi) before building any
  payment flow — test demand before automating it.
Do the automated send *after* P0 — a newsletter built on a silently-broken pipeline is worse
than none. Sponsorship waits until a few issues have gone out cleanly.

### P4 — Favourites (localStorage, no accounts)

- Star icon on event cards/list rows; persisted to `localStorage` keyed by a stable event
  id. **Prerequisite**: events currently have no id in `events.json` — add the Airtable
  `record.id` to `transformEvent` output first (also unlocks future features).
- "⭐ Starred" option in the type filter; "export starred as .ics" comes nearly free after P2.
- Ticks the visible "Save favourite events" roadmap item.
Deliberately **not** user accounts: auth, GDPR, and backend hosting are disproportionate
until there's evidence of demand (see P5). localStorage covers ~90% of the value.

### P5 — Analytics — done 18 July 2026

**GoatCounter** is live (`wednightimprov.goatcounter.com`), script tag in `index.html`.
Beyond raw pageviews, click tracking (`data-goatcounter-click`) is wired up on the
calendar/list view toggle, outbound ticket links, and the newsletter subscribe button —
so feature-ranking decisions can now be evidence-based instead of guesswork. Give it a
few weeks of real traffic before drawing conclusions from it.

### Explicitly deferred (agreed low value right now)

- **User accounts / cross-device sync** — heavy lift, no demonstrated demand.
- **Push/email event reminders** — the .ics feed *is* the reminder mechanism.
- **Performer/group profiles** — nice community feature, big content-maintenance burden.
- **Improv-type tags (shortform/longform/musical)** — would need the classifier to
  extract them at ingest; park until there's evidence people want the filter.

## 6. Quick wins (under an hour each, any order)

1. ~~D5 — escape ICS URLs.~~ Withdrawn — see D5; current behaviour is RFC-correct.
2. ~~D6 — `_headers` file.~~ Done in PR #2.
3. ~~D2 — export guard.~~ Done in PR #2.
4. ~~D3 — skip the commit when only `lastUpdated` changed.~~ Done 18 July.
5. ~~F2 — add Bristol Old Vic to `venueStyles`/`venueGroups`.~~ Done 18 July.
6. F1 — safe date parsing helper replacing `new Date('YYYY-MM-DD')`.
7. F8 — strip `SAMPLE_EVENTS` from the production path.
8. Add `record.id` to `transformEvent` output (P4 prerequisite, backwards compatible).
9. Tests for `transformEvent`/`buildICS` + CI step.

## 7. Open questions for Ste

1. Has the private .ics soak test (running since ~4 July) behaved on your phone? If yes,
   P1 is unblocked.
2. Drop "Beta" from the title when P1 ships? (Suggested: yes — feed launch is a good moment.)
3. Custom domain: worth ~£10/year now, and which name?
4. ~~What did the "account interest" Google Form actually collect so far?~~ **Superseded
   18 July**: the form's been replaced with a real Buttondown newsletter signup, which is a
   cleaner demand signal going forward than the old interest count ever was.
5. ~~Did "Open Jam Night" actually end?~~ **Answered 13 July**: yes, it ended (it was
   the PRSC/Stokes Croft one). BIT's jams ("Improv Jam & Social" monthly, "The Improv
   Lab") are confirmed captured via the Spektrix adapter. No action.

## 8. Alma Tavern / Ticket Tailor investigation (added 13 July 2026)

The Alma Tavern & Theatre lists exclusively on Ticket Tailor
(`tickettailor.com/events/almatheatrecompany`). Verified findings:

- **Every Ticket Tailor path is behind a Cloudflare JS challenge** — the box office
  page, the `buytickets.at` alias (redirects to the same page), and the embed-widget
  iframe path all return 403 "Just a moment" even from a residential IP with browser
  headers. It fingerprints the client, so plain `fetch`/curl can never pass; only a
  real browser engine can.
- **The venue's own Wix site has no listings** — `/theatre` is a static info page
  linking out to Ticket Tailor.
- **Headfirst does not list the Alma.** **Ents24's** venue page exists but the event
  list is JS-rendered (empty HTML). Ste has no route to a Ticket Tailor API key.

Options, in recommended order:

1. **Ask the Alma Theatre Company to list on Headfirst** (free for venues, extra reach
   for them, and the existing Headfirst adapter picks everything up automatically).
   Zero code, zero maintenance. Ste knows the Bristol theatre scene — one friendly email.
2. **Headless-browser fetch from Dockhead**: a small scheduled Playwright script (Docker
   container on the home server, which already runs n8n) loads the Ticket Tailor page
   with real Chromium — residential IP + genuine browser fingerprint passes the
   challenge in the common case — parses events, and POSTs them to Airtable as Pending
   (or to an n8n webhook). Moderate effort; some fragility if Cloudflare escalates.
   Running Playwright inside the GitHub Action instead is possible but less reliable
   (data-centre IPs get challenged harder).
3. **Skiddle public API** (free key, easy signup) — worth checking whether the Alma's
   events appear on Skiddle; unverified as of 13 July.
4. **Manual-lite fallback**: monthly n8n Telegram reminder linking the Ticket Tailor
   page + an Airtable quick-add form. ~5 minutes/month for one venue.

Related "search for improv more widely" levers (from D1b): broaden the Eventbrite
search terms ("improvised", "impro", named organisers), an LLM classification pass on
ambiguous events, and — cheapest of all — a public **"Add your show" submission form**
on the site feeding Airtable as Pending, which reuses the existing Telegram approval
flow and catches everything scrapers can't see.

## 9. Shipped — 18 July 2026

- **This document merged to `main`** via PR #1 (`docs/product-review-2026-07`), alongside
  PR #2 (`fix/ics-hardening` — D2 export guard, D6 `_headers` MIME fix). Both had sat open
  and unmerged since 12–13 July; neither was actually live until this date, despite
  earlier notes to the contrary.
- **D3** (no-op export commits) and **F2** (Bristol Old Vic venue styling) fixed — see
  §4.1/§4.2.
- **P5 (analytics)** shipped: GoatCounter live with click tracking on view toggle, ticket
  links, and newsletter signup.
- **P3 (newsletter) signup step** shipped: Buttondown embed replaces the old
  account-interest Google Form in Settings. Composition/send automation and sponsorship
  are still open (see P3).
- Still outstanding from this review: P0 (ingest observability — improv-calendar-sync
  repo), P1 (ICS feed UI launch), P2 (add-to-calendar/share), P4 (favourites), F1/F8/F3/F4
  and the rest of §6's quick wins, and the "Beta" / custom-domain open questions (§7 Q2–3).
