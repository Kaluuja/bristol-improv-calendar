/**
 * Export approved events from Airtable to events.json and events.ics
 * Runs in GitHub Actions - no dependencies needed (uses built-in fetch)
 */

import fs from 'fs';
import { pathToFileURL } from 'url';

const TABLE_NAME = 'Events';

async function fetchApprovedEvents(apiKey, baseId) {
  const events = [];
  let offset = null;

  do {
    const params = new URLSearchParams({
      filterByFormula: '{Status} = "Approved"',
      'sort[0][field]': 'Start',
      'sort[0][direction]': 'asc',
    });
    if (offset) params.set('offset', offset);

    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(TABLE_NAME)}?${params}`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status}`);
    }

    const data = await response.json();
    events.push(...data.records);
    offset = data.offset;
  } while (offset);

  return events;
}

/**
 * Turn a Start/End value into its Europe/London wall-clock reading.
 *
 * - With a zone (`2026-09-16T18:30:00.000Z`, `+01:00`): a true instant, which is
 *   what Airtable holds now that the sync runs in London time. Convert it.
 * - Without one (`2026-09-16T19:30:00`): already London wall time. That's the
 *   convention for data/manual-events.json, and for values addHoursToDateTime
 *   returns. Read it verbatim.
 *
 * History: until Sept 2026 the sync ran in UTC and stored wall-clock time
 * labelled Z, so this function used to read every value verbatim. Records the
 * sync hasn't refreshed since then (past events only) show an hour late in BST.
 */
const WALL_CLOCK = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?(Z|[+-]\d{2}:?\d{2})?$/;

const LONDON_PARTS = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/London',
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit',
  hourCycle: 'h23',
});

function parseWallClock(value) {
  const match = WALL_CLOCK.exec(String(value));
  if (!match) {
    throw new Error(`Unrecognised date/time from Airtable: ${JSON.stringify(value)}`);
  }
  const [, year, month, day, hour, minute, second = '00', zone] = match;
  if (!zone) return { year, month, day, hour, minute, second };

  const parts = Object.fromEntries(
    LONDON_PARTS.formatToParts(new Date(value)).map(({ type, value: v }) => [type, v])
  );
  return {
    year: parts.year, month: parts.month, day: parts.day,
    hour: parts.hour, minute: parts.minute, second: parts.second,
  };
}

function formatTime(startISO, endISO) {
  const start = parseWallClock(startISO);
  const startTime = `${start.hour}:${start.minute}`;

  if (!endISO) return startTime;

  const end = parseWallClock(endISO);
  return `${startTime}–${end.hour}:${end.minute}`;
}

function formatDate(isoString) {
  const { year, month, day } = parseWallClock(isoString);
  return `${year}-${month}-${day}`;
}

const MANUAL_EVENTS_PATH = 'data/manual-events.json';

/**
 * Merge hand-added events (data/manual-events.json) into the Airtable records.
 * These cover what the scraper cannot see - out-of-area venues, word-of-mouth
 * shows - and are dropped automatically once Airtable carries the same title on
 * the same date, so a stale entry can never produce a duplicate.
 */
export function mergeManualEvents(records, manualEvents) {
  const seen = new Set(
    records
      .filter((r) => r.fields.Start && r.fields.Title)
      .map((r) => `${r.fields.Title.trim().toLowerCase()}@${formatDate(r.fields.Start)}`)
  );

  const added = manualEvents.filter((event) => {
    if (!event.fields || !event.fields.Start || !event.fields.Title) return false;
    const key = `${event.fields.Title.trim().toLowerCase()}@${formatDate(event.fields.Start)}`;
    if (seen.has(key)) {
      console.log(`Manual event already in Airtable, skipping: ${event.fields.Title} on ${formatDate(event.fields.Start)}`);
      return false;
    }
    seen.add(key);
    return true;
  });

  // Records with no Start are dropped further down the pipeline, not here - sort
  // them last rather than letting parseWallClock throw on them.
  const sortKey = (r) => (r.fields.Start ? formatICSDateTime(r.fields.Start) : '9999');

  return [...records, ...added].sort((a, b) => {
    const left = sortKey(a);
    const right = sortKey(b);
    return left < right ? -1 : left > right ? 1 : 0;
  });
}

