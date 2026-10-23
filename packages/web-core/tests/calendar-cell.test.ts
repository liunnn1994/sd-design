import assert from 'node:assert/strict';
import { test, type TestContext } from 'node:test';

import type { CalendarCellAdapter } from '../dist/calendar/cell-interaction.js';
import type {
  CalendarCellDerived,
  CalendarCellHost,
  CalendarCellProps,
} from '../dist/calendar/cell.js';
import type { CalendarEventsHost } from '../dist/calendar/events-host.js';
import type {
  CalendarEvent,
  CalendarEventInput,
  CalendarId,
  CalendarListener,
} from '../dist/calendar/types.js';

import { createCalendarCellInteraction } from '../dist/calendar/cell-interaction.js';
import { createCalendarCellRules, createCalendarCellTouch } from '../dist/calendar/cell.js';
import { defaults } from '../dist/calendar/constants.js';
import { createCalendarEvents } from '../dist/calendar/events.js';
import { buildSpecialHoursDisallowed } from '../dist/calendar/special-hours.js';
import { createDateUtils } from '../dist/calendar/utils/date.js';

function fixture(inputs: CalendarEventInput[] = []) {
  const config: CalendarCellHost['config'] & CalendarEventsHost['config'] = {
    events: inputs as CalendarEvent[],
    horizontal: false,
    time: true,
    timeFrom: 480,
    timeTo: 840,
    snapToInterval: 0,
    editableEvents: { create: true, drag: true, delete: true },
    eventCreateMinDrag: 15,
    availableViews: { ...defaults.availableViews },
    xs: false,
    datePicker: false,
    allDayEvents: false,
    stackEvents: false,
    showCellEventCount: true,
    specialHours: {},
    minTimestamp: null,
    maxTimestamp: null,
    disableDays: [],
    clickToNavigate: false,
    multidayEvents: true,
    eventListeners: { cell: {}, event: {} },
  };
  const dateUtils = createDateUtils(() => 'en');
  const globalTouch = { isDraggingCell: false, isResizingEvent: false, currentHoveredCell: null };
  const manager = createCalendarEvents(
    { config, dateUtils, prefixCls: 'sd-calendar', touch: globalTouch, emit: () => {} },
    {
      createState: (state) => state,
      createIndex: (state) => state,
      observeEvents: (rebuild) => rebuild(),
      onDispose: () => {},
    },
  );
  const navigation: unknown[][] = [];
  const host: CalendarCellHost = {
    config,
    dateUtils,
    prefixCls: 'sd-calendar',
    touch: globalTouch,
    eventsManager: manager,
    view: {
      id: 'day',
      start: new Date('2026-10-19T00:00:00'),
      selectedDate: null,
      isDay: true,
      isDays: false,
      isWeek: false,
      isMonth: false,
      isYear: false,
      isYears: false,
      updateSelectedDate: (date) => {
        navigation.push(['selected', date]);
      },
      updateViewDate: (date) => {
        navigation.push(['date', date]);
      },
      switch: (id) => {
        navigation.push(['switch', id]);
      },
      createEvent: manager.createEvent,
    },
    dnd: {
      cellDragEnter: () => {},
      cellDragOver: () => {},
      cellDragLeave: () => {},
      cellDragDrop: async () => {},
    },
  };
  const props: CalendarCellProps = {
    start: new Date('2026-10-19T00:00:00'),
    end: new Date('2026-10-19T23:59:59.999'),
    index: 0,
    allDay: false,
  };
  const touch = createCalendarCellTouch();
  const deletedIds: CalendarId[] = [];
  const state = { awaitingEventCreation: false };
  const derived: CalendarCellDerived = {
    get awaitingEventCreation() {
      return state.awaitingEventCreation;
    },
    get isToday() {
      return rules.isToday();
    },
    get cellEvents() {
      return rules.cellEvents();
    },
    get cellForegroundEvents() {
      return rules.cellForegroundEvents();
    },
    get overlappingEvents() {
      return manager.getCellOverlappingEvents(props.start, props.end, props.allDay);
    },
    get specialHours() {
      return rules.specialHours();
    },
    get isBeforeMinDate() {
      return rules.isBeforeMinDate();
    },
    get isAfterMaxDate() {
      return rules.isAfterMaxDate();
    },
    get isDisabled() {
      return rules.isDisabled();
    },
    deletedIds,
  };
  const rules: ReturnType<typeof createCalendarCellRules> = createCalendarCellRules(
    host,
    props,
    touch,
    derived,
  );
  return { host, config, manager, navigation, props, touch, deletedIds, state, derived, rules };
}

