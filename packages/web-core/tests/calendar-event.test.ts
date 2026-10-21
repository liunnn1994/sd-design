import assert from 'node:assert/strict';
import { test, type TestContext } from 'node:test';

import type { CalendarEventHost } from '../dist/calendar/event.js';
import type { CalendarEvent, CalendarListener } from '../dist/calendar/types.js';

import {
  createCalendarEventRules,
  createCalendarEventInteraction,
} from '../dist/calendar/event.js';
import { createDateUtils } from '../dist/calendar/utils/date.js';

function fixture() {
  const event: CalendarEvent = {
    start: new Date('2026-10-19T09:00:00'),
    end: new Date('2026-10-19T10:00:00'),
    _: {
      id: 0,
      multiday: false,
      startFormatted: '',
      endFormatted: '',
      startMinutes: 540,
      endMinutes: 600,
      startTimeFormatted24: '',
      startTimeFormatted12: '',
      endTimeFormatted24: '',
      endTimeFormatted12: '',
      duration: 60,
    },
    delete: async () => true,
    isOverlapping: () => 0,
    getOverlappingEvents: () => [],
  };
  const host: CalendarEventHost = {
    prefixCls: 'sd-calendar',
    config: {
      time: true,
      horizontal: false,
      timeFrom: 480,
      timeTo: 840,
      editableEvents: { drag: true, resize: true },
    },
    view: {
      isDay: true,
      isDays: false,
      isWeek: false,
      isMonth: false,
      isYear: false,
      isYears: false,
    },
    touch: { isResizingEvent: false },
    dateUtils: createDateUtils(() => 'en'),
  };
  const props = {
    inAllDayBar: false,
    cellStart: new Date('2026-10-19T00:00:00'),
    cellEnd: new Date('2026-10-19T23:59:59.999'),
  };
  const state = { canTouchAndDrag: null as boolean | null };
  const rules: ReturnType<typeof createCalendarEventRules> = createCalendarEventRules(
    host,
    props,
    event,
    {
      get canTouchAndDrag() {
        return state.canTouchAndDrag;
      },
      get startsInCell(): boolean {
        return rules.eventStartsInThisCell();
      },
      get endsInCell(): boolean {
        return rules.eventEndsInThisCell();
      },
    },
  );
  return { event, host, props, state, rules };
}

function interaction(t: TestContext, external: Record<string, CalendarListener> = {}) {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const document = new EventTarget();
  const add = t.mock.method(document, 'addEventListener');
  const remove = t.mock.method(document, 'removeEventListener');
  Object.defineProperty(globalThis, 'document', { configurable: true, value: document });
  const { event, state } = fixture();
  let listeners: Record<string, CalendarListener> = {};
  const element = {} as HTMLElement;
  const resize = t.mock.fn();
  const controller = createCalendarEventInteraction(
    { prefixCls: 'sd-calendar', event, element: () => element, listeners: () => listeners, resize },
    state,
  );
  listeners = controller.buildListeners(external);
  t.after(() => {
    controller.dispose();
    if (previous) Object.defineProperty(globalThis, 'document', previous);
    else Reflect.deleteProperty(globalThis, 'document');
  });
  return {
    event,
    state,
    document,
    add,
    remove,
    resize,
    element,
    controller,
    get listeners() {
      return listeners;
    },
    rebind(external: Record<string, CalendarListener>) {
      listeners = controller.buildListeners(external);
    },
  };
}

test('event permissions retain explicit flags, background exclusion and touch gating', () => {
  const { event, host, props, state, rules } = fixture();
  assert.equal(rules.isDraggable(), true);
  assert.equal(rules.isResizable(), true);
  state.canTouchAndDrag = false;
  assert.equal(rules.isDraggable(), false);
  state.canTouchAndDrag = true;
  event.draggable = false;
  assert.equal(rules.isDraggable(), false);
  event.draggable = true;
  event.background = true;
  assert.equal(rules.isDraggable(), false);
  assert.equal(rules.isResizable(), false);
  event.background = false;
  props.inAllDayBar = true;
  assert.equal(rules.isResizable(), false);
  props.inAllDayBar = false;
  host.view.isYears = true;
  assert.equal(rules.isResizable(), false);
});

