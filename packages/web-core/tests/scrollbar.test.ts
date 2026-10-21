import type {
  OverlayScrollbars,
  OverlayScrollbars as OSInstance,
  EventListeners,
} from 'overlayscrollbars';

import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { ScrollbarProps } from '../src/scrollbar/types.ts';

import { createScrollbar } from '../dist/scrollbar/foundation.js';
import {
  getScrollbarOptions,
  normalizeScrollbarStyle,
  normalizeUpdateOptions,
  parseComputedPx,
} from '../dist/scrollbar/options.js';

const props = () =>
  ({
    type: 'embed' as const,
    hide: false,
    disableHorizontal: false,
    disableVertical: false,
  }) as ScrollbarProps & { hide: boolean; disableHorizontal: boolean; disableVertical: boolean };

function fixture() {
  const values = props();
  const calls: unknown[][] = [];
  let destroyed = false;
  let currentOptions: unknown = {};
  let initListeners: EventListeners = {};
  const viewport = {
    scrollTop: 9,
    scrollLeft: 7,
    scrollHeight: 200,
    scrollWidth: 300,
    scrollTo(...args: unknown[]) {
      calls.push(['scrollTo', ...args]);
    },
  };
  const elementRefs = { scrollOffsetElement: viewport };
  const native = {
    options(...args: unknown[]) {
      if (args.length) {
        calls.push(['options', ...args]);
        currentOptions = args[0];
      }
      return currentOptions;
    },
    state: () => ({ destroyed }),
    elements: () => elementRefs,
    on(...args: unknown[]) {
      calls.push(['on', ...args]);
      return () => {
        calls.push(['unsubscribe', args[0]]);
      };
    },
    off(...args: unknown[]) {
      calls.push(['off', ...args]);
    },
    update: (force?: boolean) => {
      calls.push(['update', force]);
      return true;
    },
    sleep: (value: boolean) => {
      calls.push(['sleep', value]);
    },
    plugin: (value: unknown) => ({ value }),
    destroy: () => {
      calls.push(['destroy']);
      destroyed = true;
    },
  };
  const adapter = {
    props: values,
    outer: {} as HTMLElement | undefined,
    container: { scrollHeight: 200, scrollWidth: 300 } as HTMLElement | undefined,
    get normalizedStyle() {
      return normalizeScrollbarStyle(this.props.outerStyle);
    },
    get mergedOptions() {
      return getScrollbarOptions(this.props, 'sd-scrollbar');
    },
    instance: null as OSInstance | null,
    removeListeners: null as (() => void) | null,
    autoSizeStyle: {} as Record<string, string>,
    readComputedStyle: () => ({ maxHeight: '80px', maxWidth: '100px' }),
    scroll: (event: Event) => {
      calls.push(['vue-scroll', event]);
    },
    createInstance: ((target: HTMLElement, options: unknown, listeners: EventListeners) => {
      calls.push(['create', target, options]);
      currentOptions = options;
      initListeners = listeners;
      const callback = listeners.initialized;
      if (typeof callback === 'function') callback(native as unknown as OSInstance);
      return native;
    }) as unknown as typeof OverlayScrollbars,
  };
  const controller = createScrollbar(adapter);
  return {
    values,
    calls,
    viewport,
    native,
    adapter,
    controller,
    get initListeners() {
      return initListeners;
    },
  };
}

test('scrollbar options keep component precedence, private axis guards and user scrollbar overrides', () => {
  const value = props();
  value.type = 'track';
  value.hide = true;
  value.disableHorizontal = true;
  value.overlayOptions = {
    paddingAbsolute: true,
    overflow: { x: 'visible', y: 'hidden' },
    scrollbars: { visibility: 'visible', autoHide: 'move' },
  };
  value.paddingAbsolute = false;
  value.overflow = { y: 'scroll' };
  value.scrollbars = { theme: 'custom', clickScroll: false };
  const result = getScrollbarOptions(value, 'custom-prefix');
  assert.equal(result.paddingAbsolute, false);
  assert.deepEqual(result.overflow, { x: 'hidden', y: 'scroll' });
  assert.deepEqual(result.scrollbars, {
    theme: 'custom',
    visibility: 'visible',
    autoHide: 'move',
    autoHideSuspend: false,
    clickScroll: false,
  });
});

