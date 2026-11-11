import {
  createCalendarConfigRules,
  getCalendarConfigSize,
  getCalendarHiddenDayCount,
} from '@sdata/web-core/calendar/config';
import { calendarPropDefaults } from '@sdata/web-core/calendar/prop-defaults';

import type { CalendarOptions, CalendarSchedule } from './types.js';

type Host = Parameters<typeof createCalendarConfigRules<CalendarSchedule>>[1];

export function resolveCalendarConfig(
  options: CalendarOptions,
  calendar: Host,
  attrs: Record<string, unknown> = {},
) {
  const supplied = Object.fromEntries(
    Object.entries(options).filter(([, value]) => value !== undefined),
  ) as CalendarOptions;
  const props = {
    ...calendarPropDefaults,
    businessHours: {},
    disableDays: [],
    events: [],
    hideWeekdays: [],
    specialHours: {},
    schedules: [],
    views: undefined,
    ...supplied,
  };
  const rules: ReturnType<typeof createCalendarConfigRules<CalendarSchedule>> =
    createCalendarConfigRules<CalendarSchedule>(
      props,
      calendar,
      {
        get availableViews() {
          return rules.availableViews();
        },
        get hideWeekdays() {
          return rules.hideWeekdays();
        },
        get rawSpecialHours() {
          return rules.rawSpecialHours();
        },
        get specialHours() {
          return rules.specialHours();
        },
      },
      attrs,
    );
  return {
    ...props,
    get view() {
      return rules.view();
    },
    get sm() {
      return rules.sm();
    },
    get xs() {
      return rules.xs();
    },
    get clickToNavigate() {
      return rules.clickToNavigate();
    },
    get eventListeners() {
      return rules.eventListeners();
    },
    get hideWeekdays() {
      return rules.hideWeekdays();
    },
    get hideWeekends() {
      return rules.hideWeekends();
    },
    get availableViews() {
      return rules.availableViews();
    },
    get defaultView() {
      return rules.defaultView();
    },
    get selectedDate() {
      return rules.selectedDate();
    },
    get disableDays() {
      return rules.disableDays();
    },
    get minTimestamp() {
      return rules.minTimestamp();
    },
    get maxTimestamp() {
      return rules.maxTimestamp();
    },
    get schedules() {
      return rules.schedules();
    },
    get specialHours() {
      return rules.specialHours();
    },
    get specialHoursDisallowed() {
      return rules.specialHoursDisallowed();
    },
    get editableEvents() {
      return rules.editableEvents();
    },
    get showCellEventCount() {
      return rules.showCellEventCount();
    },
    get allDayEvents() {
      return rules.allDayEvents();
    },
    get horizontal() {
      return rules.horizontal();
    },
    get timeAtCursor() {
      return rules.timeAtCursor();
    },
    get hasHiddenDays() {
      return getCalendarHiddenDayCount(rules.hideWeekdays());
    },
    get size() {
      return getCalendarConfigSize({ xs: rules.xs(), sm: rules.sm() });
    },
  };
}