function gesture(t: TestContext) {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const previousNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  const document = Object.assign(new EventTarget(), {
    documentElement: { getAttribute: () => null },
  });
  const vibrate = t.mock.fn();
  Object.defineProperty(globalThis, 'document', { configurable: true, value: document });
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { vibrate } });
  const state = fixture();
  const element = Object.assign(new EventTarget(), {
    clientWidth: 200,
    clientHeight: 400,
    getBoundingClientRect: () => ({ left: 10, top: 20, width: 200, height: 400 }),
    closest: () => null,
  }) as unknown as HTMLElement;
  const info = { start: state.props.start, end: state.props.end };
  let listeners: Record<string, CalendarListener> = {};
  const adapter: CalendarCellAdapter = {
    element,
    info,
    get cursor() {
      return state.rules.cursorInfo();
    },
    get placeholder() {
      return state.rules.eventPlaceholder();
    },
    get isCreating() {
      return state.rules.isCreatingEvent();
    },
    get isDisabled() {
      return state.rules.isDisabled();
    },
    get listeners() {
      return listeners;
    },
    get awaitingEventCreation() {
      return state.state.awaitingEventCreation;
    },
    set awaitingEventCreation(value) {
      state.state.awaitingEventCreation = value;
    },
    deletedIds: state.deletedIds,
  };
  const controller = createCalendarCellInteraction(state.host, state.props, state.touch, adapter);
  listeners = controller.buildListeners();
  t.after(() => {
    controller.dispose();
    if (previousDocument) Object.defineProperty(globalThis, 'document', previousDocument);
    else Reflect.deleteProperty(globalThis, 'document');
    if (previousNavigator) Object.defineProperty(globalThis, 'navigator', previousNavigator);
    else Reflect.deleteProperty(globalThis, 'navigator');
  });
  return {
    ...state,
    document,
    element,
    info,
    adapter,
    controller,
    vibrate,
    get listeners() {
      return listeners;
    },
    rebind() {
      listeners = controller.buildListeners();
    },
  };
}
function pointer(type: string, x = 30, y = 120, target?: object) {
  const e = new Event(type, { cancelable: true });
  Object.assign(e, { clientX: x, clientY: y });
  if (target) Object.defineProperty(e, 'target', { value: target });
  if (type.startsWith('touch'))
    Object.defineProperty(e, 'touches', { value: [{ clientX: x, clientY: y, target }] });
  return e;
}
const settle = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

test('cell touch state is per-instance and placeholder retains snapping, direction and schedule zero', () => {
  const { touch, config, rules } = fixture();
  assert.notEqual(touch, createCalendarCellTouch());
  touch.startPercentageY = 25;
  touch.movePercentageY = 60;
  touch.schedule = 0;
  config.snapToInterval = 15;
  assert.equal(rules.eventPlaceholder().startMinutes, 570);
  assert.equal(rules.eventPlaceholder().endMinutes, 690);
  assert.equal(rules.eventPlaceholder().schedule, 0);
  [touch.startPercentageY, touch.movePercentageY] = [60, 25];
  assert.equal(rules.eventPlaceholder().startMinutes, 570);
  config.horizontal = true;
  touch.startPercentageX = 25;
  touch.movePercentageX = 50;
  assert.equal(rules.eventPlaceholder().style.left, '25%');
  assert.equal(rules.eventPlaceholder().style.width, '25%');
});

test('cell placeholder clamps both drag directions at disallowed special hours', () => {
  const { touch, config, rules } = fixture();
  config.specialHoursDisallowed = buildSpecialHoursDisallowed({
    mon: { default: [{ from: 600, to: 660, allowEvents: false }], schedules: {} },
  });
  touch.startPercentageY = 25;
  touch.movePercentageY = 75;
  assert.equal(rules.eventPlaceholder().endMinutes, 600);
  touch.startPercentageY = 75;
  touch.movePercentageY = 25;
  assert.equal(rules.eventPlaceholder().startMinutes, 660);
});

