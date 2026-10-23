import assert from 'node:assert/strict';
import { test, type TestContext } from 'node:test';

import type { CalendarSurfaceHost } from '../dist/calendar/surfaces.js';

import { createCalendarAllDayResizer } from '../dist/calendar/all-day-resizer.js';
import { getCalendarConfigSize, getCalendarHiddenDayCount } from '../dist/calendar/config.js';
import { defaults } from '../dist/calendar/constants.js';
import {
  createCalendarBodyController,
  createCalendarRootController,
  syncCalendarPrefixedClasses,
} from '../dist/calendar/surface-interaction.js';
import { createCalendarSurfaceRules, getCalendarHeadingEnd } from '../dist/calendar/surfaces.js';
import { createDateUtils } from '../dist/calendar/utils/date.js';

function fixture() {
  const calls: unknown[][] = [];
  const host: CalendarSurfaceHost = {
    prefixCls: 'test-calendar',
    texts: {
      ...defaults.texts,
      weekDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      weekDaysShort: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
      weekDaysMin: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    },
    dateUtils: createDateUtils(() => 'en'),
    config: {
      time: true,
      horizontal: false,
      twelveHour: false,
      timeFrom: 480,
      timeTo: 840,
      timeStep: 60,
      timeCellHeight: 40,
      timeAtCursor: false,
      editableEvents: {},
      xs: false,
      sm: false,
      allDayEvents: false,
      clickToNavigate: false,
      ready: false,
      theme: 'default',
      size: 'lg',
      datePicker: false,
      weekNumbers: false,
    },
    view: {
      id: 'week',
      cols: 7,
      rows: 1,
      isDay: false,
      isDays: false,
      isWeek: true,
      isMonth: false,
      isYear: false,
      isYears: false,
      firstCellDate: new Date('2026-10-19T00:00:00'),
      cellDates: [19, 20, 21, 22, 23, 24, 25].map((day) => ({ start: new Date(2026, 9, day) })),
      broaderView: 'month',
      narrowerView: 'day',
      broader: () => {
        calls.push(['broader']);
      },
      narrower: () => {
        calls.push(['narrower']);
      },
      updateSelectedDate: (date) => {
        calls.push(['selected', date]);
      },
    },
    touch: { isDraggingCell: false, isDraggingEvent: false, isResizingEvent: false },
  };
  const cursor = { x: null as number | null, y: null as number | null };
  const derived = {
    isDark: false,
    get hasTimeColumn(): boolean {
      return rules.hasTimeColumn();
    },
  };
  const rules: ReturnType<typeof createCalendarSurfaceRules> = createCalendarSurfaceRules(
    host,
    derived,
    cursor,
  );
  return { host, cursor, derived, rules, calls };
}
function replaceGlobal(t: TestContext, name: string, value: unknown) {
  const before = Object.getOwnPropertyDescriptor(globalThis, name);
  Object.defineProperty(globalThis, name, { configurable: true, value });
  t.after(() => {
    if (before) Object.defineProperty(globalThis, name, before);
    else Reflect.deleteProperty(globalThis, name);
  });
}
class FakeElement extends EventTarget {
  classes = new Set<string>();
  children: FakeElement[] = [];
  styleValues = new Map<string, string>();
  style = {
    setProperty: (key: string, value: string) => {
      this.styleValues.set(key, value);
    },
  };
  classList = {
    get length() {
      return 0;
    },
    contains: (value: string) => this.classes.has(value),
    add: (value: string) => {
      this.classes.add(value);
    },
    [Symbol.iterator]: () => this.classes.values(),
  };
  isCell = false;
  clientWidth = 200;
  clientHeight = 400;
  rectReads = 0;
  constructor(...classes: string[]) {
    super();
    classes.forEach((value) => this.classes.add(value));
    Object.defineProperty(this.classList, 'length', { get: () => this.classes.size });
  }
  querySelectorAll() {
    return this.children;
  }
  closest(_selector: string) {
    return this.isCell ? this : null;
  }
  getBoundingClientRect() {
    this.rectReads++;
    return { left: 10, top: 20, width: 200, height: 400 };
  }
}
const native = (element: FakeElement) => element as unknown as HTMLElement;
function move(type: string, x = 60, y = 120) {
  const event = new Event(type, { cancelable: true });
  Object.assign(event, { clientX: x, clientY: y });
  if (type.startsWith('touch'))
    Object.defineProperty(event, 'touches', { value: [{ clientX: x, clientY: y }] });
  return event;
}