test('multiday fragments use exclusive midnight end, preserve dates and resize only final cell', () => {
  const { event, props, rules } = fixture();
  event._.multiday = true;
  event.end = new Date('2026-10-21T00:00:00');
  const originalStart = event.start.getTime(),
    originalEnd = event.end.getTime();
  assert.equal(rules.eventStartsInThisCell(), true);
  assert.equal(rules.eventEndsInThisCell(), false);
  assert.equal(rules.isResizable(), false);
  assert.equal(rules.plusDaysIndicator(), 2);
  props.cellStart = new Date('2026-10-20T00:00:00');
  props.cellEnd = new Date('2026-10-20T23:59:59.999');
  assert.equal(rules.eventStartsInThisCell(), false);
  assert.equal(rules.eventEndsInThisCell(), true);
  assert.equal(rules.isResizable(), true);
  assert.equal(event.start.getTime(), originalStart);
  assert.equal(event.end.getTime(), originalEnd);
});

test('event geometry retains clipping and horizontal axes with native color values', () => {
  const { event, host, rules } = fixture();
  event.color = '#123456';
  assert.deepEqual(rules.styles(), {
    backgroundColor: undefined,
    color: '#123456',
    top: `${100 / 6}%`,
    height: `${100 / 3 - 100 / 6}%`,
  });
  event._.startMinutes = 420;
  event._.endMinutes = 900;
  host.config.horizontal = true;
  assert.deepEqual(rules.styles(), {
    backgroundColor: undefined,
    color: '#123456',
    left: '0%',
    width: '100%',
  });
  const classes = rules.classes();
  assert.equal(classes['sd-calendar__event--cut-left'], true);
  assert.equal(classes['sd-calendar__event--cut-right'], true);
  assert.equal(classes['sd-calendar__event--cut-top'], false);
});

test('event style false, all-day colors and midnight duration behavior remain intact', () => {
  const { event, host, props, rules } = fixture();
  host.view.isDay = false;
  host.view.isMonth = true;
  assert.equal(rules.styles(), false);
  event.backgroundColor = 'red';
  assert.deepEqual(rules.styles(), { backgroundColor: 'red', color: undefined });
  host.view.isDay = true;
  host.view.isMonth = false;
  event._.startMinutes = 0;
  event._.endMinutes = 0;
  event._.duration = 1440;
  host.config.timeFrom = 0;
  host.config.timeTo = 1440;
  assert.equal(rules.classes()['sd-calendar__event--all-day'], true);
  assert.equal((rules.styles() || {}).height, '100%');
  props.inAllDayBar = true;
  assert.deepEqual(rules.styles(), { backgroundColor: 'red', color: undefined });
});

test('event classes preserve custom, ghost and global resizing states', () => {
  const { event, host, rules } = fixture();
  event.class = 'custom';
  event.recurring = true;
  event._.dragging = true;
  event._.draggingGhost = true;
  host.touch.isResizingEvent = true;
  const classes = rules.classes();
  assert.equal(classes.custom, true);
  assert.equal(classes['sd-calendar__event--0'], true);
  assert.equal(classes['sd-calendar__event--dragging'], false);
  assert.equal(classes['sd-calendar__event--dragging-ghost'], true);
  assert.equal(classes['sd-calendar__event--resizing'], true);
});

test('event rules avoid reading unused fragment branches', () => {
  const { event, host, props } = fixture();
  const rules = createCalendarEventRules(host, props, event, {
    canTouchAndDrag: null,
    get startsInCell(): boolean {
      throw new Error('eager start');
    },
    get endsInCell(): boolean {
      throw new Error('eager end');
    },
  });
  assert.equal(rules.isResizable(), true);
  assert.ok(rules.styles());
  assert.ok(rules.classes());
});

test('event listeners forward native/prewrapped payloads, suppress drop and exclude resize-end', (t) => {
  const handler = t.mock.fn();
  const state = interaction(t, { 'mouseenter': handler, 'drop': handler, 'resize-end': handler });
  const e = new Event('mouseenter');
  state.listeners.mouseenter(e);
  assert.deepEqual(handler.mock.calls[0].arguments, [{ e, event: state.event }]);
  const wrapped = { e };
  state.listeners.mouseenter(wrapped);
  assert.equal(handler.mock.calls[1].arguments[0], wrapped);
  state.listeners.drop(new Event('drop'));
  assert.equal(handler.mock.callCount(), 2);
  assert.equal(state.listeners['resize-end'], undefined);
});