test('cell creation threshold and touch permission preserve pending placeholder visibility', () => {
  const { touch, state, config, rules } = fixture();
  touch.dragging = true;
  assert.equal(rules.isCreatingEvent(), false);
  touch.thresholdPassed = true;
  assert.equal(rules.isCreatingEvent(), true);
  touch.canTouchAndDrag = false;
  assert.equal(rules.isCreatingEvent(), false);
  touch.canTouchAndDrag = true;
  touch.dragging = false;
  state.awaitingEventCreation = true;
  assert.equal(rules.isCreatingEvent(), true);
  config.editableEvents.create = false;
  assert.equal(rules.isCreatingEvent(), false);
});

test('cell dates and classes retain range membership, selection and count values', () => {
  const { props, host, rules } = fixture();
  assert.equal(rules.startFormatted(), '2026-10-19');
  assert.equal(rules.formattedCellDate(), '');
  host.view.id = 'month';
  host.view.isMonth = true;
  host.view.isDay = false;
  host.view.selectedDate = props.end;
  assert.equal(rules.formattedCellDate(), '19');
  assert.equal(rules.classes()['sd-calendar__cell--selected'], true);
  host.view.start = new Date('2026-11-01T00:00:00');
  assert.equal(rules.classes()['sd-calendar__cell--out-of-range'], true);
  host.view.id = 'years';
  assert.equal(rules.formattedCellDate(), '2026');
});

test('cell bounds honor timestamp zero while year cells ignore only disableDays', () => {
  const { props, host, config, rules } = fixture();
  props.start = new Date(-86400000);
  props.end = new Date(-1);
  config.minTimestamp = 0;
  assert.equal(rules.isBeforeMinDate(), true);
  assert.equal(rules.isDisabled(), true);
  config.minTimestamp = null;
  props.start = new Date(1);
  config.maxTimestamp = 0;
  assert.equal(rules.isAfterMaxDate(), true);
  config.maxTimestamp = null;
  config.disableDays = [host.dateUtils.formatDate(props.start)];
  assert.equal(rules.isDisabled(), true);
  host.view.isYear = true;
  assert.equal(rules.isDisabled(), false);
});

test('cell event filtering preserves identities, deletion exclusions and strict schedule ids', () => {
  const { config, rules, deletedIds } = fixture([
    { start: '2026-10-19 09:00', end: '2026-10-19 10:00', schedule: 0 },
    { start: '2026-10-19 09:00', end: '2026-10-19 10:00', schedule: '0', background: true },
  ]);
  config.schedules = [{ id: 0 }];
  assert.equal(rules.cellEvents()[0], config.events[0]);
  assert.equal(rules.cellForegroundEvents().length, 1);
  assert.equal(rules.cellEventsPerSchedule()?.[0].length, 1);
  assert.equal(rules.cellEventsPerSchedule()?.[0][0], config.events[0]);
  config.schedules = [{ id: '0' }];
  assert.equal(rules.cellEventsPerSchedule()?.[0][0], config.events[1]);
  deletedIds.push(config.events[0]._.id);
  assert.equal(rules.cellEvents().length, 1);
  config.datePicker = true;
  assert.deepEqual(rules.cellEvents(), []);
});

test('cell overlap styles and classes retain stacking and horizontal geometry', () => {
  const { config, rules } = fixture([
    { start: '2026-10-19 09:00', end: '2026-10-19 10:30' },
    { start: '2026-10-19 09:30', end: '2026-10-19 11:00' },
  ]);
  const first = config.events[0]._.id,
    second = config.events[1]._.id;
  assert.equal(rules.eventStyles()[first].width, '50%');
  assert.equal(rules.eventStyles()[second].left, '50%');
  assert.equal(rules.eventClasses()[second], 'sd-calendar__event--stack-2-2');
  config.stackEvents = true;
  assert.equal(rules.eventStyles()[first].width, '65%');
  config.horizontal = true;
  assert.equal(rules.eventStyles()[second].top, '50%');
  assert.equal(rules.eventStyles()[second].height, '50%');
});

test('cell special hours clip to timeline and preserve explicit empty schedule overrides', () => {
  const { config, rules } = fixture();
  config.schedules = [{ id: 0 }, { id: 2 }];
  config.specialHours = {
    mon: {
      default: [
        { from: 420, to: 540, label: 'clipped' },
        { from: 900, to: 960 },
      ],
      schedules: { '0': [] },
    },
  };
  const special = rules.specialHours();
  assert.equal(special?.default.length, 1);
  assert.equal(special?.default[0].style.top, '0%');
  assert.deepEqual(rules.schedulesWithCellSpecialHours()[0].ranges, []);
  assert.equal(rules.schedulesWithCellSpecialHours()[1].ranges[0].label, 'clipped');
});

