import type { OverlayScrollbars } from 'overlayscrollbars';

import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  createVirtualListFoundation,
  type VirtualListState,
  type VirtualizerPort,
} from '../dist/virtual-list/foundation.js';
function fixture() {
  let foundation!: ReturnType<typeof createVirtualListFoundation<unknown, { marker: symbol }>>;
  const events: unknown[][] = [],
    calls: unknown[][] = [],
    renders: (() => void)[] = [];
  const cache = { marker: Symbol('opaque') };
  const env = {
    viewport: undefined as HTMLElement | undefined,
    host: undefined as HTMLElement | undefined,
    virtualizer: undefined as VirtualizerPort<typeof cache> | undefined,
  };
  const props: VirtualListState<unknown, typeof cache>['props'] = {
    items: [],
    direction: 'vertical',
    scrollbar: true,
    fixedSize: false,
    keyField: 'key',
  };
  const state: VirtualListState<unknown, typeof cache> = {
    props,
    get items() {
      return foundation.getResolvedItems();
    },
    get horizontal() {
      return foundation.getIsHorizontal();
    },
    get scrollbarProps() {
      return foundation.getResolvedScrollbarProps();
    },
    get itemSizeHint() {
      return foundation.getItemSizeHint();
    },
    get minItemSizeValue() {
      return foundation.getMinItemSizeValue();
    },
    get overlayOptions() {
      return foundation.getResolvedOverlayOptions();
    },
    get host() {
      return env.host;
    },
    get viewport() {
      return env.viewport;
    },
    get virtualizer() {
      return env.virtualizer;
    },
    instance: null,
    overlayReady: false,
  };
  foundation = createVirtualListFoundation(state, {
    afterRender: () => new Promise((resolve) => renders.push(resolve)),
    scroll(event) {
      events.push(['scroll', event]);
    },
    reachBottom(event) {
      events.push(['bottom', event]);
    },
    scrollEnd() {
      events.push(['end']);
    },
  });
  const engine: VirtualizerPort<typeof cache> = {
    cache,
    scrollSize: 999,
    scrollToIndex(index, options) {
      calls.push(['index', index, options]);
    },
    scrollTo(offset) {
      calls.push(['position', offset]);
    },
    findItemIndex(offset) {
      calls.push(['find', offset]);
      return 0;
    },
    getItemOffset(index) {
      calls.push(['offset', index]);
      return 12;
    },
    getItemSize(index) {
      calls.push(['size', index]);
      return 30;
    },
  };
  return { foundation, state, props, events, calls, env, cache, engine, renders };
}

