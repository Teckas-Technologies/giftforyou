/**
 * Centralized date handling.
 *
 * All dates in the app are interpreted and displayed in US Eastern Time,
 * regardless of the device's local time zone. This fixes off-by-one errors
 * where a birthday entered as e.g. "May 5" would render as "May 4" on
 * devices in time zones ahead of UTC (the device was in India time).
 *
 * Backend `DATE` columns (birthday, event_date) come back as plain
 * "YYYY-MM-DD" strings with no time or zone. `new Date("YYYY-MM-DD")`
 * parses those as UTC midnight, which then shifts a calendar day when
 * formatted in any non-UTC zone. We avoid that by anchoring such values
 * to noon UTC, which lands on the same calendar day in Eastern Time.
 */

export const APP_TIME_ZONE = 'America/New_York';

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Parse a backend/UI date value into a Date that represents the correct
 * calendar day with no time-zone drift.
 * @param {string|number|Date|null|undefined} value
 * @returns {Date|null}
 */
export function parseAppDate(value) {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;

  const s = String(value);
  const m = DATE_ONLY.exec(s);
  if (m) {
    // Noon UTC -> same calendar date once shifted into ET (UTC-4/-5).
    return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], 12, 0, 0));
  }

  const dt = new Date(s);
  return isNaN(dt.getTime()) ? null : dt;
}

function formatter(opts) {
  return new Intl.DateTimeFormat('en-US', { timeZone: APP_TIME_ZONE, ...opts });
}

/**
 * Format a date value in Eastern Time.
 * @param {*} value
 * @param {Intl.DateTimeFormatOptions} [opts]
 * @param {string} [fallback]
 */
export function formatDate(
  value,
  opts = { month: 'long', day: 'numeric', year: 'numeric' },
  fallback = ''
) {
  const d = parseAppDate(value);
  return d ? formatter(opts).format(d) : fallback;
}

/** "Monday, May 5, 2025" */
export const formatLongDate = (value, fallback = '') =>
  formatDate(
    value,
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
    fallback
  );

/**
 * Calendar parts of a date as seen in Eastern Time. Lets call sites build
 * bespoke strings (e.g. "5 May", "May 5", "5. May") without TZ drift.
 * @returns {{day:number, month:number, year:number, monthLong:string, monthShort:string}|null}
 */
export function getDateParts(value) {
  const d = parseAppDate(value);
  if (!d) return null;
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: APP_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d);
  const get = (t) => parts.find((p) => p.type === t).value;
  const year = +get('year');
  const month = +get('month');
  const day = +get('day');
  const longName = formatter({ month: 'long' }).format(d);
  return {
    day,
    month,
    year,
    monthLong: longName,
    monthShort: longName.slice(0, 3),
  };
}

/**
 * Whole-day difference between a date and "today", both evaluated as
 * Eastern Time calendar dates (DST-safe).
 * @returns {number|null} negative = past, 0 = today, positive = future
 */
export function daysUntil(value) {
  const target = getDateParts(value);
  if (!target) return null;
  const now = getDateParts(new Date());
  const targetUTC = Date.UTC(target.year, target.month - 1, target.day);
  const todayUTC = Date.UTC(now.year, now.month - 1, now.day);
  return Math.round((targetUTC - todayUTC) / 86400000);
}