test('scrollbar default visibility and theme follow embed/track and hide', () => {
  const value = props();
  assert.equal(getScrollbarOptions(value, 'sd').scrollbars.autoHide, 'leave');
  value.type = 'track';
  assert.equal(getScrollbarOptions(value, 'sd').scrollbars.theme, 'sd-theme-track');
  assert.equal(getScrollbarOptions(value, 'sd').scrollbars.visibility, 'visible');
  value.hide = true;
  assert.equal(getScrollbarOptions(value, 'sd').scrollbars.visibility, 'hidden');
  assert.equal(getScrollbarOptions(value, 'sd').scrollbars.autoHide, 'never');
});

test('scrollbar update debounce fills only object channels and preserves scalar or tuple identity', () => {
  assert.deepEqual(normalizeUpdateOptions({ debounce: { resize: 4, mutation: false } }), {
    debounce: { mutation: false, resize: 4, event: 0, env: 0 },
  });
  const values: Exclude<NonNullable<ScrollbarProps['updateOptions']>['debounce'], undefined>[] = [
    0,
    false,
    null,
    [10, 20],
  ];
  for (const debounce of values) {
    const value = { debounce };
    assert.equal(normalizeUpdateOptions(value), value);
  }
  assert.equal(parseComputedPx('none'), null);
  assert.equal(parseComputedPx('auto'), null);
  assert.equal(parseComputedPx('32.5px'), 32.5);
});

test('scrollbar style normalization keeps nested object order and ignores string/falsy styles', () => {
  assert.deepEqual(
    normalizeScrollbarStyle([
      { height: '20px' },
      ['max-height:90px', false, { height: '40px', maxWidth: 100 }],
      null,
    ]),
    { height: '40px', maxWidth: 100 },
  );
  assert.deepEqual(normalizeScrollbarStyle('height:20px'), {});
  assert.deepEqual(normalizeScrollbarStyle(undefined), {});
});

test('scrollbar mount invokes initialized before assigning the host instance and forwards native scroll identity', () => {
  const f = fixture();
  const initialized: unknown[] = [];
  f.values.events = {
    initialized: [
      (instance) => {
        initialized.push(instance, f.controller.getOSInstance());
      },
    ],
  };
  f.controller.mount();
  assert.deepEqual(initialized, [f.native, null]);
  assert.equal(f.controller.getOSInstance(), f.native);
  const event = new Event('scroll');
  const callback = f.initListeners.scroll;
  if (typeof callback === 'function') callback(f.native as unknown as OSInstance, event);
  assert.deepEqual(f.calls.at(-1), ['vue-scroll', event]);
});

test('scrollbar instance ports preserve a host proxy rather than capturing a separate raw SDK object', () => {
  const f = fixture();
  let host: OSInstance | null = null;
  const proxy = new Proxy(f.native, {});
  Object.defineProperty(f.adapter, 'instance', {
    get: () => host,
    set: (value) => {
      host = value === null ? null : (proxy as unknown as OSInstance);
    },
  });
  f.controller.mount();
  assert.equal(f.controller.getOSInstance(), proxy);
  assert.notEqual(f.controller.getOSInstance(), f.native);
});

test('scrollbar automatic sizes clamp only implicit max constraints and always update the live SDK', () => {
  const f = fixture();
  f.values.outerStyle = { maxHeight: 80, maxWidth: 100 };
  f.controller.mount();
  assert.deepEqual(f.adapter.autoSizeStyle, { height: '80px', width: '100px' });
  assert.deepEqual(f.calls.at(-1), ['update', true]);
  f.values.outerStyle = {
    maxHeight: 80,
    height: undefined,
    maxInlineSize: 100,
    inlineSize: '50px',
  };
  f.controller.updateAutoSizeStyle();
  assert.deepEqual(f.adapter.autoSizeStyle, {});
  f.adapter.outer = undefined;
  f.controller.updateAutoSizeStyle();
  assert.deepEqual(f.adapter.autoSizeStyle, {});
});

