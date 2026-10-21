import type { CalendarTexts } from './types.js';

export const minutesInADay = 24 * 60;

export const defaults: {
  texts: CalendarTexts;
  availableViews: Record<string, { cols: number; rows: number }>;
} = {
  texts: {
    weekDays: Array(7).fill(''),
    weekDaysShort: [],
    weekDaysMin: [],
    months: Array(12).fill(''),
    years: '',
    year: '',
    month: '',
    week: '',
    day: '',
    days: '',
    today: '',
    noEvent: '',
    allDay: '',
    deleteEvent: '',
    createEvent: '',
    dateFormat: 'dddd MMMM D, YYYY',
    am: 'am',
    pm: 'pm',
    truncations: true,
  },

  availableViews: {
    day: { cols: 1, rows: 1 },
    days: { cols: 10, rows: 1 },
    week: { cols: 7, rows: 1 },
    month: { cols: 7, rows: 6 },
    year: { cols: 4, rows: 3 },
    years: { cols: 5, rows: 5 }, // Arbitrary range of quarters of century (25y).
  },
};

// Short labels for CSS classes.
export const months = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
];
export const weekdays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