function readManualEvents() {
  let raw;
  try {
    raw = fs.readFileSync(MANUAL_EVENTS_PATH, 'utf8');
  } catch {
    return []; // optional file
  }
  // A malformed supplement should fail the run rather than silently drop events
  const parsed = JSON.parse(raw);
  return parsed.events || [];
}

export function transformEvent(record) {
  const fields = record.fields;
  return {
    date: formatDate(fields.Start),
    title: fields.Title || '',
    venue: fields.Venue || '',
    time: formatTime(fields.Start, fields.End),
    type: (fields.Type || 'show').toLowerCase(),
    url: fields['Tickets URL'] || fields['Event URL'] || '',
    description: '',
  };
}

// --- iCalendar feed ---

function escapeICSText(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

// UTC basic format: 20260401T193000Z
function formatICSDateUTC(iso) {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

// Local date-time form (RFC 5545 3.3.5), paired with TZID=Europe/London.
// London wall clock - see parseWallClock above.
function formatICSDateTime(iso) {
  const { year, month, day, hour, minute, second } = parseWallClock(iso);
  return `${year}${month}${day}T${hour}${minute}${second}`;
}

// Adds hours to a wall-clock reading, returning another wall-clock string.
// Deliberately DST-naive: a 23:00 event running to 01:00 on a clock-change night
// is not a case this calendar has, and keeping it naive means the end time always
// matches what the venue would print on a ticket.
function addHoursToDateTime(iso, hours) {
  const { year, month, day, hour, minute, second } = parseWallClock(iso);
  const date = new Date(Date.UTC(+year, +month - 1, +day, +hour, +minute, +second));
  date.setUTCHours(date.getUTCHours() + hours);

  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}T${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
}

// RFC 5545 requires a VTIMEZONE for any TZID referenced in the calendar. Google and
// Apple infer Europe/London without it; Outlook and several Android clients do not,
// and fall back to UTC - which is exactly the "wrong time" symptom we are fixing.
const VTIMEZONE_EUROPE_LONDON = [
  'BEGIN:VTIMEZONE',
  'TZID:Europe/London',
  'X-LIC-LOCATION:Europe/London',
  'BEGIN:DAYLIGHT',
  'TZOFFSETFROM:+0000',
  'TZOFFSETTO:+0100',
  'TZNAME:BST',
  'DTSTART:19700329T010000',
  'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
  'END:DAYLIGHT',
  'BEGIN:STANDARD',
  'TZOFFSETFROM:+0100',
  'TZOFFSETTO:+0000',
  'TZNAME:GMT',
  'DTSTART:19701025T020000',
  'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
  'END:STANDARD',
  'END:VTIMEZONE',
];

// RFC 5545: content lines should stay within 75 octets; continuation lines start with a space
function foldLine(line) {
  if (line.length <= 74) return line;
  const parts = [line.slice(0, 74)];
  let rest = line.slice(74);
  while (rest.length > 0) {
    parts.push(' ' + rest.slice(0, 73));
    rest = rest.slice(73);
  }
  return parts.join('\r\n');
}

export function buildICS(records, now = new Date()) {
  const dtstamp = formatICSDateUTC(now.toISOString());
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Bristol Improv Calendar//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Bristol Improv Calendar',
    'X-WR-TIMEZONE:Europe/London',
    ...VTIMEZONE_EUROPE_LONDON,
  ];

  for (const record of records) {
    const f = record.fields;
    if (!f.Start) continue;

    // No end time in Airtable: assume 2 hours, same as the site does
    const end = f.End || addHoursToDateTime(f.Start, 2);
    const url = f['Tickets URL'] || f['Event URL'] || '';

    lines.push(
      'BEGIN:VEVENT',
      `UID:${record.id}@bristol-improv-calendar`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;TZID=Europe/London:${formatICSDateTime(f.Start)}`,
      `DTEND;TZID=Europe/London:${formatICSDateTime(end)}`,
      `SUMMARY:${escapeICSText(f.Title || 'Improv event')}`
    );
    if (f.Venue) lines.push(`LOCATION:${escapeICSText(f.Venue)}`);
    if (url) lines.push(`URL:${url}`, `DESCRIPTION:${escapeICSText(`Details and tickets: ${url}`)}`);
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.map(foldLine).join('\r\n') + '\r\n';
}

const SYNC_STALE_AFTER_DAYS = 3;

/**
 * Dead man's switch for the sync, which runs daily on Dockhead. If Dockhead
 * is off or its cron has stopped, nothing there can raise the alarm, but the
 * newest `Last Seen` in Airtable stops moving. Returns the age in days.
 */
export function syncAgeDays(records, now = new Date()) {
  const seen = records
    .filter((r) => r.fields.Source === 'Sync' && r.fields['Last Seen'])
    .map((r) => Date.parse(r.fields['Last Seen']));
  if (seen.length === 0) return Infinity;
  return (now.getTime() - Math.max(...seen)) / 86_400_000;
}

// Flags a stale sync to the workflow (which fails a later step, so GitHub
// emails) without stopping this export from publishing.
function reportSyncFreshness(records, now) {
  const age = syncAgeDays(records, now);
  const stale = age > SYNC_STALE_AFTER_DAYS;
  console.log(`Last sync sighting: ${Number.isFinite(age) ? `${age.toFixed(1)} days ago` : 'never'}`);
  if (stale) {
    console.error(`WARNING: no sync for ${SYNC_STALE_AFTER_DAYS}+ days - is Dockhead up? (sync/dockhead/README.md)`);
  }
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `sync_stale=${stale}\n`);
}

async function main() {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  if (!apiKey || !baseId) {
    console.error('Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID');
    process.exit(1);
  }

  console.log('Fetching approved events from Airtable...');
  const airtableRecords = await fetchApprovedEvents(apiKey, baseId);
  console.log(`Found ${airtableRecords.length} approved events`);
  const now = new Date();

  reportSyncFreshness(airtableRecords, now);

  const manualEvents = readManualEvents();
  const records = mergeManualEvents(airtableRecords, manualEvents);
  if (records.length > airtableRecords.length) {
    console.log(`Merged ${records.length - airtableRecords.length} manual event(s) from ${MANUAL_EVENTS_PATH}`);
  }

  // Keep events from the start of the previous month onwards (current + previous month history)
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    .toLocaleDateString('en-CA', { timeZone: 'Europe/London' });
  const keptRecords = records.filter((r) => r.fields.Start && formatDate(r.fields.Start) >= prevMonthStart);
  console.log(`${keptRecords.length} events from ${prevMonthStart} onwards (including past events this month and last month)`);

  // Guard: a renamed Airtable view or changed token scope returns few/no events;
  // refuse to publish a >50% shrink rather than silently wiping the calendar.
  let previousEvents = null;
  try {
    previousEvents = JSON.parse(fs.readFileSync('events.json', 'utf8')).events;
  } catch {
    // no previous events.json - nothing to compare against
  }
  const previousCount = previousEvents ? previousEvents.length : 0;
  if (previousCount >= 20 && keptRecords.length < previousCount / 2 && process.env.ALLOW_SHRINK !== '1') {
    console.error(
      `Refusing to publish: ${keptRecords.length} events vs ${previousCount} previously (>50% drop). ` +
      'If this shrink is genuine, re-run with ALLOW_SHRINK=1.'
    );
    process.exit(1);
  }

  const newEvents = keptRecords.map(transformEvent);

  // Skip the write (and downstream commit) when only the timestamp would change -
  // avoids a no-op commit + Netlify rebuild every single day.
  if (previousEvents && JSON.stringify(previousEvents) === JSON.stringify(newEvents)) {
    console.log('No change in events since last run - skipping events.json write');
  } else {
    const output = {
      lastUpdated: now.toISOString(),
      events: newEvents,
    };
    fs.writeFileSync('events.json', JSON.stringify(output, null, 2));
    console.log('Written to events.json');
  }

  // Checked separately from events.json: a change to the ICS format alone (rather
  // than to the events) must still ship. DTSTAMP moves every run, so compare
  // without it or the file would rewrite daily and undo the no-op-commit guard.
  const nextICS = buildICS(keptRecords, now);
  let previousICS = null;
  try {
    previousICS = fs.readFileSync('events.ics', 'utf8');
  } catch {
    // no previous events.ics - first run
  }
  const withoutDtstamp = (ics) => ics.replace(/^DTSTAMP:.*$/gm, '');
  if (previousICS !== null && withoutDtstamp(previousICS) === withoutDtstamp(nextICS)) {
    console.log('No change in feed since last run - skipping events.ics write');
  } else {
    fs.writeFileSync('events.ics', nextICS);
    console.log('Written to events.ics');
  }
}

// Only run when executed directly (allows importing buildICS/transformEvent in tests)
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error('Export failed:', err);
    process.exit(1);
  });
}
