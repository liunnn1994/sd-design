import type { CalendarEmit } from './types.js';
import type { createDateUtils } from './utils/date.js';

export function createCalendarNavigation(adapter: {
  config: {
    availableViews: Record<string, { cols: number; rows: number }>;
    ready: boolean;
    startWeekOnSunday: boolean;
    hideWeekdays: Record<number, boolean>;
  };
  dateUtils: ReturnType<typeof createDateUtils>;
  emit: CalendarEmit;
  startTheoretical: Date;
  viewDate: Date;
  now: Date;
  viewId: string;
  selectedDate: Date | null;
  transitionDirection: string;
  readonly cellsCount: number;
  readonly broaderView: string | undefined;
  readonly narrowerView: string | undefined;
  readonly firstCellDate: Date;
  readonly lastCellDate: Date;
  readonly extendedStart: Date;
  readonly start: Date;
  readonly end: Date;
  snapshot(): Record<string, unknown>;
  nextRender(): Promise<unknown>;
}) {
  const { config, dateUtils, emit } = adapter;
  async function updateView() {
    adapter.startTheoretical = new Date(adapter.viewDate || adapter.now);
    adapter.startTheoretical.setHours(0, 0, 0, 0);

    switch (adapter.viewId) {
      case 'day':
        break;
      case 'days':
        break;
      case 'week':
        adapter.startTheoretical = dateUtils.getPreviousFirstDayOfWeek(
          adapter.startTheoretical,
          config.startWeekOnSunday && !config.hideWeekdays[7],
        );
        break;
      case 'month':
        adapter.startTheoretical = new Date(
          adapter.startTheoretical.getFullYear(),
          adapter.startTheoretical.getMonth(),
          1,
          0,
          0,
          0,
          0,
        );
        break;
      case 'year':
        adapter.startTheoretical = new Date(
          adapter.startTheoretical.getFullYear(),
          0,
          1,
          0,
          0,
          0,
          0,
        );
        break;
      case 'years':
        // The modulo is only here to always cut off at the same years regardless of the current year.
        // E.g. always [1975-1999], [2000-2024], [2025-2099] for the default 5*5 grid.
        adapter.startTheoretical = new Date(
          adapter.startTheoretical.getFullYear() -
            (adapter.startTheoretical.getFullYear() % adapter.cellsCount),
          0,
          1,
          0,
          0,
          0,
          0,
        );
        break;
    }

    // Updating `now` will re-trigger the computed `todaysTimePosition` in cell.vue.
    // Does not cost much to update when not watching real time as it is only computed when the view
    // is updated.
    adapter.now = new Date();

    if (config.ready) {
      // Use nextTick to emit after the current update cycle is complete,
      // to ensure all computed values are up to date and to prevent cascading updates.
      await adapter.nextRender();
      emit('view-change', adapter.snapshot());
    }
  }

  /**
   * Only call the updateView function (which redraws the cells) if the current view changes.
   *
   * @param {Object} views the new available views object.
   */
  function updateViewIfNeeded(views: Record<string, { cols: number; rows: number }>) {
    const currView = adapter.viewId;
    const currViewLayout = config.availableViews[currView]; // cols * rows.
    if (!(views[currView] && JSON.stringify(views[currView]) === JSON.stringify(currViewLayout))) {
      updateView();
    }
  }

  function switchView(id: string, emitUpdate = true, date: Date | string | null = null) {
    const availableViews = Object.keys(config.availableViews);

    if (adapter.viewId === id && !date) return;
    if (availableViews.includes(id)) {
      adapter.transitionDirection =
        availableViews.indexOf(id) < availableViews.indexOf(adapter.viewId) ? 'left' : 'right';

      if (emitUpdate && adapter.viewId !== id) emit('update:view', id); // Emit the view change only if the view is actually changing.
      adapter.viewId = id;
      if (date) updateViewDate(date); // Then calls updateView().
      else updateView();
    } else console.warn(`Calendar: the \`${id}\` view is not available.`);
  }

  function switchToBroaderView() {
    if (adapter.broaderView) switchView(adapter.broaderView);
    else console.warn('Calendar: no broader view is available.');
  }

  function switchToNarrowerView() {
    if (adapter.narrowerView) switchView(adapter.narrowerView);
    else console.warn('Calendar: no narrower view is available.');
  }

  function previous() {
    navigate(false);
  }

  function next() {
    navigate(true);
  }

  /**
   * Navigate to the next or previous similar view.
   *
   * @param {bool} forward
   */
  function navigate(forward = true) {
    let newViewDate = new Date(adapter.viewDate);

    switch (adapter.viewId) {
      case 'day':
      case 'days':
        // In days view, hiding weekdays will extend the date range of as many skipped days, so
        // navigating to the next range should take in account the last calculated cell date.
        if (forward) newViewDate = dateUtils.addDays(adapter.lastCellDate, 1);
        else newViewDate = dateUtils.subtractDays(adapter.firstCellDate, adapter.cellsCount);
        break;
      case 'week': {
        if (forward) {
          // Advance by one calendar week from the first visible cell (not extendedEnd + 1).
          // When weekends are hidden and the week starts on Sunday, extendedEnd + 1 can land on a
          // hidden Sunday; updateView then snaps back to the same week (#67).
          newViewDate = dateUtils.addDays(adapter.firstCellDate, 7);
          newViewDate.setHours(0, 0, 0, 0);
        } else newViewDate = dateUtils.subtractDays(adapter.extendedStart, adapter.cellsCount);
        break;
      }
      case 'month': {
        const increment = forward ? 1 : -1;
        newViewDate = new Date(
          newViewDate.getFullYear(),
          newViewDate.getMonth() + increment,
          1,
          0,
          0,
          0,
          0,
        );
        break;
      }
      case 'year': {
        const increment = forward ? 1 : -1;
        newViewDate = new Date(newViewDate.getFullYear() + increment, 1, 1, 0, 0, 0, 0);
        break;
      }
      case 'years': {
        const increment = forward ? adapter.cellsCount : -adapter.cellsCount;
        newViewDate = new Date(newViewDate.getFullYear() + increment, 1, 1, 0, 0, 0, 0);
        break;
      }
    }

    updateViewDate(newViewDate);
  }

  function goToToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    updateViewDate(today);
  }

  /**
   * Takes the view to a given date.
   * If the date is already in the view range, nothing will
   * happen, unless the forceUpdate bool is set to true. For instance, when switching the
   * startWeekOnSunday, we want to update the view and force the first day of the view to
   * switch between Sunday and Monday, even if it may already be in view.
   *
   * @param {Date} date the new Date to bring to the view.
   * @param {Boolean} emitUpdate emits the update:viewDate event (not wanted from watcher)
   * @param {Boolean} forceUpdate By default if the date is in view range, nothing happens.
   * @returns void
   */
  function updateViewDate(date: Date | string, emitUpdate = true, forceUpdate = false) {
    if (typeof date === 'string') date = dateUtils.stringToDate(date);
    if (!dateUtils.isValid(date))
      return console.warn(
        "Calendar: can't navigate to the given date: invalid date provided to `updateViewDate(date)`.",
      );

    // Before checking if the date is in view range, use the firstCellDate and lastCellDate unless on month view
    // (where we still want to navigate when clicking a cell that is out of range).
    let [viewStart, viewEnd] = [adapter.firstCellDate, adapter.lastCellDate];
    if (adapter.viewId === 'month') [viewStart, viewEnd] = [adapter.start, adapter.end];

    date.setHours(0, 0, 0, 0);
    // Always update viewDate so that switching to a narrower view (e.g. month → day) after setting
    // a specific date within the current range correctly lands on that date. Only skip the expensive
    // cell recomputation (updateView) when the date is already in range and no force is requested.
    adapter.viewDate = date;
    if (emitUpdate) emit('update:viewDate', date);

    if (!dateUtils.isInRange(date, viewStart, viewEnd) || forceUpdate) {
      adapter.transitionDirection = date.getTime() < viewStart.getTime() ? 'left' : 'right';
      updateView();
    }
  }

  function updateSelectedDate(date: Date | string, emitUpdate = true) {
    if (!dateUtils.isValid(date))
      return console.warn(
        "Calendar: can't update the selected date: invalid date provided to `updateSelectedDate(date)`.",
      );

    const { isValid, isSameDate } = dateUtils;
    if (
      !adapter.selectedDate ||
      !isValid(adapter.selectedDate) ||
      !isSameDate(date, adapter.selectedDate)
    ) {
      date.setHours(0, 0, 0, 0);
      adapter.selectedDate = date;
      if (emitUpdate) emit('update:selectedDate', date);
    }
  }

  /**
   * When switching the startWeekOnSunday prop, update the view.
   *
   * @param {Boolean} bool start the week on Sunday or not.
   */
  function switchWeekStart(bool: boolean) {
    if (!bool && !adapter.startTheoretical.getDay())
      updateViewDate(dateUtils.addDays(adapter.startTheoretical, 1), true, true);
    else {
      adapter.transitionDirection = 'left';
      updateView();
    }
  }

  /**
   * When toggling the hideWeekends prop, update the view.
   *
   * @param {Boolean} hide hide weekends or not.
   */
  function toggleWeekends(hide: boolean) {
    if (hide && config.startWeekOnSunday && !adapter.startTheoretical.getDay())
      updateViewDate(dateUtils.addDays(adapter.startTheoretical, 1), true, true);
    else if (!hide && config.startWeekOnSunday && adapter.startTheoretical.getDay() === 1)
      updateViewDate(dateUtils.subtractDays(adapter.startTheoretical, 1), true, true);
  }

  /**
   * When toggling weekdays, update the view.
   */
  function toggleWeekdays() {
    updateView();
  }

  return {
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
  };
}