test('cell overlap watch key includes schedules and skips year branches lazily', () => {
  const { config, host, rules } = fixture([
    { start: '2026-10-19 09:00', end: '2026-10-19 10:00', schedule: 0 },
  ]);
  const before = rules.overlapKey();
  config.events[0].schedule = 'room';
  assert.notEqual(rules.overlapKey(), before);
  host.view.isYear = true;
  assert.equal(rules.overlapKey(), false);
});

test('cell click keeps selection, narrowing and date notification order with cursor payload', (t) => {
  const state = gesture(t);
  state.config.clickToNavigate = true;
  state.host.view.isWeek = true;
  const click = t.mock.fn();
  state.config.eventListeners.cell.click = click;
  state.rebind();
  const e = pointer('click');
  state.listeners.click(e);
  assert.deepEqual(state.navigation, [
    ['selected', state.props.start],
    ['switch', 'day'],
    ['date', state.props.start],
  ]);
  const payload = click.mock.calls[0].arguments[0] as {
    cell: unknown;
    cursor: { y: number; date: Date };
  };
  assert.equal(payload.cell, state.info);
  assert.equal(payload.cursor.y, 25);
  assert.equal(payload.cursor.date.getHours(), 9);
});

test('cell disabled listeners are empty and descendant event callbacks are suppressed', (t) => {
  const state = gesture(t);
  const handler = t.mock.fn();
  state.config.eventListeners.cell.mouseenter = handler;
  state.rebind();
  state.listeners.mouseenter(pointer('mouseenter', 30, 120, { closest: () => ({}) }));
  assert.equal(handler.mock.callCount(), 0);
  state.config.maxTimestamp = 0;
  state.rebind();
  assert.deepEqual(state.listeners, {});
});

test('cell mouse drag creates a real normalized event and resets gesture state', async (t) => {
  const state = gesture(t);
  state.listeners.mousedown(pointer('mousedown'));
  state.document.dispatchEvent(pointer('mousemove', 30, 220));
  assert.equal(state.host.touch.isDraggingCell, true);
  assert.equal(state.rules.isCreatingEvent(), true);
  state.document.dispatchEvent(pointer('mouseup', 30, 220));
  await settle();
  assert.equal(state.config.events.length, 1);
  assert.equal(state.config.events[0].start.getHours(), 9);
  assert.equal(state.config.events[0].start.getMinutes(), 30);
  assert.equal(state.config.events[0].end.getHours(), 11);
  assert.equal(state.touch.dragging, false);
  assert.equal(state.touch.schedule, null);
  assert.equal(state.host.touch.isDraggingCell, false);
  assert.deepEqual(state.vibrate.mock.calls[0].arguments, [200]);
});

test('cell horizontal drag matches a numeric schedule zero from dataset', async (t) => {
  const state = gesture(t);
  state.config.horizontal = true;
  state.config.schedules = [{ id: 0 }];
  state.listeners.mousedown(
    pointer('mousedown', 60, 30, { closest: () => ({ dataset: { schedule: '0' } }) }),
  );
  state.document.dispatchEvent(pointer('mousemove', 110, 30));
  assert.equal(state.touch.schedule, 0);
  assert.equal(state.rules.eventPlaceholder().startMinutes, 570);
  state.document.dispatchEvent(pointer('mouseup', 110, 30));
  await settle();
  assert.equal(state.config.events[0].schedule, 0);
});

test('cell movement before touch delay cancels creation and permits scrolling', async (t) => {
  const state = gesture(t);
  state.listeners.touchstart(pointer('touchstart'));
  const e = pointer('touchmove', 30, 220);
  state.document.dispatchEvent(e);
  await settle();
  t.mock.timers.tick(1200);
  assert.equal(e.defaultPrevented, false);
  assert.equal(state.config.events.length, 0);
  assert.equal(state.touch.canTouchAndDrag, null);
  assert.equal(state.touch.holding, false);
});

