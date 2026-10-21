import assert from 'node:assert/strict';
import { test } from 'node:test';

import observer from '../dist/_utils/responsive-observe.js';
import {
  createResponsiveSubscription,
  getScreenSnapshot,
  resolveResponsiveState,
  resolveResponsiveValue,
} from '../dist/_utils/responsive.js';

test('responsive snapshot preserves server fallback and reads all browser queries', (t) => {
  assert.deepEqual(getScreenSnapshot(), {
    xs: true,
    sm: true,
    md: true,
    lg: true,
    xl: true,
    xxl: true,
  });
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const queries: string[] = [];
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      matchMedia(query: string) {
        queries.push(query);
        return { matches: query === '(min-width: 768px)' };
      },
    },
  });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, 'window', previous);
    else Reflect.deleteProperty(globalThis, 'window');
  });
  assert.deepEqual(getScreenSnapshot(), {
    xs: false,
    sm: false,
    md: true,
    lg: false,
    xl: false,
    xxl: false,
    xxxl: false,
  });
  assert.equal(queries.length, 7);
});

test('responsive state selects the largest matching configured breakpoint, including zero', () => {
  const state = { value: { xs: 2, md: 0, xl: 8 }, screens: { xs: true, md: true, lg: true } };
  assert.equal(resolveResponsiveState(state, 12), 0);
  assert.equal(resolveResponsiveState({ value: { xl: 8 }, screens: {} }, 12), 12);
  assert.equal(resolveResponsiveState({ value: { xs: 2 }, screens: {} }, 12, true), 2);
  assert.equal(
    resolveResponsiveState(
      {
        value: 0,
        get screens(): never {
          throw new Error('numeric values must not subscribe to screen reads');
        },
      },
      12,
    ),
    0,
  );
});

test('responsive values distinguish missing config, zero and config fields', () => {
  assert.equal(resolveResponsiveValue({ val: 12, key: 'span' }), 12);
  assert.deepEqual(
    resolveResponsiveValue({ val: 12, key: 'span', xs: 0, md: { span: 8 }, lg: { offset: 2 } }),
    { md: 8, xs: 0 },
  );
  assert.deepEqual(
    resolveResponsiveValue({ val: 12, key: 'offset', xs: { offset: 0 }, md: { span: 8 } }),
    { xs: 0 },
  );
});

test('responsive subscription tracks disabled snapshots and refreshes changed breakpoints', (t) => {
  const originalSubscribe = observer.subscribe;
  const originalUnsubscribe = observer.unsubscribe;
  let notify!: Parameters<typeof observer.subscribe>[0];
  const removed: string[] = [];
  observer.subscribe = (callback) => {
    notify = callback;
    callback({ md: true }, null as never);
    return 'test-token';
  };
  observer.unsubscribe = (token) => {
    removed.push(token);
  };
  t.after(() => {
    observer.subscribe = originalSubscribe;
    observer.unsubscribe = originalUnsubscribe;
  });
  const state: { breakpoint: 'md' | 'lg' | undefined } = { breakpoint: undefined };
  const seen: boolean[] = [];
  const subscription = createResponsiveSubscription(state, (value) => seen.push(value));
  subscription.refresh('md');
  subscription.mount();
  assert.deepEqual(seen, []);
  notify({ md: true, lg: false }, 'md');
  state.breakpoint = 'md';
  subscription.refresh('md');
  assert.deepEqual(seen, [true]);
  notify({ md: false, lg: true }, 'lg');
  assert.deepEqual(seen, [true]);
  state.breakpoint = 'lg';
  subscription.refresh('lg');
  notify({ lg: false }, 'lg');
  assert.deepEqual(seen, [true, true, false]);
  subscription.dispose();
  assert.deepEqual(removed, ['test-token']);
});
