/**
 * Date utils for the calendar component.
 *
 * All date formatting delegates to the library's centralized dayjs instance
 * (which has locale-aware month/weekday names, AM/PM, etc.). Calendar-specific
 * pure-math helpers are kept as-is.
 */

import { dayjs } from '../../_utils/date';

// ---------------------------------------------------------------------------
// Format token mapping
// ---------------------------------------------------------------------------

/**
 * Maps calendar-specific format tokens to dayjs equivalents.
 * The only custom token is `{am}` / `{AM}` which maps to dayjs `A` (AM/PM).
 * All other tokens (YYYY, MMMM, dddd, HH:mm, etc.) are identical in dayjs.
 */
const mapTokens = (fmt: string) => fmt.replace(/\{am\}/gi, 'A');

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

const formatDateLite = (date: Date) => {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${date.getFullYear()}-${m < 10 ? '0' : ''}${m}-${d < 10 ? '0' : ''}${d}`;
};

const formatTimeLite = (date: Date) => {
  const h = date.getHours();
  const m = date.getMinutes();
  return `${(h < 10 ? '0' : '') + h}:${(m < 10 ? '0' : '') + m}`;
};

/**
 * Formats a date to the given format string using dayjs.
 *
 * @param {Date} date a JavaScript Date object to format.
 * @param {String} format the wanted format. Default `'YYYY-MM-DD'`.
 * @param {Object} _txts deprecated — kept for API compatibility, no longer used.
 * @return {String} the formatted date.
 */
const formatDate = (date: Date, format = 'YYYY-MM-DD', _txts: unknown = null, locale?: string) => {
  if (!format) format = 'YYYY-MM-DD';
  // Fast path for the most common format.
  if (format === 'YYYY-MM-DD') return formatDateLite(date);
  const value = dayjs(date);
  return (locale ? value.locale(locale) : value).format(mapTokens(format));
};

/**
 * Formats a time (from Date or number of minutes) to the given format.
 *
 * @param {Date | Number} date a JavaScript Date object or a time in minutes.
 * @param {String} format the wanted format. Default `'HH:mm'`.
 * @param {Object} _txts deprecated — kept for API compatibility.
 * @param {Boolean} round if time is 23:59:59, rounds up to 24:00 for formatting only.
 * @return {String} the formatted time.
 */
const formatTime = (
  date: Date | number,
  format = 'HH:mm',
  _txts: unknown = null,
  round = false,
  locale?: string,
) => {
  let shouldRound = false;
  if (round && date instanceof Date) {
    const [h, m, s] = [date.getHours(), date.getMinutes(), date.getSeconds()];
    if (h + m + s === 23 + 59 + 59) shouldRound = true;
  }

  if (date instanceof Date && format === 'HH:mm')
    return shouldRound ? '24:00' : formatTimeLite(date);

  // Handle numeric input (minutes: number).
  let d;
  if (typeof date === 'number') {
    const hours = Math.floor(date / 60);
    const minutes = date % 60;
    d = dayjs().startOf('day').set('hour', hours).set('minute', minutes).set('second', 0);
  } else {
    d = dayjs(date);
  }

  const dayjsFormat = mapTokens(format);
  if (locale) d = d.locale(locale);
  let formatted = d.format(dayjsFormat);

  // Round 23:59:59 to 24:00 for display.
  return shouldRound ? formatted.replace('23:59', '24:00') : formatted;
};

/**
 * Formats minutes (number) to `HH:mm`.
 */
const formatMinutes = (minutes: number) => {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

// ---------------------------------------------------------------------------
// Date manipulation
// ---------------------------------------------------------------------------

const addDays = (date: Date, days: number) => dayjs(date).add(days, 'day').toDate();

const subtractDays = (date: Date, days: number) => dayjs(date).subtract(days, 'day').toDate();

const addHours = (date: Date, hours: number) => dayjs(date).add(hours, 'hour').toDate();

const subtractHours = (date: Date, hours: number) => dayjs(date).subtract(hours, 'hour').toDate();

const addMinutes = (date: Date, minutes: number) => dayjs(date).add(minutes, 'minute').toDate();

const subtractMinutes = (date: Date, minutes: number) =>
  dayjs(date).subtract(minutes, 'minute').toDate();

// ---------------------------------------------------------------------------
// Date comparison
// ---------------------------------------------------------------------------

const isToday = (date: Date) => dayjs(date).isSame(dayjs(), 'day');

const isSameDate = (date1: Date, date2: Date) => {
  if (!date1 || !date2) {
    console.warn(
      `Calendar: missing date${!date1 ? '1' : '2'} parameter for comparison with \`isSameDate(date1: Date, date2: Date)\`.`,
    );
    return false;
  }
  return dayjs(date1).isSame(dayjs(date2), 'day');
};

