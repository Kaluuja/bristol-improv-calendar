/**
 * Tilt Improv's own shows and workshops link to tiltimprov.co.uk, not straight
 * to Headfirst: the Tilt page has the details and links on to the tickets.
 *
 * The Tilt site has a page per show (/shows/wednesday-night-improv-9-december-2026/)
 * and per workshop (/school/workshops/getting-unstuck/). An event matches a page
 * when every word of the page's slug is in the event's title and, for a dated
 * slug, the dates agree. Undated workshop pages also need the event to link to
 * a Headfirst listing the page itself links to, or (for slugs of two words or
 * more) to be at a venue Tilt uses, so "Improv Taster" or "Mischief" somewhere
 * else doesn't get pulled in.
 *
 * Tilt shows with no page of their own yet go to /shows/.
 */

const TILT = 'https://tiltimprov.co.uk';
const TILT_VENUES = /hen\s*(&|and)\s*chicken/i;
/** Titles that are always Tilt shows, page or not */
const TILT_SHOWS = /wednesday\s*night\s*improv|this\s*is\s*your\s*musical|\btilt\s*improv\b/i;

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july',
  'august', 'september', 'october', 'november', 'december'];

const words = (text) => (text || '').toLowerCase().replace(/[’']/g, '').split(/[^a-z0-9]+/).filter(Boolean);

/** Headfirst event number from a hdfst.uk short link or a full Headfirst URL */
export function headfirstId(url) {
  const match = (url || '').match(/hdfst\.uk\/e(\d+)|headfirstbristol\.co\.uk\/whats-on\/[^?#]*-(\d{5,})\/?(?:[?#]|$)/i);
  return match ? match[1] || match[2] : null;
}

/** "/shows/wednesday-night-improv-9-december-2026/" → { words, date: '2026-12-09' } */
export function parseTiltPath(path) {
  const slug = path.replace(/\/+$/, '').split('/').pop() || '';
  const dated = slug.match(/^(.*)-(\d{1,2})-([a-z]+)-(\d{4})$/);
  if (dated && MONTHS.includes(dated[3])) {
    const month = String(MONTHS.indexOf(dated[3]) + 1).padStart(2, '0');
    return { words: words(dated[1]), date: `${dated[4]}-${month}-${dated[2].padStart(2, '0')}` };
  }
  return { words: words(slug), date: null };
}

/**
 * Pick the Tilt page for a calendar event, or null.
 * event: { title, venue, date: 'YYYY-MM-DD', url }
 * pages: [{ url, words, date, ids: Set<string> }]
 */
export function tiltUrlFor(event, pages) {
  if ((event.url || '').includes('tiltimprov.co.uk')) return event.url;

  const titleWords = new Set(words(event.title));
  const id = headfirstId(event.url);
  const atTiltVenue = TILT_VENUES.test(event.venue || '');

  const matches = pages.filter((page) => {
    if (!page.words.length || !page.words.every((w) => titleWords.has(w))) return false;
    if (page.date) return page.date === event.date;
    if (id && page.ids.has(id)) return true;
    // One-word pages ("Mischief", "Beginners") are too loose on the venue alone
    return atTiltVenue && page.words.length >= 2;
  });
  if (matches.length) {
    // Most specific first; a page that links to this very listing breaks ties
    matches.sort((a, b) =>
      b.words.length - a.words.length || Number(Boolean(id && b.ids.has(id))) - Number(Boolean(id && a.ids.has(id)))
    );
    return matches[0].url;
  }

  return TILT_SHOWS.test(event.title || '') ? `${TILT}/shows/` : null;
}

/** Fetch the Tilt site's show and workshop pages. Returns [] if the site can't be reached. */
export async function fetchTiltPages() {
  try {
    const paths = new Set();
    for (const index of ['/shows/', '/school/']) {
      const response = await fetch(TILT + index);
      if (!response.ok) continue;
      const html = await response.text();
      for (const [, path] of html.matchAll(/href="(?:https:\/\/tiltimprov\.co\.uk)?(\/(?:shows|school)\/[^"#?]+)"/g)) {
        const depth = path.replace(/\/+$/, '').split('/').length;
        if (depth >= 3 && !/\/workshops\/?$/.test(path)) paths.add(path.endsWith('/') ? path : `${path}/`);
      }
    }

    const pages = [];
    for (const path of paths) {
      const ids = new Set();
      try {
        const response = await fetch(TILT + path);
        if (response.ok) {
          for (const [, id] of (await response.text()).matchAll(/hdfst\.uk\/e(\d+)/g)) ids.add(id);
        }
      } catch {
        // Page still usable for title matching
      }
      pages.push({ url: TILT + path, ...parseTiltPath(path), ids });
    }
    // A listing linked from most pages is a site-wide promo, not the page's own event
    const counts = new Map();
    for (const page of pages) for (const id of page.ids) counts.set(id, (counts.get(id) || 0) + 1);
    for (const page of pages) {
      for (const id of page.ids) if (pages.length > 2 && counts.get(id) > pages.length / 2) page.ids.delete(id);
    }
    return pages;
  } catch (error) {
    console.warn(`Couldn't read tiltimprov.co.uk (${error.message}); Tilt events keep their own links`);
    return [];
  }
}
