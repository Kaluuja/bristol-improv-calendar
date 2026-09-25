/**
 * Alma Tavern & Theatre scraper (Ticket Tailor via headless-ish Playwright).
 *
 * Ticket Tailor sits behind a Cloudflare JS challenge that blocks plain fetch,
 * so this runs a real Chromium (headed, under xvfb in Docker) from a
 * residential IP. It parses the box-office listing, reads each event's
 * description page, classifies improv-likelihood with the same keyword
 * signals as ../src/classifier.ts, and upserts improv events to Airtable
 * using the same Fingerprint scheme as ../src/dedupe.ts so the main sync
 * and this scraper never duplicate each other.
 *
 * Env: AIRTABLE_API_KEY, AIRTABLE_BASE_ID, optional AIRTABLE_TABLE_NAME
 *      DRY_RUN=1 to print instead of writing to Airtable.
 * Exit codes: 0 ok, 2 scrape failure (challenge never cleared / zero events).
 */

import { chromium } from 'playwright';

const LIST_URL = 'https://www.tickettailor.com/events/almatheatrecompany';
const VENUE_DISPLAY = 'Alma Tavern & Theatre';
const SOURCE_NAME = 'alma-tickettailor';
const DRY_RUN = process.env.DRY_RUN === '1';

// --- classification (kept in step with src/classifier.ts) ---

const ALWAYS_INCLUDE = [
  /\bup\s*the\s*antics\b/i,
  /\bantics\b.*\bjoke\s*show\b/i,
  /\bcloser\s*each\s*day\b/i,
  /murder.*she.*didn.t.*write/i,
  /\bshowstopper\b/i,
  /\baustentatious\b/i,
  /\bcomedy\s*store\s*players\b/i,
  /\bnoise\s*next\s*door\b/i,
  /\bpaul\s*merton.s\s*impro/i,
  /\bstephen\s*frost.s\s*impro/i,
  /\binstant\s*noodling\b/i,
  /\bracing\s*minds\b/i,
  /\bshoot\s*from\s*the\s*hip\b/i,
  /\bimpromptu\s*shakespeare\b/i,
  /\bbrothers\s*grin\b/i,
  /\bbeansville\b/i,
  /\bblame\s*of\s*thrones\b/i,
  /\bwasteland\b/i,
  /\bjust\s*for\s*a\s*moment\b/i,
  /\bwhose\s+play\s+is\s+it\s+anyway\b/i,
];

const IMPROV_SIGNALS = [
  /\bimprov\b/i,
  /\bimprovised\b/i,
  /\bimprovisation\b/i,
  /\btheatresports\b/i,
  /\bmaestro\b/i,
  /\blong\s*form\b/i,
  /\bshort\s*form\b/i,
  /\bscene\s*work\b/i,
  /\byes\s*and\b/i,
];

const NOT_IMPROV_SIGNALS = [
  /\bjazz\b/i,
  /\blive\s*music\b/i,
  /\bgig\b/i,
  /\bopen\s*mic\b/i,
  /\bstand[- ]?up\b/i,
  /\bcomedy\s*night\b/i,
  /\bquiz\b/i,
  /\bkaraoke\b/i,
  /\btribute\b/i,
  /\bdj\b/i,
  /\bmagic\s*show\b/i,
  /\bmusical\b/i,
  /\bconcert\b/i,
  /\bpanto(?:mime)?\b/i,
];

function isImprov(title, description) {
  const text = `${title}\n${description}`;
  if (ALWAYS_INCLUDE.some((p) => p.test(title))) return { keep: true, reason: 'known improv show' };
  if (NOT_IMPROV_SIGNALS.some((p) => p.test(text))) {
    if (IMPROV_SIGNALS.some((p) => p.test(text)) && /\bimprov/i.test(title)) {
      return { keep: true, reason: 'improv in title despite exclusion keywords' };
    }
    if (IMPROV_SIGNALS.some((p) => p.test(text))) return { keep: false, reason: 'conflicting signals' };
    return { keep: false, reason: 'non-improv keywords' };
  }
  if (IMPROV_SIGNALS.some((p) => p.test(text))) return { keep: true, reason: 'improv keywords' };
  return { keep: false, reason: 'no improv signals' };
}