test('cell movement after touch delay prevents scrolling and creates event', async (t) => {
  const state = gesture(t);
  state.listeners.touchstart(pointer('touchstart'));
  t.mock.timers.tick(500);
  const e = pointer('touchmove', 30, 220);
  state.document.dispatchEvent(e);
  assert.equal(e.defaultPrevented, true);
  state.document.dispatchEvent(pointer('touchend', 30, 220));
  await settle();
  assert.equal(state.config.events.length, 1);
});

test('cell scrolling before the hold delay detaches the touch gesture listeners', async (t) => {
  const state = gesture(t);
  const removed = t.mock.method(state.document, 'removeEventListener');
  state.listeners.touchstart(pointer('touchstart'));
  state.document.dispatchEvent(pointer('touchmove', 30, 220));
  await settle();
  for (const type of ['touchmove', 'touchend', 'touchcancel']) {
    assert.ok(
      removed.mock.calls.some((call) => call.arguments[0] === type),
      `${type} removed`,
    );
  }
});

for (const dragging of [false, true]) {
  test(`cell touch cancellation clears ${dragging ? 'an active drag' : 'a pending hold'} without creating an event`, async (t) => {
    const state = gesture(t);
    const hold = t.mock.fn();
    state.config.eventListeners.cell.hold = hold;
    state.rebind();
    state.listeners.touchstart(pointer('touchstart'));
    if (dragging) {
      t.mock.timers.tick(500);
      state.document.dispatchEvent(pointer('touchmove', 30, 220));
      assert.equal(state.host.touch.isDraggingCell, true);
    }
    state.document.dispatchEvent(pointer('touchcancel'));
    await settle();
    t.mock.timers.tick(1200);
    state.document.dispatchEvent(pointer('touchmove', 30, 320));
    assert.equal(hold.mock.callCount(), 0);
    assert.equal(state.host.touch.isDraggingCell, false);
    assert.equal(state.touch.dragging, false);
    assert.equal(state.touch.canTouchAndDrag, null);
    assert.equal(state.config.events.length, 0);
    assert.equal(state.vibrate.mock.callCount(), 0);
  });
}

for (const accepted of [true, false]) {
  test(`cell async creation preserves its proposal and pending state on ${accepted ? 'approval' : 'rejection'}`, async (t) => {
    const state = gesture(t);
    let resolve!: (value: boolean) => void;
    state.config.eventListeners.event.create = (payload: { resolve(value: boolean): void }) => {
      resolve = payload.resolve;
    };
    state.listeners.mousedown(pointer('mousedown'));
    state.document.dispatchEvent(pointer('mousemove', 30, 220));
    state.document.dispatchEvent(pointer('mouseup', 30, 220));
    assert.equal(state.state.awaitingEventCreation, true);
    assert.equal(state.config.events.length, 0);
    resolve(accepted);
    await settle();
    assert.equal(state.config.events.length, accepted ? 1 : 0);
    assert.equal(state.state.awaitingEventCreation, false);
    assert.equal(state.touch.dragging, false);
  });
}

test('cell delayed click keeps old handler while hold reads a rebound handler', (t) => {
  const state = gesture(t);
  const oldClick = t.mock.fn(),
    newClick = t.mock.fn(),
    oldHold = t.mock.fn(),
    newHold = t.mock.fn();
  state.config.eventListeners.cell = { 'delayed-click': oldClick, 'hold': oldHold };
  state.rebind();
  state.listeners.click(pointer('click'));
  state.listeners.mousedown(pointer('mousedown'));
  state.config.eventListeners.cell = { 'delayed-click': newClick, 'hold': newHold };
  state.rebind();
  t.mock.timers.tick(1000);
  assert.equal(oldClick.mock.callCount(), 1);
  assert.equal(newClick.mock.callCount(), 0);
  assert.equal(oldHold.mock.callCount(), 0);
  assert.equal(newHold.mock.callCount(), 1);
});

test('cell dragover/drop forward live cell identity and all-day state', (t) => {
  const state = gesture(t);
  const over = t.mock.method(state.host.dnd, 'cellDragOver'),
    drop = t.mock.method(state.host.dnd, 'cellDragDrop');
  const e = new Event('dragover', { cancelable: true });
  state.listeners.dragover(e);
  assert.equal(e.defaultPrevented, true);
  assert.deepEqual(over.mock.calls[0].arguments, [e, state.info]);
  state.props.allDay = true;
  state.listeners.drop(e);
  assert.deepEqual(drop.mock.calls[0].arguments, [e, state.info, true]);
});

