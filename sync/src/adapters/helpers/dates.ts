const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const DAY_MS = 86_400_000;

/**
 * Pick the year for a listing that gives a day and month but no year.
 *
 * If the listing names the weekday ("Mon 9 Feb"), that settles it: a date's
 * weekday shifts by 1-2 days each year, so exactly one of last year, this
 * year and next year matches. Otherwise assume this year, unless the date is
 * more than 60 days gone, in which case it's next year's.
 *
 * Don't compare against "now" to the minute: a show listed for tonight has
 * already "passed" at midnight, and bumping it a year created phantom
 * next-year events (Sept 2026).
 *
 * @param month 0-11
 */
export function inferYear(month: number, day: number, weekday?: string, now = new Date()): number {
  const thisYear = now.getFullYear();

  const target = weekday ? WEEKDAYS.indexOf(weekday.slice(0, 3).toLowerCase()) : -1;
  if (target >= 0) {
    const match = [thisYear, thisYear + 1, thisYear - 1].find(
      (y) => new Date(Date.UTC(y, month, day)).getUTCDay() === target
    );
    if (match !== undefined) return match;
  }

  const today = Date.UTC(thisYear, now.getMonth(), now.getDate());
  return Date.UTC(thisYear, month, day) < today - 60 * DAY_MS ? thisYear + 1 : thisYear;
}
