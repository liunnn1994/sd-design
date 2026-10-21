import assert from 'node:assert/strict';
import { test, type TestContext } from 'node:test';

import {
  resolveEllipsisMaxLines,
  getEllipsisRootStyle,
  getEllipsisMeasurementStyle,
} from '../dist/ellipsis/data.js';
import {
  createEllipsisFoundation,
  type EllipsisFoundationState,
} from '../dist/ellipsis/foundation.js';
import {
  createPerformantEllipsisFoundation,
  type PerformantEllipsisState,
} from '../dist/ellipsis/performant.js';
function globalValue(t: TestContext, key: string, value: unknown) {
  const old = Object.getOwnPropertyDescriptor(globalThis, key);
  Object.defineProperty(globalThis, key, { configurable: true, value });
  t.after(() => {
    if (old) Object.defineProperty(globalThis, key, old);
    else Reflect.deleteProperty(globalThis, key);
  });
}
class Target {
  parent: Target | undefined;
  interactive = false;
  events: unknown[][] = [];
  closest() {
    let target: Target | undefined = this;
    while (target) {
      if (target.interactive) return target;
      target = target.parent;
    }
    return null;
  }
  contains(child: Target) {
    let target: Target | undefined = child;
    while (target) {
      if (target === this) return true;
      target = target.parent;
    }
    return false;
  }
  focus() {
    this.events.push(['focus']);
  }
  dispatchEvent(event: { type: string; bubbles: boolean }) {
    this.events.push([event.type, event.bubbles]);
    return true;
  }
  get element() {
    return this as unknown as HTMLElement;
  }
}
function fixture(t: TestContext) {
  const timers = new Map<number, { run: () => void; delay: number }>();
  let next = 1;
  globalValue(t, 'window', {
    clearTimeout: (id: number) => timers.delete(id),
    setTimeout: (run: () => void, delay: number) => {
      const id = next++;
      timers.set(id, { run, delay });
      return id;
    },
  });
  globalValue(t, 'Element', Target);
  const state: { -readonly [Key in keyof EllipsisFoundationState]: EllipsisFoundationState[Key] } =
    {
      triggerElement: undefined,
      expandTrigger: 'click',
      tooltipConfig: {},
      enableTooltip: true,
      measurementHtml: '',
      measurementWidth: 0,
      measurementPadding: '0',
      text: '',
      isEllipsis: false,
      expanded: false,
    };
  return { state, timers, controller: createEllipsisFoundation(state) };
}
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
function performant(t: TestContext) {
  const frames: FrameRequestCallback[] = [];
  globalValue(t, 'requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.push(callback);
    return frames.length;
  });
  globalValue(t, 'Element', Target);
  globalValue(
    t,
    'MouseEvent',
    class {
      type: string;
      bubbles: boolean;
      constructor(type: string, options: { bubbles: boolean }) {
        this.type = type;
        this.bubbles = options.bubbles;
      }
    },
  );
  const root = new Target(),
    renderGates: ReturnType<typeof deferred>[] = [],
    measurement = deferred(),
    events: string[] = [];
  const state: { -readonly [Key in keyof PerformantEllipsisState]: PerformantEllipsisState[Key] } =
    {
      activated: false,
      expandTrigger: 'click',
      triggerElement: root.element,
      afterRender: () => {
        events.push('render');
        const gate = deferred();
        renderGates.push(gate);
        return gate.promise;
      },
      waitForMeasurement: () => {
        events.push('measurement');
        return measurement.promise;
      },
      toggleExpanded: () => {
        events.push('toggle');
      },
    };
  const controller = createPerformantEllipsisFoundation(state);
  async function reachMeasurement() {
    renderGates[0].resolve();
    await Promise.resolve();
    renderGates[1].resolve();
    await Promise.resolve();
    assert.equal(frames.length, 1);
    frames.shift()!(0);
    await Promise.resolve();
  }
  return { root, state, renderGates, measurement, events, frames, controller, reachMeasurement };
}