test('scrollbar external listeners unsubscribe before replacement and before unmount destroy', () => {
  const f = fixture();
  const first = { scroll: () => {} },
    second = { updated: () => {} };
  f.values.events = first;
  f.controller.mount();
  f.calls.length = 0;
  f.controller.bindExternalListeners(second);
  assert.deepEqual(f.calls, [
    ['unsubscribe', first],
    ['on', second],
  ]);
  f.calls.length = 0;
  f.controller.dispose();
  assert.deepEqual(f.calls, [['unsubscribe', second], ['destroy']]);
  assert.equal(f.adapter.instance, null);
});

test('scrollbar options, event overloads and plugin methods forward their original arguments', () => {
  const f = fixture();
  f.controller.mount();
  f.calls.length = 0;
  const options = { scrollbars: { autoHide: 'never' as const } };
  assert.equal(f.controller.options(options, true), options);
  assert.equal(f.controller.options(), options);
  const listener = () => {},
    listeners = [listener],
    map = { scroll: listener };
  f.controller.on(map, true);
  f.controller.on('scroll', listener);
  f.controller.on('scroll', listeners);
  f.controller.off('scroll', listeners);
  assert.deepEqual(f.calls, [
    ['options', options, true],
    ['on', map, true],
    ['on', 'scroll', listener],
    ['on', 'scroll', listeners],
    ['off', 'scroll', listeners],
  ]);
  const plugin = {} as Parameters<typeof f.controller.plugin>[0];
  assert.deepEqual(f.controller.plugin(plugin), { value: plugin });
  assert.equal(f.controller.elements(), f.native.elements());
  assert.equal(f.controller.state()?.destroyed, false);
  f.calls.length = 0;
  f.controller.sleep(true);
  assert.equal(f.controller.update(true), true);
  assert.deepEqual(f.calls, [
    ['sleep', true],
    ['update', true],
  ]);
});

test('scrollbar native scroll methods preserve missing axes and object identity', () => {
  const f = fixture();
  f.controller.mount();
  f.calls.length = 0;
  const target = { top: 0, left: 4 };
  f.controller.scrollTo(target);
  f.controller.scrollTo(undefined, 10);
  f.controller.scrollTo(0);
  f.controller.scrollTop(5);
  f.controller.scrollLeft(6);
  f.controller.scrollTo();
  assert.deepEqual(f.calls, [
    ['scrollTo', target],
    ['scrollTo', 7, 10],
    ['scrollTo', 0, 9],
    ['scrollTo', { top: 5 }],
    ['scrollTo', { left: 6 }],
  ]);
  assert.equal(f.calls[0][1], target);
});

test('scrollbar fallback scrolling writes only provided coordinates', () => {
  const f = fixture();
  Reflect.deleteProperty(f.viewport, 'scrollTo');
  f.controller.mount();
  f.controller.scrollTo({ top: 0 });
  assert.deepEqual([f.viewport.scrollLeft, f.viewport.scrollTop], [7, 0]);
  f.controller.scrollTo(4, 5);
  assert.deepEqual([f.viewport.scrollLeft, f.viewport.scrollTop], [4, 5]);
  f.controller.scrollTop(6);
  f.controller.scrollLeft(8);
  assert.deepEqual([f.viewport.scrollLeft, f.viewport.scrollTop], [8, 6]);
});

test('scrollbar public methods become inert after native destruction without recreation', () => {
  const f = fixture();
  f.controller.mount();
  f.controller.destroy();
  f.calls.length = 0;
  assert.equal(f.controller.getOSInstance(), null);
  assert.equal(f.controller.update(true), false);
  assert.equal(f.controller.state(), undefined);
  assert.equal(f.controller.elements(), undefined);
  assert.equal(f.controller.options(), undefined);
  f.controller.sleep(true);
  f.controller.scrollTop(90);
  f.controller.on('scroll', () => {});
  f.controller.destroy();
  assert.deepEqual(f.calls, []);
});