function classifyType(title, description) {
  const t = title.toLowerCase();
  if (/\bdrop[- ]?ins?\b|\bdropins?\b/.test(t)) return 'Drop-in';
  if (/\bworkshop\b|\bclass\b|\bcourse\b|\blevel\s*\d|\btechnique\b|\bskills\b|\bintro(?:duction)?\s+to\b/.test(t)) return 'Workshop';
  if (/\bjam\b|\blab\b/.test(t)) return 'Jam';
  if (/\bworkshop\b|\bmasterclass\b|\btraining\b/i.test(description)) return 'Workshop';
  return 'Show';
}

// --- fingerprint (faithful copies of src/dedupe.ts normalisers) ---

function normalizeTitle(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/:\s*[^:]+$/, '')
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .trim();
}

function normalizeVenue(venue) {
  return venue
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/\s+/g, ' ')
    .replace(/^the\s+/, '')
    .replace(/theatre|theater/g, 'theatre');
}

function fingerprint(title, startIso, venue) {
  return `${normalizeTitle(title)}|${startIso.slice(0, 10)}|${normalizeVenue(venue)}`;
}

// --- date parsing ---
// Formats: "Fri 17 Jul 2026 8:00 PM - 9:45 PM BST"
//          "Fri 24 Jul 2026 8:00 PM - Sun 26 Jul 2026 5:00 PM BST"
//          "Tue 4 Aug 2026 8:00 PM - Thu 6 Aug 2026 BST"

const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };

function parseDateText(text) {
  const tz = /\bGMT\b/.test(text) ? '+00:00' : '+01:00'; // BST default
  const dateRe = /(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})(?:\s+(\d{1,2}):(\d{2})\s*(AM|PM))?/g;
  const stamps = [];
  let m;
  while ((m = dateRe.exec(text)) !== null) {
    const [, day, mon, year, hh, mm, ap] = m;
    const month = MONTHS[mon.toLowerCase()];
    if (!month) continue;
    let hour = hh ? parseInt(hh, 10) : null;
    if (hour !== null) {
      if (ap === 'PM' && hour < 12) hour += 12;
      if (ap === 'AM' && hour === 12) hour = 0;
    }
    stamps.push({ day: +day, month, year: +year, hour, min: hh ? +mm : null });
  }
  // A bare end-time ("- 9:45 PM") shares the start date
  const endTimeOnly = /-\s*(\d{1,2}):(\d{2})\s*(AM|PM)\s+(?:BST|GMT)/.exec(text);
  if (stamps.length === 0 || stamps[0].hour === null) return null;

  const iso = (s, h, min) =>
    `${s.year}-${String(s.month).padStart(2, '0')}-${String(s.day).padStart(2, '0')}T${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}:00${tz}`;

  const start = new Date(iso(stamps[0], stamps[0].hour, stamps[0].min)).toISOString();
  let end;
  if (stamps.length === 1 && endTimeOnly) {
    let h = parseInt(endTimeOnly[1], 10);
    if (endTimeOnly[3] === 'PM' && h < 12) h += 12;
    if (endTimeOnly[3] === 'AM' && h === 12) h = 0;
    end = new Date(iso(stamps[0], h, +endTimeOnly[2])).toISOString();
  }
  // Multi-day runs (a second full date) get no End - one record on the opening
  // date; the approval step can split it into performances if worth it.
  const multiDay = stamps.length > 1;
  return { start, end, multiDay };
}

// --- scraping ---