test('pending delayed click keeps captured handlers across rebind, second click cancels it', (t) => {
  const oldHandler = t.mock.fn(),
    newHandler = t.mock.fn();
  const state = interaction(t, { 'delayed-click': oldHandler });
  state.listeners.click(new Event('click'));
  state.rebind({ 'delayed-click': newHandler });
  t.mock.timers.tick(400);
  assert.equal(oldHandler.mock.callCount(), 1);
  assert.equal(newHandler.mock.callCount(), 0);
  state.listeners.click(new Event('click'));
  t.mock.timers.tick(100);
  state.listeners.click(new Event('click'));
  t.mock.timers.tick(400);
  assert.equal(newHandler.mock.callCount(), 0);
});

test('double click requests stage-one deletion only without an external handler', (t) => {
  const state = interaction(t);
  const deletion = t.mock.fn(state.event.delete);
  state.event.delete = deletion;
  state.listeners.dblclick(new Event('dblclick'));
  assert.deepEqual(deletion.mock.calls[0].arguments, [1]);
  const handler = t.mock.fn();
  state.rebind({ dblclick: handler });
  state.listeners.dblclick(new Event('dblclick'));
  assert.equal(handler.mock.callCount(), 1);
  assert.equal(deletion.mock.callCount(), 1);
});

test('hold fires once at one second and uses latest listeners after rebinding', (t) => {
  const oldHandler = t.mock.fn(),
    newHandler = t.mock.fn();
  const state = interaction(t, { hold: oldHandler });
  const e = new Event('mousedown');
  state.listeners.mousedown(e);
  t.mock.timers.tick(999);
  state.rebind({ hold: newHandler });
  assert.equal(newHandler.mock.callCount(), 0);
  t.mock.timers.tick(1);
  t.mock.timers.tick(1000);
  assert.equal(oldHandler.mock.callCount(), 0);
  assert.equal(newHandler.mock.callCount(), 1);
  assert.deepEqual(newHandler.mock.calls[0].arguments, [{ e, event: state.event }]);
});

for (const release of ['mouseup', 'touchend', 'touchcancel']) {
  test(`event ${release} cancels hold and delayed touch permission and removes document listeners`, (t) => {
    const handler = t.mock.fn();
    const state = interaction(t, { hold: handler });
    state.listeners.touchstart(new Event('touchstart'));
    t.mock.timers.tick(100);
    state.document.dispatchEvent(new Event(release));
    t.mock.timers.tick(2000);
    assert.equal(handler.mock.callCount(), 0);
    assert.equal(state.state.canTouchAndDrag, null);
    assert.equal(state.add.mock.callCount(), 3);
    assert.equal(state.remove.mock.callCount(), 3);
  });
}

test('event touch activates at 500ms and dispatches resize with the original element and event', (t) => {
  const state = interaction(t);
  const e = new Event('touchstart');
  const target = {
    closest: (selector: string) => (selector === '.sd-calendar__event-resizer' ? {} : null),
  };
  Object.defineProperty(e, 'touches', { value: [{ target }] });
  state.listeners.touchstart(e);
  assert.deepEqual(state.resize.mock.calls[0].arguments, [e, state.event, state.element]);
  t.mock.timers.tick(499);
  assert.equal(state.state.canTouchAndDrag, null);
  t.mock.timers.tick(1);
  assert.equal(state.state.canTouchAndDrag, true);
});

test('event disposal cancels pending click and hold and is safe to repeat', (t) => {
  const handler = t.mock.fn();
  const state = interaction(t, { 'hold': handler, 'delayed-click': handler });
  state.listeners.click(new Event('click'));
  state.listeners.mousedown(new Event('mousedown'));
  state.controller.dispose();
  state.controller.dispose();
  t.mock.timers.tick(2000);
  assert.equal(handler.mock.callCount(), 0);
});

test('event interaction construction and listener binding do not require a DOM', () => {
  assert.equal(typeof globalThis.document, 'undefined');
  const { event, state } = fixture();
  const controller = createCalendarEventInteraction(
    {
      prefixCls: 'calendar',
      event,
      element: () => {
        throw new Error('eager element');
      },
      listeners: () => ({}),
      resize: () => {},
    },
    state,
  );
  assert.equal(typeof controller.buildListeners({}).click, 'function');
});