test('line limit normalization preserves defaults, positive fractions and string coercion', () => {
  for (const value of [undefined, 0, -1, NaN, Infinity, '', 'bad'])
    assert.equal(resolveEllipsisMaxLines(value), 1);
  for (const value of [1, 2.5, '3', '1.25'])
    assert.equal(resolveEllipsisMaxLines(value), Number(value));
});
test('collapsed/expanded style variants retain dimensions and lazy line reads', () => {
  const inert = () => {
    throw Error('line read');
  };
  assert.deepEqual(getEllipsisRootStyle(false, false, inert), {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  });
  assert.deepEqual(getEllipsisRootStyle(false, true, inert), {
    overflow: 'visible',
    textOverflow: 'clip',
    whiteSpace: 'normal',
  });
  assert.equal(getEllipsisRootStyle(true, true, inert).WebkitLineClamp, 'unset');
  assert.equal(getEllipsisRootStyle(true, false, () => 2.5).WebkitLineClamp, '2.5');
  assert.deepEqual(getEllipsisMeasurementStyle(16.03125, '1px 2px 3px 4px'), {
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: -1,
    boxSizing: 'border-box',
    width: '16.03125px',
    padding: '1px 2px 3px 4px',
    margin: 0,
    visibility: 'hidden',
    pointerEvents: 'none',
    whiteSpace: 'normal',
  });
});
test('measurement clones content, excludes nested probes and preserves fractional padding-box width', (t) => {
  const { state, controller } = fixture(t);
  let removed = 0;
  const clone = {
    querySelectorAll: (selector: string) => {
      assert.equal(selector, '[data-ellipsis-measure]');
      return [
        {
          remove() {
            removed++;
          },
        },
      ];
    },
    get innerHTML() {
      assert.equal(removed, 1);
      return '<b>10</b>';
    },
    textContent: ' 10 ',
  };
  state.triggerElement = {
    cloneNode: (deep: boolean) => {
      assert.equal(deep, true);
      return clone;
    },
    getBoundingClientRect: () => ({ width: 18.28125 }),
  } as unknown as HTMLElement;
  Object.assign(window, {
    getComputedStyle: () => ({
      paddingTop: '1px',
      paddingRight: '2px',
      paddingBottom: '3px',
      paddingLeft: '4px',
      borderLeftWidth: '1.25px',
      borderRightWidth: '1px',
    }),
  });
  controller.syncMeasurement();
  assert.equal(state.measurementWidth, 16.03125);
  assert.equal(state.measurementHtml, '<b>10</b>');
  assert.equal(state.text, '10');
  assert.equal(state.measurementPadding, '1px 2px 3px 4px');
});
test('unchanged measurements do not republish reactive values and invalid borders count as zero', (t) => {
  const { state, controller } = fixture(t);
  const expected = {
    measurementHtml: 'same',
    text: 'same',
    measurementWidth: 7.5,
    measurementPadding: '0 0 0 0',
  };
  for (const [key, value] of Object.entries(expected))
    Object.defineProperty(state, key, {
      get: () => value,
      set() {
        throw Error('unnecessary publication ' + key);
      },
    });
  state.triggerElement = {
    cloneNode: () => ({ querySelectorAll: () => [], innerHTML: 'same', textContent: 'same' }),
    getBoundingClientRect: () => ({ width: 7.5 }),
  } as unknown as HTMLElement;
  Object.assign(window, {
    getComputedStyle: () => ({
      paddingTop: '0',
      paddingRight: '0',
      paddingBottom: '0',
      paddingLeft: '0',
      borderLeftWidth: '',
      borderRightWidth: 'bad',
    }),
  });
  controller.syncMeasurement();
});
test('empty initial clamp events do not settle waiters before real measurement content', async (t) => {
  const { state, controller } = fixture(t);
  let settled = 0;
  const first = controller.waitForMeasurement().then(() => settled++),
    second = controller.waitForMeasurement().then(() => settled++);
  controller.handleClampChange(true);
  await Promise.resolve();
  assert.equal(settled, 0);
  assert.equal(state.isEllipsis, true);
  state.measurementHtml = 'content';
  controller.handleClampChange(false);
  await Promise.all([first, second]);
  assert.equal(settled, 2);
  assert.equal(state.isEllipsis, false);
  await controller.waitForMeasurement();
});
test('200ms fallback settles empty content and later requests without leaving a timer', async (t) => {
  const { timers, controller } = fixture(t);
  controller.startMeasurementFallback();
  const pending = controller.waitForMeasurement();
  const scheduled = [...timers.values()][0];
  assert.equal(scheduled.delay, 200);
  scheduled.run();
  await pending;
  assert.equal(timers.size, 0);
  await controller.waitForMeasurement();
});
test('unmount flush resolves all pending measurements once and cancels fallback', async (t) => {
  const { timers, controller } = fixture(t);
  controller.startMeasurementFallback();
  let settled = 0;
  const pending = controller.waitForMeasurement().then(() => settled++);
  controller.flushMeasurementWaiters();
  controller.flushMeasurementWaiters();
  await pending;
  assert.equal(settled, 1);
  assert.equal(timers.size, 0);
});
test('observer observes only native content mutations and exposes disconnect cleanup', (t) => {
  const { controller } = fixture(t);
  let disconnected = 0,
    callback: (() => void) | undefined;
  const root = new Target();
  globalValue(
    t,
    'MutationObserver',
    class {
      constructor(run: () => void) {
        callback = run;
      }
      observe(element: Element, options: MutationObserverInit) {
        assert.equal(element, root);
        assert.deepEqual(options, { childList: true, subtree: true, characterData: true });
      }
      disconnect() {
        disconnected++;
      }
    },
  );
  assert.equal(controller.observeTrigger(undefined), undefined);
  const cleanup = controller.observeTrigger(root.element);
  assert.equal(typeof callback, 'function');
  cleanup!();
  assert.equal(disconnected, 1);
});
test('nested native controls retain default click behavior while root role button can toggle', (t) => {
  const { state, controller } = fixture(t);
  const root = new Target(),
    button = new Target();
  root.interactive = true;
  button.interactive = true;
  button.parent = root;
  state.triggerElement = root.element;
  state.isEllipsis = true;
  controller.handleClick({ target: button } as unknown as MouseEvent);
  assert.equal(state.expanded, false);
  controller.handleClick({ target: root } as unknown as MouseEvent);
  assert.equal(state.expanded, true);
  state.isEllipsis = false;
  controller.handleClick();
  assert.equal(state.expanded, false);
  controller.handleClick();
  assert.equal(state.expanded, false);
  state.expandTrigger = undefined;
  state.isEllipsis = true;
  controller.handleClick();
  assert.equal(state.expanded, false);
});
test('keyboard activation prevents only supported root keys and ignores nested controls', (t) => {
  const { state, controller } = fixture(t);
  const root = new Target(),
    button = new Target();
  root.interactive = true;
  button.interactive = true;
  button.parent = root;
  state.triggerElement = root.element;
  state.isEllipsis = true;
  let prevented = 0;
  const key = (target: Target, key: string) =>
    ({
      target,
      key,
      preventDefault() {
        prevented++;
      },
    }) as unknown as KeyboardEvent;
  controller.handleKeydown(key(button, 'Enter'));
  controller.handleKeydown(key(root, 'Escape'));
  assert.equal(prevented, 0);
  controller.handleKeydown(key(root, ' '));
  assert.equal(state.expanded, true);
  assert.equal(prevented, 1);
  controller.resetExpanded();
  assert.equal(state.expanded, false);
});
test('tooltip disabled/title decisions retain expansion, always and native fallback priorities', (t) => {
  const { state, controller } = fixture(t);
  assert.equal(controller.getTooltipDisabled(), true);
  state.tooltipConfig = { always: true };
  assert.equal(controller.getTooltipDisabled(), false);
  state.isEllipsis = true;
  state.text = 'original text';
  state.enableTooltip = false;
  assert.equal(controller.getNativeTitle(), 'original text');
  state.expanded = true;
  assert.equal(controller.getTooltipDisabled(), true);
  assert.equal(controller.getNativeTitle(), undefined);
  Object.defineProperty(state, 'tooltipConfig', {
    get() {
      throw Error('tooltip read');
    },
  });
  assert.equal(controller.getTooltipDisabled(), true);
  assert.equal(controller.getNativeTitle(), undefined);
});
test('activation waits two renderer commits, an actual frame and measurement before replay', async (t) => {
  const { controller, state, events, measurement, reachMeasurement } = performant(t);
  const pending = controller.activate('click');
  assert.equal(state.activated, true);
  assert.deepEqual(events, ['render']);
  await controller.activate('hover');
  assert.deepEqual(events, ['render']);
  await reachMeasurement();
  assert.deepEqual(events, ['render', 'render', 'measurement']);
  measurement.resolve();
  await pending;
  assert.deepEqual(events, ['render', 'render', 'measurement', 'toggle']);
});
test('hover replay retains native event order and bubbling while focus replay uses the live target', async (t) => {
  const { controller, root, measurement, reachMeasurement, state } = performant(t);
  const pending = controller.activate('hover');
  await reachMeasurement();
  measurement.resolve();
  await pending;
  assert.deepEqual(root.events, [
    ['mouseenter', false],
    ['mousemove', true],
  ]);
  const replacement = new Target();
  state.triggerElement = replacement.element;
  controller.replayInteraction('focus');
  assert.deepEqual(replacement.events, [['focus']]);
});
test('missing measurement and a removed trigger finish activation without replay', async (t) => {
  const { controller, state, events, reachMeasurement } = performant(t);
  state.waitForMeasurement = () => undefined;
  const pending = controller.activate('click');
  state.triggerElement = undefined;
  await reachMeasurement();
  await pending;
  assert.deepEqual(events, ['render', 'render']);
});
test('measurement rejection remains observable and prevents interaction replay', async (t) => {
  const { controller, state, events, reachMeasurement } = performant(t);
  const error = Error('measurement failed');
  state.waitForMeasurement = () => Promise.reject(error);
  const pending = controller.activate('click');
  const rejected = assert.rejects(pending, error);
  await reachMeasurement();
  await rejected;
  assert.deepEqual(events, ['render', 'render']);
});
test('inner-control first click activates lazily without expanding or synthesizing a second click', async (t) => {
  const { controller, state, events, root, measurement, reachMeasurement } = performant(t);
  const button = new Target();
  button.interactive = true;
  button.parent = root;
  controller.handleClick({ target: button, currentTarget: root } as unknown as MouseEvent);
  assert.equal(state.activated, true);
  await reachMeasurement();
  measurement.resolve();
  await Promise.resolve();
  assert.deepEqual(events, ['render', 'render', 'measurement']);
  assert.deepEqual(button.events, []);
});
test('plain first click replays expansion after readiness', async (t) => {
  const { controller, events, root, measurement, reachMeasurement } = performant(t);
  root.interactive = true;
  controller.handleClick({ target: root, currentTarget: root } as unknown as MouseEvent);
  await reachMeasurement();
  measurement.resolve();
  await Promise.resolve();
  assert.equal(events.at(-1), 'toggle');
});
test('SSR construction and inert measurement need no native globals', (t) => {
  globalValue(t, 'window', undefined);
  globalValue(t, 'document', undefined);
  const state: EllipsisFoundationState = {
    triggerElement: undefined,
    expandTrigger: undefined,
    tooltipConfig: {},
    enableTooltip: true,
    measurementHtml: '',
    measurementWidth: 0,
    measurementPadding: '0',
    text: '',
    isEllipsis: false,
    expanded: false,
  };
  const controller = createEllipsisFoundation(state);
  controller.syncMeasurement();
  assert.equal(controller.isExpandable(), false);
  assert.equal(controller.getNativeTitle(), undefined);
});
