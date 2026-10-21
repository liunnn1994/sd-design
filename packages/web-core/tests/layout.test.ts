import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createLayoutRegistry, resolveHasSider } from '../dist/layout/layout.js';
import { createSiderFoundation, toSiderWidth, type SiderState } from '../dist/layout/sider.js';

function fixture(overrides: Partial<SiderState['props']> = {}) {
  const events: unknown[][] = [];
  const props: SiderState['props'] = {
    collapsed: undefined,
    defaultCollapsed: false,
    breakpoint: undefined,
    rail: false,
    expandOnHover: false,
    width: 200,
    collapsedWidth: 48,
    railWidth: 56,
    temporary: false,
    hideTrigger: false,
    collapsible: false,
    ...overrides,
  };
  const state: SiderState = {
    props,
    collapsed: false,
    below: false,
    hovering: false,
    get controlled() {
      return props.collapsed !== undefined;
    },
    get mergedCollapsed() {
      return state.controlled ? props.collapsed! : state.collapsed;
    },
    get railHoverEnabled() {
      return props.rail && props.expandOnHover;
    },
    get railExpanded() {
      return state.railHoverEnabled && state.hovering;
    },
    get hasZeroWidth() {
      return Number.parseFloat(String(props.collapsedWidth || 0)) === 0;
    },
  };
  const foundation = createSiderFoundation(state, {
    collapse(value, type) {
      events.push(['collapse', value, type, state.collapsed]);
    },
    breakpoint(value) {
      events.push(['breakpoint', value, state.below]);
    },
    rail(value) {
      events.push(['rail', value, state.hovering]);
    },
  });
  return { props, state, events, foundation };
}

test('Sider constructs without DOM and preserves numeric and unit width conversion', () => {
  const { foundation } = fixture();
  assert.equal(foundation.setupResponsive(), undefined);
  for (const [value, expected] of [
    [0, '0px'],
    ['0', '0px'],
    ['01', '01px'],
    [' 2 ', ' 2 px'],
    ['2e2', '2e2px'],
    ['0x10', '0x10px'],
    ['', ''],
    [' ', ' '],
    ['20%', '20%'],
    ['2rem', '2rem'],
    [Infinity, 'Infinity'],
  ] as const) {
    assert.equal(toSiderWidth(value), expected);
  }
});

test('Sider initializes once from explicit collapsed or default and ignores later default changes', () => {
  const uncontrolled = fixture({ defaultCollapsed: true });
  assert.equal(uncontrolled.foundation.mergedCollapsed, true);
  uncontrolled.props.defaultCollapsed = false;
  assert.equal(uncontrolled.foundation.mergedCollapsed, true);
  const controlled = fixture({ collapsed: false, defaultCollapsed: true });
  assert.equal(controlled.state.collapsed, false);
  controlled.props.collapsed = undefined;
  assert.equal(controlled.foundation.mergedCollapsed, false);
});

test('Sider uncontrolled changes state before notifying and controlled requests remain requests', () => {
  const { props, state, events, foundation } = fixture();
  foundation.toggle();
  assert.deepEqual(events, [['collapse', true, 'clickTrigger', true]]);
  props.collapsed = false;
  foundation.syncCollapsed(false);
  assert.equal(foundation.controlled, true);
  foundation.toggle();
  assert.equal(foundation.mergedCollapsed, false);
  assert.equal(state.collapsed, false);
  assert.deepEqual(events.at(-1), ['collapse', true, 'clickTrigger', false]);
  props.collapsed = true;
  foundation.syncCollapsed(true);
  props.collapsed = undefined;
  foundation.syncCollapsed(undefined);
  assert.equal(foundation.controlled, false);
  assert.equal(foundation.mergedCollapsed, true);
});

test('Sider activation keys prevent default before toggling with the original guard', () => {
  const { events, foundation } = fixture();
  for (const key of ['Enter', ' ', 'Spacebar', 'Escape']) {
    foundation.handleTriggerKeydown({
      key,
      preventDefault() {
        events.push(['prevent', key]);
      },
    } as KeyboardEvent);
  }
  assert.deepEqual(events, [
    ['prevent', 'Enter'],
    ['collapse', true, 'clickTrigger', true],
    ['prevent', ' '],
    ['collapse', false, 'clickTrigger', false],
  ]);
});

function withMedia(
  legacy: boolean,
  run: (media: {
    queries: string[];
    subscriptions: unknown[][];
    fire(matches: boolean): void;
  }) => void,
) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const queries: string[] = [];
  const subscriptions: unknown[][] = [];
  let listener: ((event: MediaQueryListEvent) => void) | undefined;
  const mql = {
    matches: true,
    ...(legacy
      ? {
          addListener(fn: typeof listener) {
            listener = fn;
            subscriptions.push(['add', fn]);
          },
          removeListener(fn: typeof listener) {
            subscriptions.push(['remove', fn]);
          },
        }
      : {
          addEventListener(type: string, fn: typeof listener) {
            listener = fn;
            subscriptions.push(['add', type, fn]);
          },
          removeEventListener(type: string, fn: typeof listener) {
            subscriptions.push(['remove', type, fn]);
          },
        }),
  };
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      matchMedia(query: string) {
        queries.push(query);
        return mql;
      },
    },
  });
  try {
    run({
      queries,
      subscriptions,
      fire(matches) {
        listener!({ matches } as MediaQueryListEvent);
      },
    });
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'window', descriptor);
    else Reflect.deleteProperty(globalThis, 'window');
  }
}

