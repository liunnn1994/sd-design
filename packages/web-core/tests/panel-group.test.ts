import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { MotionDriver } from '../dist/panel-group/motion.js';
import type { PanelOptions } from '../dist/panel-group/panel.js';

import { AXES } from '../dist/panel-group/axes.js';
import {
  createPanelContentAnimation,
  getPanelContentPose,
  getPanelPoseTransition,
  isPanelContentMounted,
  isPanelPresent,
  setGroupDisabled,
  setGroupOrientation,
} from '../dist/panel-group/foundation.js';
import { createEngineGroup } from '../dist/panel-group/group.js';
import { MotionValue } from '../dist/panel-group/motion.js';
import { createPanel } from '../dist/panel-group/panel.js';
import { bezier, cssEasing, timing } from '../dist/panel-group/transition.js';
import { emitter } from '../dist/panel-group/utils.js';

const immediate: MotionDriver = (_from, to, _transition, update, complete) => {
  update(to);
  complete();
  return () => {};
};
const motion = (value: number) => new MotionValue(value, immediate);

test('PanelGroup keeps caller-owned state and raw controller identities', () => {
  const axes = { ...AXES.horizontal };
  const fill = { anchor: 'flex-start' as const, size: '100%' as const };
  const group = createEngineGroup('horizontal', { axes, fill });
  assert.equal(group.axes, axes);
  assert.equal(group.fill, fill);
  const panel = createPanel(group, { size: 200 }, { createMotionValue: motion });
  group.panels.set('start', panel);
  assert.equal(group.panels.get('start'), panel);
  assert.equal(panel.group, group);
});

test('PanelGroup disable cancels drags before notifying and supports re-enable', () => {
  const group = createEngineGroup();
  const order: string[] = [];
  const panel = createPanel(group, { size: 100 }, { createMotionValue: motion });
  panel.drag.cancel = () => order.push('cancel');
  group.panels.set('start', panel);
  group.subscribe(() => order.push(`notify:${group.disabled}`));
  setGroupDisabled(group, true);
  setGroupDisabled(group, undefined);
  assert.deepEqual(order, ['cancel', 'notify:true', 'notify:false']);
});

test('PanelGroup changes the same axes object and notifies after the host render', async () => {
  const group = createEngineGroup();
  const axes = group.axes;
  const order: string[] = [];
  const panel = createPanel(group, { size: 100 }, { createMotionValue: motion });
  panel.drag.cancel = () => order.push('cancel');
  group.panels.set('start', panel);
  group.subscribe(() => order.push('notify'));
  await setGroupOrientation(group, 'vertical', async () => {
    order.push('render');
    assert.equal(group.axes, axes);
    assert.equal(group.axes.extent, 'height');
    assert.deepEqual(order, ['cancel', 'render']);
  });
  assert.deepEqual(order, ['cancel', 'render', 'notify']);
});

test('PanelGroup emitter snapshots subscribers added during a notification', () => {
  const bus = emitter();
  const calls: string[] = [];
  const late = () => calls.push('late');
  const stop = bus.subscribe(() => {
    calls.push('first');
    bus.subscribe(late);
  });
  bus.emit();
  assert.deepEqual(calls, ['first']);
  stop();
  bus.emit();
  assert.deepEqual(calls, ['first', 'late']);
  bus.clear();
  bus.emit();
  assert.equal(calls.length, 2);
});

test('PanelGroup numeric motion uses injected animation and preserves listener order', () => {
  let update!: (value: number) => void;
  let complete!: () => void;
  let stops = 0;
  const value = new MotionValue(10, (from, to, transition, onUpdate, onComplete) => {
    assert.equal(from, 10);
    assert.equal(to, 30);
    assert.equal(transition.duration, 500);
    update = onUpdate;
    complete = onComplete;
    return () => {
      stops++;
    };
  });
  const order: string[] = [];
  const off = value.on('change', (next) => order.push(`change:${next}`));
  value.on('animationComplete', () => order.push(`complete:${value.get()}`));
  value.animate(30, timing({ duration: 500 }));
  update(20);
  update(20);
  complete();
  assert.deepEqual(order, ['change:20', 'change:30', 'complete:30']);
  off();
  value.jump(40);
  assert.equal(stops, 1);
  assert.equal(value.get(), 40);
  value.stop();
  assert.equal(stops, 1);
});

test('PanelGroup zero-duration and same-value motion complete without starting a driver', () => {
  const value = new MotionValue(10, () => {
    throw new Error('unexpected driver');
  });
  let completed = 0;
  value.on('animationComplete', () => {
    completed++;
  });
  value.animate(10);
  value.animate(20, timing({ duration: 0 }));
  assert.equal(value.get(), 20);
  assert.equal(completed, 2);
});