test('VirtualList constructs without DOM or an SDK handle and preserves public fallback contracts', () => {
  const { foundation } = fixture();
  assert.deepEqual(foundation.getResolvedItems(), []);
  assert.equal(foundation.findItemIndex(4), -1);
  assert.equal(foundation.getItemOffset(0), 0);
  assert.equal(foundation.getItemSize(0), 0);
  assert.equal(foundation.cacheSnapshot(), undefined);
  assert.equal(foundation.restoreCache(), false);
  assert.equal(foundation.forceUpdate(), undefined);
  assert.equal(foundation.updateVisibleItems(), undefined);
  foundation.scrollToBottom();
  foundation.scrollToItem(0);
  foundation.scrollToPosition(9);
});
test('VirtualList size hints preserve positive parseFloat semantics and nullish estimated fallback', () => {
  const { props, foundation } = fixture();
  for (const [value, expected] of [
    [20, 20],
    ['2rem', 2],
    [' 3px', 3],
    ['12junk', 12],
    [0, undefined],
    [-1, undefined],
    ['auto', undefined],
    [() => 99, undefined],
    [{}, undefined],
  ] as const) {
    props.itemSize = value;
    assert.equal(foundation.getItemSizeHint(), expected);
  }
  props.itemSize = 0;
  props.estimatedSize = 0;
  props.minItemSize = '9px';
  assert.equal(foundation.getItemSizeHint(), 0);
  props.estimatedSize = undefined;
  assert.equal(foundation.getItemSizeHint(), 9);
});
test('VirtualList fixed/minimum CSS values and rebuild key preserve original units and axis switches', () => {
  const { props, foundation } = fixture();
  props.itemSize = '2rem';
  props.minItemSize = '10px';
  assert.equal(foundation.getFixedItemSizeValue(), undefined);
  props.fixedSize = true;
  assert.equal(foundation.getFixedItemSizeValue(), '2rem');
  assert.equal(foundation.getVirtualizerKey(), 'vertical:fixed:2:10px');
  props.direction = 'horizontal';
  assert.equal(foundation.getVirtualizerKey(), 'horizontal:fixed:2:10px');
  props.itemSize = 0;
  props.minItemSize = 'auto';
  assert.equal(foundation.getFixedItemSizeValue(), undefined);
  assert.equal(foundation.getMinItemSizeValue(), undefined);
});
test('VirtualList scrollbar options preserve explicit false, nested priority and track defaults', () => {
  const { props, foundation } = fixture();
  props.scrollbar = false;
  assert.deepEqual(foundation.getResolvedScrollbarProps(), { type: 'embed' });
  const marker = { opaque: true };
  props.scrollbar = {
    type: 'track',
    outerStyle: marker,
    paddingAbsolute: false,
    overlayOptions: {
      paddingAbsolute: true,
      overflow: { x: 'hidden' },
      scrollbars: { visibility: 'hidden' },
    },
    overflow: { y: 'hidden' },
    scrollbars: { autoHide: 'scroll' },
  };
  assert.equal(foundation.getResolvedScrollbarProps().outerStyle, marker);
  const options = foundation.getResolvedOverlayOptions();
  assert.equal(options.paddingAbsolute, false);
  assert.deepEqual(options.overflow, { x: 'hidden', y: 'hidden' });
  assert.equal(options.scrollbars?.theme, 'sd-scrollbar-theme-track');
  assert.equal(options.scrollbars?.visibility, 'hidden');
  assert.equal(options.scrollbars?.autoHide, 'scroll');
});
test('VirtualList delegates opaque cache and numeric queries with the original method receivers', () => {
  const { env, engine, cache, foundation, calls } = fixture();
  env.virtualizer = engine;
  assert.equal(foundation.cacheSnapshot(), cache);
  assert.equal(foundation.findItemIndex(10), 0);
  assert.equal(foundation.getItemOffset(1), 12);
  assert.equal(foundation.getDynamicItemSize({}, undefined), 0);
  assert.equal(foundation.getDynamicItemSize({}, 2), 30);
  foundation.scrollToBottom();
  assert.deepEqual(calls, [
    ['find', 10],
    ['offset', 1],
    ['size', 2],
    ['position', 999],
  ]);
});
test('VirtualList key lookup retains zero/empty keys, index precedence and live key callback reads', () => {
  const { props, env, engine, foundation, calls } = fixture();
  env.virtualizer = engine;
  props.items = [{ key: 0 }, { key: '' }, { key: null }];
  foundation.scrollTo({ key: 0, align: 'bottom', smooth: false, offset: 0 });
  foundation.scrollTo({ key: '', align: 'top' });
  foundation.scrollTo({ index: 2, key: 0, align: 'auto' });
  assert.deepEqual(calls, [
    ['index', 0, { align: 'end', smooth: false, offset: 0 }],
    ['index', 1, { align: 'start', smooth: undefined, offset: undefined }],
    ['index', 2, { align: 'nearest', smooth: undefined, offset: undefined }],
  ]);
  calls.length = 0;
  props.keyField = () => {
    props.keyField = (_item, index) => (index === 1 ? 'live' : 'other');
    return 'first';
  };
  foundation.scrollTo({ key: 'live' });
  assert.equal(calls[0]?.[1], 1);
});
test('VirtualList unknown keys and negative object indices are ignored while direct commands stay unguarded', () => {
  const { props, env, engine, foundation, calls } = fixture();
  env.virtualizer = engine;
  props.items = [{ key: 1 }];
  foundation.scrollTo({ key: 'missing' });
  foundation.scrollTo({ index: -1 });
  assert.equal(calls.length, 0);
  foundation.scrollToItem(-1);
  assert.deepEqual(calls, [
    ['index', -1, { align: 'nearest', smooth: undefined, offset: undefined }],
  ]);
});
test('VirtualList numeric and smooth pixel scrolling use the selected native axis', () => {
  const { props, env, foundation } = fixture();
  const calls: unknown[] = [];
  const viewport = {
    scrollTop: 0,
    scrollLeft: 0,
    scrollTo(options: unknown) {
      calls.push(options);
    },
  };
  env.viewport = viewport as unknown as HTMLElement;
  foundation.scrollTo(40);
  assert.equal(viewport.scrollTop, 40);
  props.direction = 'horizontal';
  foundation.scrollToPosition(80);
  assert.equal(viewport.scrollLeft, 80);
  foundation.scrollToPosition(100, { smooth: true });
  assert.deepEqual(calls, [{ left: 100, behavior: 'smooth' }]);
});
test('VirtualList scroll notification precedes axis reading and retains floor-based bottom threshold', () => {
  const { foundation, props, events } = fixture();
  const target = {
    scrollHeight: 100,
    clientHeight: 10,
    scrollTop: 89.1,
    scrollWidth: 200,
    clientWidth: 20,
    scrollLeft: 0,
  };
  const event = { target } as unknown as Event;
  foundation.onScroll(event);
  assert.deepEqual(events, [
    ['scroll', event],
    ['bottom', event],
  ]);
  events.length = 0;
  props.direction = 'horizontal';
  foundation.onScroll(event);
  assert.deepEqual(events, [['scroll', event]]);
});
test('VirtualList scroll end emits first and falls back from a destroyed SDK instance to viewport', () => {
  const { foundation, state, env, events } = fixture();
  env.viewport = { scrollHeight: 100, clientHeight: 10, scrollTop: 90 } as HTMLElement;
  state.instance = { state: () => ({ destroyed: true }) } as unknown as OverlayScrollbars;
  foundation.onVirtuaScrollEnd();
  assert.equal(events[0]?.[0], 'end');
  assert.equal(events[1]?.[0], 'bottom');
  assert.equal(events.length, 2);
  assert.equal((events[1]![1] as Event).type, 'scroll');
  assert.equal((events[1]![1] as Event).target, null);
});
test('VirtualList overlay destruction resets readiness before calling the native receiver', () => {
  const { foundation, state } = fixture();
  let destroyed = 0;
  const instance = {
    destroy() {
      assert.equal(this, instance);
      assert.equal(state.overlayReady, false);
      destroyed++;
    },
  };
  state.overlayReady = true;
  state.instance = instance as unknown as OverlayScrollbars;
  foundation.destroyOverlayScrollbar();
  assert.equal(state.instance, null);
  assert.equal(destroyed, 1);
});
test('VirtualList overlay updates read current options and instance after injected render completion', async () => {
  const { foundation, state, props, renders } = fixture();
  const calls: unknown[][] = [];
  const instance = {
    state: () => ({ destroyed: false }),
    options(value: unknown) {
      calls.push(['options', value]);
    },
    update(value: boolean) {
      calls.push(['update', value]);
    },
  };
  const pending = foundation.syncOverlayOptions();
  props.scrollbar = { type: 'track' };
  state.instance = instance as unknown as OverlayScrollbars;
  assert.equal(calls.length, 0);
  renders.shift()!();
  await pending;
  assert.ok(calls[0]);
  assert.equal(
    (calls[0][1] as { scrollbars: { theme: string } }).scrollbars.theme,
    'sd-scrollbar-theme-track',
  );
  assert.deepEqual(calls[1], ['update', true]);
  const next = foundation.syncItems();
  state.instance = null;
  renders.shift()!();
  await next;
  assert.equal(calls.length, 2);
});