test('surface body dimensions and wrapper variables retain original units and level', () => {
  const { host, rules } = fixture();
  assert.deepEqual(rules.bodyStyles(), {
    '--test-calendar-grid-columns': 7,
    '--test-calendar-grid-rows': 1,
    '--test-calendar-body-max-height': '240px',
  });
  host.config.time = false;
  assert.equal(rules.bodyStyles()['--test-calendar-body-max-height'], undefined);
  host.config.schedules = [{ id: 0 }];
  assert.equal(rules.wrapperStyles()['--test-calendar-schedules-count'], 1);
  assert.equal(rules.wrapperStyles()['--test-calendar-time-cell-size'], '40px');
});

test('surface cursor formats vertical and horizontal axes and clears null independently', () => {
  const { host, cursor, rules } = fixture();
  assert.deepEqual(rules.timeAtCursor(), { style: {}, time: '' });
  cursor.y = 25;
  assert.deepEqual(rules.timeAtCursor(), { style: { top: '25%' }, time: '09:30' });
  host.config.horizontal = true;
  assert.deepEqual(rules.timeAtCursor(), { style: {}, time: '' });
  cursor.x = 50;
  assert.deepEqual(rules.timeAtCursor(), { style: { left: '50%' }, time: '11:00' });
});

test('surface time cells preserve noon labels and a truncated final cell', () => {
  const { host, rules } = fixture();
  host.config.timeFrom = 690;
  host.config.timeTo = 795;
  const cells = rules.timeCells();
  assert.equal(cells[0].formatted12, '11:30am');
  assert.equal(cells[1].formatted12, '12:30pm');
  assert.equal(cells[1].formatted24, '12:30');
  assert.equal(cells[1].minutesSum, 750);
  assert.equal(cells[0].height, null);
  assert.equal(cells[1].height, 'calc(var(--test-calendar-time-cell-size) * 0.75)');
});

test('surface weekday labels retain Sunday mapping, first-row slicing and date identity', () => {
  const { host, rules } = fixture();
  const days = rules.weekDays();
  assert.equal(days[0].day, 'Monday');
  assert.equal(days[6].day, 'Sunday');
  assert.equal(days[0].date, host.view.cellDates[0].start);
  assert.equal(days[6].id, 'sun');
  host.config.horizontal = true;
  host.view.rows = 2;
  assert.equal(rules.weekDays().length, 2);
});

test('surface heading sizes and visibility keep day, schedules and all-day branches', () => {
  const { host, rules } = fixture();
  assert.equal(rules.dayLabelSize(), 'day');
  host.view.isDays = true;
  assert.equal(rules.dayLabelSize(), 'day-sm');
  host.config.xs = true;
  assert.equal(rules.dayLabelSize(), 'day-xs');
  host.view.isDays = false;
  host.view.isWeek = false;
  host.view.isDay = true;
  assert.equal(rules.showHeadings(), false);
  host.config.schedules = [];
  assert.equal(rules.showHeadings(), true);
  host.config.schedules = undefined;
  host.config.allDayEvents = true;
  assert.equal(rules.showHeadings(), true);
});

test('surface heading cell retains original 24-hour endpoint and navigation closures', () => {
  const { host, rules, calls } = fixture();
  const date = new Date('2026-10-19T00:00:00');
  const cell = rules.headingCell({ date, isToday: false });
  assert.equal(cell.start, date);
  assert.equal(cell.end.getTime(), date.getTime() + 86400000 - 1);
  assert.equal(getCalendarHeadingEnd(date).getTime(), cell.end.getTime());
  cell.goNarrower();
  cell.goBroader();
  rules.domEvents.click(date);
  assert.deepEqual(calls, [['narrower'], ['broader'], ['selected', date]]);
  host.view.isWeek = false;
  rules.domEvents.click(date);
  assert.equal(calls.length, 3);
});

test('surface title handlers preserve the current click permission at dispatch', () => {
  const { host, rules, calls } = fixture();
  assert.deepEqual(rules.titleEventHandlers(), {});
  host.config.clickToNavigate = true;
  const handler = rules.titleEventHandlers().click!;
  handler();
  host.config.clickToNavigate = false;
  handler();
  assert.deepEqual(calls, [['broader']]);
});

test('surface root classes and month week numbers preserve live flags', () => {
  const { host, rules, derived } = fixture();
  host.view.rows = 2;
  assert.deepEqual(rules.weekNumbers(), [43, 44]);
  assert.equal(rules.hasTimeColumn(), true);
  derived.isDark = true;
  host.touch.isDraggingCell = true;
  assert.equal(rules.wrapperClasses()['test-calendar--dark'], true);
  assert.equal(rules.wrapperClasses()['test-calendar--dragging-cell'], true);
  host.view.isWeek = false;
  host.view.isMonth = true;
  host.config.weekNumbers = true;
  assert.equal(rules.scrollableElClasses()['test-calendar__scrollable--row'], true);
});