const isInRange = (date: Date, rangeStart: Date, rangeEnd: Date) => {
  return dayjs(date).isBetween(rangeStart, rangeEnd, null, '[]');
};

const isValid = (date: unknown): date is Date => date instanceof Date && !isNaN(date.getTime());

const isLeapYear = (date: Date) => {
  const year = date.getFullYear();
  return !(year % 400) || (year % 100 && !(year % 4));
};

// ---------------------------------------------------------------------------
// Week & calendar helpers
// ---------------------------------------------------------------------------

/**
 * Returns the ISO week number for the given date.
 * ISO numbering is independent of the display locale and first visible weekday.
 */
const getWeek = (date: Date, _startWeekOnSunday = false) => dayjs(date).isoWeek();

/**
 * Returns the first day of the week containing `date`.
 * Uses this calendar's week-start setting independently of the global date locale.
 */
const getPreviousFirstDayOfWeek = (date: Date, startWeekOnSunday = false) => {
  const start = new Date(date);
  const firstWeekday = startWeekOnSunday ? 0 : 1;
  start.setDate(start.getDate() - ((start.getDay() - firstWeekday + 7) % 7));
  start.setHours(0, 0, 0, 0);
  return start;
};

/**
 * Converts a string or Date to a JavaScript Date object.
 */
const stringToDate = (date: Date | string) => {
  if (date instanceof Date) return date;
  if (!date) return new Date(date);
  return dayjs(date).toDate();
};

/**
 * Returns the associated time in minutes (hours * 60 + minutes).
 */
const dateToMinutes = (date: Date) => date.getHours() * 60 + date.getMinutes();

/**
 * Counts the number of distinct days this date range spans onto.
 * E.g. countDays(2019-11-02 18:00, 2019-11-03 02:00) = 2
 */
const countDays = (start: Date, end: Date) => {
  const s = dayjs(start).startOf('day');
  const e = dayjs(end).startOf('day');
  return e.diff(s, 'day') + 1;
};

/**
 * Checks if two dates are within the same time step (useful in overlapping events).
 */
const datesInSameTimeStep = (date1: Date, date2: Date, timeStep: number) => {
  return Math.abs(date1.getTime() - date2.getTime()) <= timeStep * 60 * 1000;
};

/**
 * Adjusts the given input to the nearest interval.
 *
 * @param {number|Date} input - The input to be adjusted. Can be a number representing minutes or a Date object.
 * @param {number} interval - The interval to snap to.
 * @returns {number|void}
 */
function snapToInterval(input: number, interval: number): number;
function snapToInterval(input: Date, interval: number): void;
function snapToInterval(input: number | Date, interval: number): number | void {
  const adjustMinutes = (minutes: number) => {
    const remainder = minutes % interval;
    if (remainder !== 0) {
      minutes += remainder >= interval / 2 ? interval - remainder : -remainder;
    }
    return minutes;
  };

  if (typeof input === 'number') return adjustMinutes(input);
  if (input instanceof Date) {
    let minutes = adjustMinutes(input.getMinutes());
    if (minutes >= 60) {
      input.setHours(input.getHours() + 1);
      minutes = 0;
    }
    input.setMinutes(minutes, 0, 0);
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Creates the date utils object consumed by all calendar internals.
 * The returned method signatures are kept stable so that component files
 * need no changes.
 */
export const createDateUtils = (getLocale: () => string | undefined = () => undefined) => ({
  addDays,
  subtractDays,
  addHours,
  subtractHours,
  addMinutes,
  subtractMinutes,
  snapToInterval,
  getWeek,
  isToday,
  isSameDate,
  isInRange,
  isLeapYear,
  getPreviousFirstDayOfWeek,
  stringToDate,
  dateToMinutes,
  countDays,
  datesInSameTimeStep,
  isValid,
  formatDate: (date: Date, format = 'YYYY-MM-DD', texts: unknown = null) =>
    formatDate(date, format, texts, getLocale()),
  formatDateLite,
  formatTime: (date: Date | number, format = 'HH:mm', texts: unknown = null, round = false) =>
    formatTime(date, format, texts, round, getLocale()),
  formatTimeLite,
  formatMinutes,
  // Kept as no-op for backward compat (config.js calls it).
  updateTexts: () => {},
});