test('PanelGroup replacing a numeric animation stops the previous driver', () => {
  const stops: number[] = [];
  const value = new MotionValue(0, (_from, to) => () => {
    stops.push(to);
  });
  value.animate(10);
  value.animate(20);
  value.stop();
  assert.deepEqual(stops, [10, 20]);
});

test('PanelGroup transition keeps milliseconds, spring fields and bezier endpoints', () => {
  const curve = bezier(0, 0, 1, 1);
  assert.equal(curve(-1), 0);
  assert.equal(curve(2), 1);
  assert.ok(Math.abs(curve(0.5) - 0.5) < 0.001);
  assert.equal(cssEasing({ easing: [0, 0, 1, 1] }), 'cubic-bezier(0, 0, 1, 1)');
  assert.equal(timing({ duration: 900, type: 'spring', bounce: 0.2 }).bounce, 0.2);
  assert.equal(timing({ duration: 900 }).duration, 900);
  assert.equal(
    getPanelPoseTransition(undefined).transition,
    'transform 250ms cubic-bezier(0.32, 0.72, 0, 1), opacity 250ms cubic-bezier(0.32, 0.72, 0, 1)',
  );
});

test('PanelGroup presence distinguishes dragging, size folding, hidden pose and retained content', () => {
  assert.equal(isPanelPresent(true, false, false, false), false);
  assert.equal(isPanelPresent(true, true, false, true), true);
  assert.equal(isPanelPresent(true, false, true, false), true);
  assert.equal(isPanelPresent(true, false, true, true), false);
  assert.equal(isPanelPresent(undefined, false, false, true), true);
  assert.equal(isPanelContentMounted(undefined, false, true), true);
  assert.equal(isPanelContentMounted(false, false, true), false);
  assert.equal(isPanelContentMounted(undefined, false, false), false);
  const shown = { opacity: 1 };
  const hidden = { opacity: 0 };
  assert.equal(getPanelContentPose(true, { shown, hidden }), shown);
  assert.equal(getPanelContentPose(false, { shown, hidden }), hidden);
  assert.equal(getPanelContentPose(false, { shown }), shown);
});

function animationFixture() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const frames: unknown[] = [];
  let cancelled = 0;
  const finished = new Promise<void>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  const element = {
    animate: (...args: unknown[]) => {
      frames.push(args);
      return {
        finished,
        cancel: () => {
          cancelled++;
          reject(new Error('cancelled'));
        },
      };
    },
  } as unknown as Element;
  const adapter = {
    keepMounted: false,
    fold: { shown: { opacity: 1, transform: 'none' }, hidden: { opacity: 0 } },
    transition: { duration: 200 },
  };
  const controller = createPanelContentAnimation(adapter);
  return { resolve, frames, controller, element, adapter, cancelled: () => cancelled };
}

test('PanelGroup content animation uses reversed enter/leave poses and completes after finish', async () => {
  for (const entering of [true, false]) {
    const state = animationFixture();
    let done = 0;
    state.controller.animate(
      state.element,
      () => {
        done++;
      },
      entering,
    );
    assert.deepEqual(
      (state.frames[0] as unknown[])[0],
      entering
        ? [
            { opacity: 0, transform: 'none' },
            { opacity: 1, transform: 'none' },
          ]
        : [
            { opacity: 1, transform: 'none' },
            { opacity: 0, transform: 'none' },
          ],
    );
    assert.equal(done, 0);
    state.resolve();
    await Promise.resolve();
    assert.equal(done, 1);
    state.controller.dispose();
    assert.equal(state.cancelled(), 0);
  }
});

test('PanelGroup content cancellation suppresses completion and dispose releases animations', async () => {
  const state = animationFixture();
  let done = 0;
  state.controller.animate(
    state.element,
    () => {
      done++;
    },
    true,
  );
  state.controller.dispose();
  await Promise.resolve();
  assert.equal(state.cancelled(), 1);
  assert.equal(done, 0);
});

test('PanelGroup retained content completes without creating native animation', () => {
  const state = animationFixture();
  state.adapter.keepMounted = true;
  let done = 0;
  state.controller.animate(
    state.element,
    () => {
      done++;
    },
    true,
  );
  assert.equal(done, 1);
  assert.equal(state.frames.length, 0);
});

function withDom(
  run: (node: HTMLElement, group: ReturnType<typeof createEngineGroup>) => void | Promise<void>,
) {
  const values = {
    getComputedStyle: () => ({ width: '600px', height: '400px', direction: 'ltr' }),
    ResizeObserver: class {
      observe() {}
      disconnect() {}
    },
    document: { body: { style: { cursor: 'auto', userSelect: 'text', webkitUserSelect: '' } } },
    addEventListener: () => {},
    removeEventListener: () => {},
  };
  const previous = Object.fromEntries(
    Object.keys(values).map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]),
  );
  for (const [key, value] of Object.entries(values))
    Object.defineProperty(globalThis, key, { configurable: true, value });
  const fill = {
    hasAttribute: (name: string) => name === 'data-sd-panels-fill',
    nextElementSibling: null,
  };
  const node = {
    parentElement: { clientWidth: 800, clientHeight: 600, children: [] as unknown[] },
    nextElementSibling: fill,
    hasAttribute: () => false,
  };
  node.parentElement.children = [node, fill];
  return Promise.resolve()
    .then(() => run(node as unknown as HTMLElement, createEngineGroup()))
    .finally(() => {
      for (const [key, descriptor] of Object.entries(previous)) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else Reflect.deleteProperty(globalThis, key);
      }
    });
}