test('surface heading calculations keep size reads separate from weekday data', () => {
  const { host, rules } = fixture();
  Object.defineProperty(host.config, 'xs', {
    get: () => {
      throw new Error('eager size');
    },
  });
  Object.defineProperty(host.config, 'sm', {
    get: () => {
      throw new Error('eager size');
    },
  });
  assert.equal(rules.weekDays().length, 7);
});

test('calendar config size keeps lazy small-size reads and counts hidden keys', () => {
  assert.equal(
    getCalendarConfigSize({
      xs: true,
      get sm(): boolean {
        throw new Error('eager sm');
      },
    }),
    'xs',
  );
  assert.equal(getCalendarConfigSize({ xs: false, sm: true }), 'sm');
  assert.equal(getCalendarConfigSize({ xs: false, sm: false }), 'lg');
  assert.equal(getCalendarHiddenDayCount({ 1: true, 7: true }), 2);
});

test('body controller avoids DOM work when cursor and horizontal resize tracking are off', () => {
  const { host, cursor } = fixture();
  const element = new FakeElement();
  const controller = createCalendarBodyController(host, cursor, {
    element: native(element),
    resizeState: { cellEl: null },
  });
  controller.mount();
  element.dispatchEvent(move('mousemove'));
  assert.equal(element.rectReads, 0);
  controller.dispose();
});

test('body controller updates both cursor axes and clears mouse/touch end state', () => {
  const { host, cursor } = fixture();
  host.config.timeAtCursor = true;
  const element = new FakeElement();
  const controller = createCalendarBodyController(host, cursor, {
    element: native(element),
    resizeState: { cellEl: null },
  });
  controller.mount();
  element.dispatchEvent(move('mousemove'));
  assert.equal(cursor.y, 25);
  host.config.horizontal = true;
  element.dispatchEvent(move('touchmove'));
  assert.equal(cursor.x, 25);
  element.dispatchEvent(new Event('touchend'));
  assert.deepEqual(cursor, { x: null, y: null });
  controller.dispose();
  element.dispatchEvent(move('mousemove'));
  assert.deepEqual(cursor, { x: null, y: null });
});

test('body controller resolves the hovered resize cell once without unnecessary rect work', (t) => {
  const { host, cursor } = fixture();
  host.touch.isResizingEvent = true;
  host.config.editableEvents.resizeX = true;
  const element = new FakeElement(),
    hovered = new FakeElement();
  let selector = '';
  const fromPoint = t.mock.fn(() => ({
    closest: (value: string) => {
      selector = value;
      return hovered;
    },
  }));
  replaceGlobal(t, 'document', { elementFromPoint: fromPoint });
  const resizeState = { cellEl: null as HTMLElement | null };
  const controller = createCalendarBodyController(host, cursor, {
    element: native(element),
    resizeState,
  });
  controller.mount();
  element.dispatchEvent(move('mousemove'));
  assert.equal(resizeState.cellEl, hovered);
  assert.equal(element.rectReads, 0);
  assert.deepEqual(fromPoint.mock.calls[0].arguments, [60, 120]);
  assert.equal(selector, '.test-calendar__cell');
  controller.dispose();
});

test('body controller ignores month/year pointer activity and is inert without an element', () => {
  const { host, cursor } = fixture();
  host.config.timeAtCursor = true;
  host.view.isMonth = true;
  const element = new FakeElement();
  const controller = createCalendarBodyController(host, cursor, {
    element: native(element),
    resizeState: { cellEl: null },
  });
  controller.mount();
  element.dispatchEvent(move('mousemove'));
  assert.equal(element.rectReads, 0);
  controller.dispose();
  const missing = createCalendarBodyController(host, cursor, {
    element: null,
    resizeState: { cellEl: null },
  });
  missing.mount();
  missing.dispose();
});

test('root class synchronization preserves old classes, custom prefixes and idempotence', (t) => {
  replaceGlobal(t, 'Element', FakeElement);
  const root = new FakeElement('sd-calendar--week-view', 'unrelated'),
    child = new FakeElement('other-calendar__cell', 'custom-calendar__body');
  root.children.push(child);
  syncCalendarPrefixedClasses(native(root), 'custom-calendar');
  syncCalendarPrefixedClasses(native(root), 'custom-calendar');
  assert.ok(root.classes.has('sd-calendar--week-view'));
  assert.ok(root.classes.has('custom-calendar--week-view'));
  assert.ok(child.classes.has('custom-calendar__cell'));
  assert.equal(child.classes.size, 3);
});

