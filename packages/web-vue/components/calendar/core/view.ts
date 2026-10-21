import type { CalendarViewMathHost } from '@sdata/web-core/calendar/view-math';

import { ref, computed, watch, onBeforeUnmount, nextTick, reactive } from 'vue';

import { createCalendarClock, createCalendarScroll } from '@sdata/web-core/calendar/clock';
import { createCalendarNavigation } from '@sdata/web-core/calendar/navigation';
import {
  getCalendarRangeStart,
  getCalendarRangeEnd,
  getCalendarExtendedStart,
  getCalendarExtendedEnd,
} from '@sdata/web-core/calendar/view-math';
import {
  getCalendarColumns,
  getCalendarRows,
  getCalendarFirstCellDate,
  getCalendarCellDates,
  calendarContainsToday,
  getCalendarWeekTitle,
  getCalendarTitle,
  getAdjacentCalendarView,
  calendarNowLineVisible,
  getCalendarInitialView,
  getCalendarInitialViewDate,
} from '@sdata/web-core/calendar/view-math';

import type { CalendarState } from '../context';
import type { CalendarElementRef, CalendarScrollbarRef } from '../types';

import { minutesToPercentage } from '../utils/conversions';

export const useView = (
  {
    config,
    dateUtils,
    emit,
    texts,
    eventsManager,
  }: Pick<CalendarState, 'config' | 'dateUtils' | 'emit' | 'texts' | 'eventsManager'>,
  calendarEl: CalendarElementRef,
  scrollbarRef: CalendarScrollbarRef,
) => {
  const { availableViews } = config;
  const viewId = ref(getCalendarInitialView(config, availableViews));
  const selectedDate = ref(config.selectedDate || null);

  // Dates.
  // ------------------------------------------------------
  // Preset at now date on load, but updated every minute if watchRealTime,
  // or updated at least on each cells rerender, in order to keep Today's date accurate.
  const now = ref(new Date());

  // The view date is the one given in prop. It can be any date within the view that will be
  // computed around it - not necessarily the first day of the view range.
  // E.g. [start, ..., viewDate, ..., end]
  const viewDate = ref(getCalendarInitialViewDate(config.viewDate, () => now.value));
  // The starting point of all the calculations.
  // on created and on navigation, two date ranges are computed:
  // [start-end]: the common date range to use.
  // [firstCellDate-endCellDate]: the full visible range including out-of-scope days in month view.
  const startTheoretical = ref(new Date(viewDate.value));

  const mathHost: CalendarViewMathHost = {
    get startTheoretical() {
      return startTheoretical.value;
    },
    config,
    texts,
    dateUtils,
    get viewId() {
      return viewId.value;
    },
    get now() {
      return now.value;
    },
    get extendedStart() {
      return extendedStart.value;
    },
    get extendedEnd() {
      return extendedEnd.value;
    },
    get firstCellDate() {
      return firstCellDate.value;
    },
    get lastCellDate() {
      return lastCellDate.value;
    },
    get start() {
      return start.value;
    },
    get end() {
      return end.value;
    },
    get containsToday() {
      return containsToday.value;
    },
  };

  // One pending timeout: align to the next minute, then update every minute.
  const clock = createCalendarClock({
    get now() {
      return now.value;
    },
    set now(value) {
      now.value = value;
    },
  });
  const initTimeTicker = clock.start;

  const start = computed(() => getCalendarRangeStart(mathHost));
  const end = computed(() => getCalendarRangeEnd(mathHost));

  const extendedStart = computed(() => getCalendarExtendedStart(mathHost));
  const extendedEnd = computed(() => getCalendarExtendedEnd(mathHost));

  const containsToday = computed(() => calendarContainsToday(mathHost));

  // Draw a line in today's cell at the exact current time.
  // Also used in the time column if the option is enabled.
  const nowLine: {
    show: boolean | undefined;
    nowInMinutes: number;
    todaysTimePosition: number;
    style: string;
    currentTime: string;
  } = reactive({
    show: computed(() => calendarNowLineVisible(mathHost)),
    nowInMinutes: computed(() => dateUtils.dateToMinutes(now.value)),
    todaysTimePosition: computed<number>(() => minutesToPercentage(nowLine.nowInMinutes, config)),
    style: computed(() => `${config.horizontal ? 'left' : 'top'}: ${nowLine.todaysTimePosition}%`),
    currentTime: computed(() =>
      dateUtils.formatTime(now.value, config.twelveHour ? 'h:mm {am}' : 'HH:mm'),
    ),
  });

  /**
   * Only if watchRealTime is true.
   * Pull the current time from user machine every minute to keep cal accurate even when idle.
   * This will redraw the now line every minute and ensure that Today's date is always accurate.
   */
  // ------------------------------------------------------

  // Cells.
  // ------------------------------------------------------
  const cols = computed(() => getCalendarColumns(viewId.value, config));
  const rows = computed(() => getCalendarRows(viewId.value, config));

  // Create as many grid cells as defined in the availableViews map (cols * rows).
  const cellsCount = computed(() => cols.value * rows.value);

  const firstCellDate = computed(() =>
    getCalendarFirstCellDate(viewId.value, startTheoretical.value, config, dateUtils),
  );

  // Generates an array of dates for each cell in the view: 1 cell = 1 date range [start, end].
  // IMPORTANT NOTES:
  // - Better performance here than in each cell.
  // - This computed should only manage pure dates: no text, no event, nothing likely to be
  //   triggering recomputing due to a change in the reactivity chain.
  //   Every recomputing can become very expensive when handling a large amount of cells per view
  //   with a large amount of calendar events.
  const cellDates = computed(() =>
    getCalendarCellDates(viewId.value, firstCellDate.value, cellsCount.value, config, dateUtils),
  );

  const lastCellDate = computed(() => cellDates.value[cellDates.value.length - 1].end);
  // ------------------------------------------------------

  // Navigation.
  // ------------------------------------------------------
  // Transition when switching view. Left when going toward the past, right when going toward future.
  const transitionDirection = ref('right');

  /**
   * {String|undefined} The next available broader view from the current view.
   */
  const broaderView = computed(() =>
    getAdjacentCalendarView(viewId.value, config.availableViews, 1),
  );

  /**
   * {String|undefined} The next available narrower view from the current view.
   */
  const narrowerView = computed(() =>
    getAdjacentCalendarView(viewId.value, config.availableViews, -1),
  );

  const titleWeekInfo = computed(() => getCalendarWeekTitle(mathHost));

  const title = computed(() => getCalendarTitle(mathHost));

  /**
   * This function is called after each view variable update and will recompute the theoretical view
   * [start-end] date range.
   * `startTheoretical` is updated
   *  > triggers a recomputation of `firstCellDate`
   *    > triggers a recomputation of `cellDates`
   *      > triggers a recomputation of `events`.
   * The practical view date range may differ when hiding weekdays, or on month view due to out of
   * scope dates.
   */
  const {
    updateView,
    updateViewIfNeeded,
    switchView,
    switchToBroaderView,
    switchToNarrowerView,
    previous,
    next,
    navigate,
    goToToday,
    updateViewDate,
    updateSelectedDate,
    switchWeekStart,
    toggleWeekends,
    toggleWeekdays,
  } = createCalendarNavigation({
    config,
    dateUtils,
    emit,
    nextRender: nextTick,
    get startTheoretical() {
      return startTheoretical.value;
    },
    set startTheoretical(value) {
      startTheoretical.value = value;
    },
    get viewDate() {
      return viewDate.value;
    },
    set viewDate(value) {
      viewDate.value = value;
    },
    get now() {
      return now.value;
    },
    set now(value) {
      now.value = value;
    },
    get viewId() {
      return viewId.value;
    },
    set viewId(value) {
      viewId.value = value;
    },
    get cellsCount() {
      return cellsCount.value;
    },
    get broaderView() {
      return broaderView.value;
    },
    get narrowerView() {
      return narrowerView.value;
    },
    get transitionDirection() {
      return transitionDirection.value;
    },
    set transitionDirection(value) {
      transitionDirection.value = value;
    },
    get firstCellDate() {
      return firstCellDate.value;
    },
    get lastCellDate() {
      return lastCellDate.value;
    },
    get extendedStart() {
      return extendedStart.value;
    },
    get start() {
      return start.value;
    },
    get end() {
      return end.value;
    },
    get selectedDate() {
      return selectedDate.value;
    },
    set selectedDate(value) {
      selectedDate.value = value;
    },
    snapshot: () => ({
      id: viewId.value,
      title: title.value,
      start: start.value,
      end: end.value,
      extendedStart: extendedStart.value,
      extendedEnd: extendedEnd.value,
      cellDates: cellDates.value,
      containsToday: containsToday.value,
      events: events.value,
    }),
  });

  const { scrollToTime, scrollToCurrentTime, scrollTop } = createCalendarScroll({
    config,
    scrollTop: (value) => {
      scrollbarRef.value?.scrollTop(value);
    },
  });
  // ------------------------------------------------------

  // Array of IDs inside an object indexed by cell dates.
  const events = computed(() => eventsManager.getViewEvents(cellDates.value));

  const createEvent = eventsManager.createEvent;

  const deleteEvent = eventsManager.deleteEvent;
  // ------------------------------------------------------

  watch(
    () => config.view,
    (view) => switchView(view, false),
  );
  watch(() => config.availableViews, updateViewIfNeeded);
  watch(
    () => config.datePicker,
    () => switchView('month'),
  );
  watch(
    () => config.viewDate,
    (date) => updateViewDate(date, false),
  );
  watch(
    () => config.selectedDate,
    (date) => {
      if (date === undefined) selectedDate.value = null;
      else updateSelectedDate(date, false);
    },
  );
  watch(
    () => config.startWeekOnSunday,
    (bool) => switchWeekStart(bool),
  );
  watch(
    () => config.hideWeekends,
    (bool) => toggleWeekends(bool),
  );
  watch(() => config.hideWeekdays, toggleWeekdays);
  watch(
    () => cellsCount.value,
    () => {
      if (cellsCount.value > 90)
        console.warn(
          'Calendar: high cell count detected. Performance may degrade when interactions are enabled.',
        );
    },
  );
  watch(
    () => config.watchRealTime && config.time,
    (enabled) => {
      if (enabled) initTimeTicker();
      else {
        clock.stop();
      }
    },
  );

  updateView();

  // Timers are expensive, this should only trigger on demand.
  if (config.time && config.watchRealTime) initTimeTicker();

  onBeforeUnmount(clock.stop); // Stop the time ticker.

  // ! \ IMPORTANT NOTE:
  // If the selectedDate prop would be added to the view, any click on any cell (triggering an emit
  // of the selectedDate), would trigger a re-rendering of all the cells of the view.
  return {
    now,
    id: viewId,
    broaderView,
    narrowerView,
    title,
    titleWeekInfo,
    viewDate,
    start,
    end,
    extendedStart, // Full range, including out of scope month days, and hidden leading/trailing days.
    extendedEnd, // Full range, including out of scope month days, and hidden leading/trailing days.
    firstCellDate,
    lastCellDate,
    containsToday,
    nowLine,
    selectedDate,
    cellDates,
    cols,
    rows,
    // All the events are stored and indexed in the events object of the eventsManager.
    // The following events array is only a subset of visible ones, plus any potential recurring
    // and multi-day events.
    events,
    transitionDirection,
    switch: (id: string, date?: Date | string) => switchView(id, true, date),
    broader: switchToBroaderView,
    narrower: switchToNarrowerView,
    previous,
    next,
    navigate,
    goToToday,
    updateViewDate,
    updateSelectedDate,
    scrollToCurrentTime,
    scrollToTime,
    scrollTop,
    createEvent,
    deleteEvent,
    // Getters.
    get isDay() {
      return viewId.value === 'day';
    },
    get isDays() {
      return viewId.value === 'days';
    },
    get isWeek() {
      return viewId.value === 'week';
    },
    get isMonth() {
      return viewId.value === 'month';
    },
    get isYear() {
      return viewId.value === 'year';
    },
    get isYears() {
      return viewId.value === 'years';
    },
  };
};