async function scrape() {
  const browser = await chromium.launch({
    headless: false, // real headed Chromium (under xvfb in Docker) to pass the CF challenge
    args: ['--disable-blink-features=AutomationControlled', '--no-first-run'],
  });
  const ctx = await browser.newContext({
    viewport: { width: 1366, height: 850 },
    locale: 'en-GB',
    timezoneId: 'Europe/London',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  });
  const page = await ctx.newPage();

  async function gotoPastChallenge(url) {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    for (let i = 0; i < 35; i++) {
      if (!/Just a moment/i.test(await page.title())) return true;
      await page.waitForTimeout(1000);
    }
    return false;
  }

  try {
    if (!(await gotoPastChallenge(LIST_URL))) {
      console.error('FATAL: Cloudflare challenge never cleared on listing page');
      process.exitCode = 2;
      return null;
    }
    await page.waitForTimeout(3000);

    const cards = await page.evaluate(() => {
      return [...document.querySelectorAll('li.events-listing__item')].map((li) => {
        const a = li.querySelector('a[href*="/events/almatheatrecompany/"]');
        const lines = li.innerText.split('\n').map((s) => s.trim()).filter(Boolean);
        return { title: lines[0] || '', dateText: lines[1] || '', url: a ? a.href.split('#')[0] : '' };
      }).filter((c) => c.title && c.url);
    });

    if (cards.length === 0) {
      console.error('FATAL: challenge cleared but zero event cards parsed - page structure may have changed');
      process.exitCode = 2;
      return null;
    }
    console.log(`Parsed ${cards.length} listings from Ticket Tailor`);

    const events = [];
    for (const card of cards) {
      const when = parseDateText(card.dateText);
      if (!when) {
        console.log(`  ⊘ Skipped (unparseable date "${card.dateText}"): ${card.title}`);
        continue;
      }
      // description page (same session, challenge cookie already set)
      let description = '';
      try {
        await page.goto(card.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await page.waitForTimeout(1500);
        description = await page.evaluate(() => document.body.innerText.slice(0, 4000));
      } catch {
        console.log(`  ! Could not load detail page for ${card.title} - classifying on title only`);
      }
      const verdict = isImprov(card.title, description);
      if (!verdict.keep) {
        console.log(`  ⊘ ${card.title} (${verdict.reason})`);
        continue;
      }
      const type = classifyType(card.title, description);
      console.log(`  ✓ [${type}] ${card.title} @ ${when.start}${when.multiDay ? ' (multi-day run)' : ''} (${verdict.reason})`);
      events.push({
        title: card.title,
        start: when.start,
        end: when.end,
        url: card.url,
        type,
        fingerprint: fingerprint(card.title, when.start, VENUE_DISPLAY),
      });
    }
    return events;
  } finally {
    await browser.close();
  }
}

// --- Airtable upsert (REST, matching src/adapters/airtable.ts semantics) ---

async function airtable(path, options = {}) {
  const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } = process.env;
  const table = process.env.AIRTABLE_TABLE_NAME || 'Events';
  const res = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(table)}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}`, 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Airtable ${res.status}: ${JSON.stringify(data).slice(0, 200)}`);
  return data;
}

async function fetchExisting() {
  const map = new Map();
  let offset;
  do {
    const data = await airtable(`?pageSize=100${offset ? `&offset=${offset}` : ''}`);
    for (const r of data.records) {
      if (r.fields.Fingerprint) map.set(r.fields.Fingerprint, r);
    }
    offset = data.offset;
  } while (offset);
  return map;
}

async function syncToAirtable(events) {
  const existing = await fetchExisting();
  const now = new Date().toISOString();
  const toCreate = [];
  const toUpdate = [];

  for (const e of events) {
    const rec = existing.get(e.fingerprint);
    if (rec) {
      if ((rec.fields.Source || '').toLowerCase() === 'manual') continue;
      toUpdate.push({ id: rec.id, fields: { 'Last Seen': now } });
    } else {
      toCreate.push({
        fields: {
          Title: e.title,
          Start: e.start,
          ...(e.end ? { End: e.end } : {}),
          Venue: VENUE_DISPLAY,
          'Tickets URL': e.url,
          'Event URL': e.url,
          Type: e.type,
          Status: 'Pending',
          Source: 'Sync',
          Fingerprint: e.fingerprint,
          'Source Event ID': `${SOURCE_NAME}:${e.url}`,
          'First Seen': now,
          'Last Seen': now,
        },
      });
    }
  }

  if (DRY_RUN) {
    console.log(`\nDRY RUN - would create ${toCreate.length}, refresh Last Seen on ${toUpdate.length}`);
    for (const r of toCreate) console.log(`  + ${r.fields.Title} (${r.fields.Start})`);
    return;
  }
  for (let i = 0; i < toCreate.length; i += 10) {
    await airtable('', { method: 'POST', body: JSON.stringify({ records: toCreate.slice(i, i + 10) }) });
  }
  for (let i = 0; i < toUpdate.length; i += 10) {
    await airtable('', { method: 'PATCH', body: JSON.stringify({ records: toUpdate.slice(i, i + 10) }) });
  }
  console.log(`\nSynced: created ${toCreate.length} (as Pending), refreshed ${toUpdate.length}`);
}

// --- main ---

if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
  console.error('Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID');
  process.exit(1);
}
// Watchdog: a hung browser (e.g. undersized /dev/shm without --ipc=host) must
// never wedge a cron run indefinitely.
setTimeout(() => {
  console.error('FATAL: watchdog timeout (12 min) - aborting');
  process.exit(2);
}, 12 * 60 * 1000).unref();
const events = await scrape();
if (events === null) process.exit(process.exitCode || 2);
console.log(`\n${events.length} improv event(s) found at the Alma`);
await syncToAirtable(events);
process.exit(0);