test('PanelGroup controller registers by fill side, computes bounds and handles keyboard reports', () =>
  withDom((node, group) => {
    const sizes: unknown[] = [];
    const collapse: boolean[] = [];
    const panel = createPanel(
      group,
      {
        size: 200,
        minSize: 100,
        maxSize: 500,
        onSizeChange: (value) => sizes.push(value),
        onCollapsedChange: (value) => collapse.push(value),
      },
      { createMotionValue: motion },
    );
    const detach = panel.attach(node);
    assert.equal(group.panels.get('start'), panel);
    assert.equal(panel.state.end, true);
    assert.deepEqual(panel.bounds(), { min: 100, max: 500 });
    let prevented = 0;
    for (const key of ['ArrowRight', 'Home', 'End', 'Enter', 'Escape'])
      panel.resizeByKey({
        key,
        shiftKey: false,
        preventDefault: () => {
          prevented++;
        },
      });
    assert.deepEqual(sizes, [210, 100, 500]);
    assert.deepEqual(collapse, [true]);
    assert.equal(prevented, 4);
    detach();
    assert.equal(group.panels.size, 0);
    panel.destroy();
  }));

test('PanelGroup percentage sizing reports two decimal places and restores original drag value on cancel', () =>
  withDom((node, group) => {
    const sizes: unknown[] = [];
    const panel = createPanel(
      group,
      { size: '25%', onSizeChange: (value) => sizes.push(value) },
      { createMotionValue: motion },
    );
    const detach = panel.attach(node);
    assert.equal(panel.motion.size.get(), 200);
    panel.drag.start();
    panel.drag.move({ x: 81, y: 0 });
    assert.equal(panel.motion.size.get(), 281);
    assert.deepEqual(sizes, ['35.13%']);
    panel.drag.cancel();
    assert.equal(panel.motion.size.get(), 200);
    assert.deepEqual(sizes, ['35.13%', '25%']);
    assert.equal(document.body.style.userSelect, 'text');
    detach();
    panel.destroy();
  }));

test('PanelGroup rejected controlled drag settles back only after host commits', () =>
  withDom(async (node, group) => {
    const options: PanelOptions = { size: 200 };
    const panel = createPanel(group, options, { createMotionValue: motion });
    const detach = panel.attach(node);
    panel.drag.start();
    panel.drag.move({ x: 100, y: 0 });
    panel.drag.end();
    assert.equal(panel.motion.size.get(), 300);
    await Promise.resolve();
    assert.equal(panel.motion.size.get(), 200);
    assert.equal(panel.state.dragging, false);
    assert.equal(panel.state.folding, false);
    detach();
    panel.destroy();
  }));

test('PanelGroup controlled drag honors the host target committed before settling', () =>
  withDom(async (node, group) => {
    let panel: ReturnType<typeof createPanel>;
    const options: PanelOptions = {
      size: 200,
      onSizeChange: (value) => {
        options.size = value;
        panel.sync(options);
      },
    };
    panel = createPanel(group, options, { createMotionValue: motion });
    const detach = panel.attach(node);
    panel.drag.start();
    panel.drag.move({ x: 100, y: 0 });
    panel.drag.end();
    await Promise.resolve();
    assert.equal(panel.target, 300);
    assert.equal(panel.motion.size.get(), 300);
    detach();
    panel.destroy();
  }));

test('PanelGroup disposal cancels queued drag settling without clipping the remaining fill panel', () =>
  withDom(async (node, group) => {
    const panel = createPanel(group, { size: 200 }, { createMotionValue: motion });
    const detach = panel.attach(node);
    panel.drag.start();
    panel.drag.move({ x: 100, y: 0 });
    panel.drag.end();
    detach();
    panel.destroy();
    await Promise.resolve();
    assert.equal(group.fill.size, '100%');
    assert.equal(panel.state.folding, false);
    assert.equal(panel.motion.size.get(), 300);
  }));

test('PanelGroup disposal cancels a queued initial expansion', () =>
  withDom(async (node, group) => {
    const panel = createPanel(group, { size: 200, collapsed: true }, { createMotionValue: motion });
    const detach = panel.attach(node);
    panel.sync({ size: 200, collapsed: false }, true);
    detach();
    panel.destroy();
    await Promise.resolve();
    assert.equal(panel.motion.size.get(), 0);
    assert.equal(group.fill.size, '100%');
  }));