for (const legacy of [false, true])
  test(`Sider breakpoint ${legacy ? 'legacy' : 'modern'} listener preserves initial notification, transitions and cleanup`, () => {
    withMedia(legacy, ({ queries, subscriptions, fire }) => {
      const { props, state, events, foundation } = fixture();
      props.breakpoint = 'md';
      const cleanup = foundation.setupResponsive();
      assert.deepEqual(queries, ['screen and (max-width: 767.98px)']);
      assert.deepEqual(events, [
        ['breakpoint', true, true],
        ['collapse', true, 'responsive', true],
      ]);
      fire(true);
      assert.deepEqual(events.at(-1), ['breakpoint', true, true]);
      fire(false);
      assert.deepEqual(events.at(-1), ['collapse', false, 'responsive', false]);
      state.below = true;
      const before = events.length;
      cleanup!();
      assert.equal(state.below, false);
      assert.equal(events.length, before);
      assert.equal(subscriptions[0]!.at(-1), subscriptions[1]!.at(-1));
      assert.equal(subscriptions[1]![0], 'remove');
    });
  });

test('Sider breakpoint notification can synchronously accept controlled state before collapse comparison', () => {
  withMedia(false, () => {
    const { props, state } = fixture();
    props.breakpoint = 'xxxl';
    props.collapsed = false;
    const events: unknown[][] = [];
    const foundation = createSiderFoundation(state, {
      breakpoint(value) {
        props.collapsed = value;
        events.push(['breakpoint', value]);
      },
      collapse(value, type) {
        events.push(['collapse', value, type]);
      },
      rail() {},
    });
    const cleanup = foundation.setupResponsive();
    assert.deepEqual(events, [['breakpoint', true]]);
    cleanup!();
  });
});

test('Sider breakpoint map remains distinct from Grid media queries and unknown values do not subscribe', () => {
  withMedia(false, ({ queries }) => {
    const { props, foundation } = fixture();
    for (const [breakpoint, max] of [
      ['xs', '479.98'],
      ['sm', '575.98'],
      ['md', '767.98'],
      ['lg', '991.98'],
      ['xl', '1199.98'],
      ['xxl', '1599.98'],
      ['xxxl', '1839.98'],
    ] as const) {
      props.breakpoint = breakpoint;
      foundation.setupResponsive()!();
      assert.equal(queries.at(-1), `screen and (max-width: ${max}px)`);
    }
    props.breakpoint = 'invalid' as typeof props.breakpoint;
    assert.equal(foundation.setupResponsive(), undefined);
    assert.equal(queries.length, 7);
  });
});

test('Sider rail is independent of collapsed, only numeric rail width reaches descendants, hover resets', () => {
  const { props, state, events, foundation } = fixture();
  props.rail = true;
  props.expandOnHover = true;
  props.collapsed = true;
  assert.equal(foundation.rawWidth, 56);
  assert.equal(foundation.siderRail, true);
  assert.equal(foundation.siderRailWidth, 56);
  foundation.onMouseEnter();
  assert.deepEqual(events.at(-1), ['rail', false, true]);
  assert.equal(foundation.rawWidth, 200);
  assert.equal(foundation.siderRail, false);
  foundation.onMouseLeave();
  assert.deepEqual(events.at(-1), ['rail', true, false]);
  foundation.onMouseEnter();
  props.expandOnHover = false;
  foundation.syncRailHover(false);
  foundation.onMouseLeave();
  assert.equal(state.hovering, false);
  props.expandOnHover = true;
  assert.equal(foundation.railExpanded, false);
  props.railWidth = '56';
  assert.equal(foundation.siderRailWidth, undefined);
  props.rail = false;
  assert.equal(foundation.rawWidth, 48);
});

test('Sider temporary trigger and drawer preserve inverse collapsed semantics and mask deduplication', () => {
  const { props, state, events, foundation } = fixture();
  props.temporary = true;
  assert.equal(foundation.renderTrigger, true);
  foundation.onDrawerVisibleChange(true);
  assert.equal(events.length, 0);
  foundation.onDrawerVisibleChange(false);
  assert.deepEqual(events, [['collapse', true, 'mask', true]]);
  foundation.onDrawerVisibleChange(false);
  assert.equal(events.length, 1);
  props.hideTrigger = true;
  assert.equal(foundation.renderTrigger, false);
  props.temporary = false;
  props.hideTrigger = false;
  props.collapsedWidth = '0px';
  state.below = true;
  assert.equal(foundation.hasZeroWidth, true);
  assert.equal(foundation.renderTrigger, true);
  props.collapsedWidth = 'auto';
  assert.equal(foundation.hasZeroWidth, false);
  assert.equal(foundation.renderTrigger, false);
});

test('Layout registry replaces arrays, keeps duplicate registration and removes all matching ids', () => {
  const state = { siders: ['a'] };
  const original = state.siders;
  const registry = createLayoutRegistry(state);
  registry.addSider('a');
  registry.addSider('b');
  assert.deepEqual(original, ['a']);
  assert.deepEqual(state.siders, ['a', 'a', 'b']);
  registry.removeSider('a');
  assert.deepEqual(state.siders, ['b']);
  const current = state.siders;
  registry.removeSider('missing');
  assert.notEqual(state.siders, current);
});

test('Layout explicit false and registered Siders short circuit child scanning', () => {
  const unexpected = () => {
    throw Error('unexpected dependency read');
  };
  assert.equal(resolveHasSider(false, unexpected, unexpected), false);
  assert.equal(resolveHasSider(true, unexpected, unexpected), true);
  assert.equal(
    resolveHasSider(undefined, () => 1, unexpected),
    true,
  );
  let scans = 0;
  assert.equal(
    resolveHasSider(
      undefined,
      () => 0,
      () => {
        scans++;
        return false;
      },
    ),
    false,
  );
  assert.equal(scans, 1);
});