test('cell disposal removes gesture listeners and timers and releases shared dragging state', (t) => {
  const state = gesture(t);
  const hold = t.mock.fn(),
    drag = t.mock.fn();
  state.config.eventListeners.cell = { hold, drag, 'delayed-click': hold };
  state.rebind();
  state.listeners.click(pointer('click'));
  state.listeners.mousedown(pointer('mousedown'));
  state.document.dispatchEvent(pointer('mousemove', 30, 220));
  assert.equal(drag.mock.callCount(), 1);
  state.controller.dispose();
  state.document.dispatchEvent(pointer('mousemove', 30, 240));
  t.mock.timers.tick(1200);
  assert.equal(drag.mock.callCount(), 1);
  assert.equal(hold.mock.callCount(), 0);
  assert.equal(state.host.touch.isDraggingCell, false);
});

test('cell construction and rule binding are inert without a browser', () => {
  assert.equal(typeof globalThis.document, 'undefined');
  const state = fixture();
  const adapter: CalendarCellAdapter = {
    element: null,
    info: { start: state.props.start, end: state.props.end },
    cursor: state.rules.cursorInfo(),
    placeholder: state.rules.eventPlaceholder(),
    isCreating: false,
    isDisabled: false,
    listeners: {},
    awaitingEventCreation: false,
    deletedIds: [],
  };
  const controller = createCalendarCellInteraction(state.host, state.props, state.touch, adapter);
  assert.equal(typeof controller.buildListeners().click, 'function');
});

test('cell overlap offsets follow native RTL direction', (t) => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: { documentElement: { getAttribute: () => 'rtl' } },
  });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, 'document', previous);
    else Reflect.deleteProperty(globalThis, 'document');
  });
  const { rules, config } = fixture([
    { start: '2026-10-19 09:00', end: '2026-10-19 10:30' },
    { start: '2026-10-19 09:30', end: '2026-10-19 11:00' },
  ]);
  assert.equal(rules.eventStyles()[config.events[1]._.id].right, '50%');
  assert.equal(rules.eventStyles()[config.events[1]._.id].left, undefined);
});

test('cell multi-row days and extra-small year labels retain format selection', () => {
  const { host, config, rules } = fixture();
  host.view.id = 'days';
  config.availableViews.days = { cols: 3, rows: 2 };
  assert.equal(rules.formattedCellDate(), '19');
  config.availableViews.days.rows = 1;
  assert.equal(rules.formattedCellDate(), '');
  host.view.id = 'year';
  assert.equal(rules.formattedCellDate(), 'October');
  config.xs = true;
  assert.equal(rules.formattedCellDate(), 'Oct');
});

test('cell native drag threshold is strictly greater than the configured distance', async (t) => {
  const state = gesture(t);
  state.listeners.mousedown(pointer('mousedown'));
  state.document.dispatchEvent(pointer('mousemove', 30, 135));
  assert.equal(state.touch.thresholdPassed, false);
  assert.equal(state.rules.isCreatingEvent(), false);
  state.document.dispatchEvent(pointer('mouseup', 30, 135));
  await settle();
  assert.equal(state.config.events.length, 0);
});

test('cell asynchronous editor can replace the proposal while original dates remain captured', async (t) => {
  const state = gesture(t);
  let approve!: (value: CalendarEventInput) => void;
  let proposal!: CalendarEventInput;
  state.config.eventListeners.event.create = (payload: {
    resolve(value: CalendarEventInput): void;
    event: CalendarEventInput;
  }) => {
    approve = payload.resolve;
    proposal = payload.event;
  };
  state.listeners.mousedown(pointer('mousedown'));
  state.document.dispatchEvent(pointer('mousemove', 30, 220));
  state.document.dispatchEvent(pointer('mouseup', 30, 220));
  const original = proposal.start;
  state.props.start = new Date('2026-10-20T00:00:00');
  approve({ ...proposal, title: 'Edited before approval' });
  await settle();
  assert.equal(state.config.events[0].title, 'Edited before approval');
  assert.ok(original instanceof Date);
  assert.equal(state.config.events[0].start.getTime(), original.getTime());
  assert.notEqual(state.config.events[0].start, original);
  assert.equal(state.config.events[0].start.getDate(), 19);
});