test('root context-menu listener attaches only on touch and is removed on disposal', (t) => {
  replaceGlobal(t, 'window', { ontouchstart: null });
  const root = new FakeElement(),
    cell = new FakeElement();
  cell.isCell = true;
  const controller = createCalendarRootController('custom-calendar', { element: native(root) });
  controller.mount();
  const event = new Event('contextmenu', { cancelable: true });
  Object.defineProperty(event, 'target', { value: cell });
  root.dispatchEvent(event);
  assert.equal(event.defaultPrevented, true);
  controller.dispose();
  const after = new Event('contextmenu', { cancelable: true });
  Object.defineProperty(after, 'target', { value: cell });
  root.dispatchEvent(after);
  assert.equal(after.defaultPrevented, false);
});

function resizeFixture(t: TestContext, pixels = 40) {
  const document = new EventTarget();
  let temporaryRemoved = 0;
  const temporaryStyle: Record<string, string> = {};
  Object.assign(document, {
    body: { appendChild() {} },
    createElement: () => ({
      style: temporaryStyle,
      offsetHeight: pixels,
      offsetWidth: pixels,
      remove() {
        temporaryRemoved++;
      },
    }),
  });
  replaceGlobal(t, 'document', document);
  replaceGlobal(t, 'getComputedStyle', () => ({ getPropertyValue: () => '2rem' }));
  const root = new FakeElement(),
    config = { horizontal: false },
    controller = createCalendarAllDayResizer(config, 'test-calendar', { element: native(root) });
  t.after(controller.cleanup);
  return {
    document,
    root,
    config,
    controller,
    temporaryStyle,
    get temporaryRemoved() {
      return temporaryRemoved;
    },
  };
}

test('all-day resizer measures native CSS units and applies vertical mouse deltas', (t) => {
  const { controller, document, root, temporaryStyle } = resizeFixture(t);
  controller.handleMouseDown({ clientX: 100, clientY: 100 } as MouseEvent);
  assert.equal(controller.initialHeight, 40);
  assert.equal(temporaryStyle.height, '2rem');
  document.dispatchEvent(move('mousemove', 100, 145));
  assert.equal(root.styleValues.get('--test-calendar-all-day-bar-size'), '85px');
  document.dispatchEvent(new Event('mouseup'));
  assert.equal(controller.isResizing, false);
  document.dispatchEvent(move('mousemove', 100, 200));
  assert.equal(root.styleValues.get('--test-calendar-all-day-bar-size'), '85px');
});

test('all-day resizer follows horizontal touch and prevents scrolling', (t) => {
  const { controller, config, document, root } = resizeFixture(t);
  config.horizontal = true;
  controller.handleTouchStart({
    touches: [{ clientX: 100, clientY: 10 }],
  } as unknown as TouchEvent);
  const event = move('touchmove', 150, 10);
  document.dispatchEvent(event);
  assert.equal(event.defaultPrevented, true);
  assert.equal(root.styleValues.get('--test-calendar-all-day-bar-size'), '90px');
  document.dispatchEvent(new Event('touchend'));
  assert.equal(controller.isResizing, false);
});

test('all-day resizer keeps the 20px minimum and original zero-size baseline', (t) => {
  const { controller, document, root } = resizeFixture(t, 0);
  controller.startResize(0, 100);
  document.dispatchEvent(move('mousemove', 0, 105));
  assert.equal(root.styleValues.get('--test-calendar-all-day-bar-size'), '20px');
  assert.equal(controller.initialHeight, 0);
  controller.cleanup();
});

test('all-day touch cancellation stops resizing and releases movement listeners', (t) => {
  const { controller, document, root } = resizeFixture(t);
  controller.handleTouchStart({
    touches: [{ clientX: 100, clientY: 100 }],
  } as unknown as TouchEvent);
  document.dispatchEvent(move('touchmove', 100, 145));
  const size = root.styleValues.get('--test-calendar-all-day-bar-size');
  document.dispatchEvent(new Event('touchcancel'));
  assert.equal(controller.isResizing, false);
  document.dispatchEvent(move('touchmove', 100, 200));
  assert.equal(root.styleValues.get('--test-calendar-all-day-bar-size'), size);
});

test('all-day resizer disposal removes active listeners and its measurement element', (t) => {
  const state = resizeFixture(t);
  state.controller.startResize(0, 100);
  assert.equal(state.temporaryRemoved, 1);
  state.controller.cleanup();
  state.document.dispatchEvent(move('mousemove', 0, 200));
  assert.equal(state.root.styleValues.size, 0);
});

test('surface native controllers construct and dispose without a browser or element', () => {
  assert.equal(typeof globalThis.document, 'undefined');
  const { host, cursor } = fixture();
  const body = createCalendarBodyController(host, cursor, {
    element: null,
    resizeState: { cellEl: null },
  });
  body.mount();
  body.dispose();
  const root = createCalendarRootController('calendar', { element: null });
  root.mount();
  root.sync();
  root.dispose();
  const resize = createCalendarAllDayResizer({ horizontal: false }, 'calendar', { element: null });
  resize.cleanup();
});
