import assert from 'node:assert/strict';
import { test, type TestContext } from 'node:test';

import type { ScreenMap, SiderBreakpoint } from '../dist/_utils/responsive-observe.js';

import observer, { responsiveArray, responsiveMap } from '../dist/_utils/responsive-observe.js';

function browser(t: TestContext) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const queries = new Map<
    string,
    { matches: boolean; handlers: Set<(e: { matches: boolean }) => void> }
  >();
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      matchMedia(query: string) {
        const state = { matches: false, handlers: new Set<(e: { matches: boolean }) => void>() };
        queries.set(query, state);
        return {
          get matches() {
            return state.matches;
          },
          addEventListener(event: string, handler: (e: { matches: boolean }) => void) {
            assert.equal(event, 'change');
            state.handlers.add(handler);
          },
          removeEventListener(event: string, handler: (e: { matches: boolean }) => void) {
            assert.equal(event, 'change');
            state.handlers.delete(handler);
          },
        };
      },
    },
  });
  t.after(() => {
    observer.unregister();
    if (previous) Object.defineProperty(globalThis, 'window', previous);
    else Reflect.deleteProperty(globalThis, 'window');
  });
  return {
    queries,
    change(key: SiderBreakpoint, matches: boolean) {
      const state = queries.get(responsiveMap[key]!)!;
      state.matches = matches;
      for (const handler of state.handlers) handler({ matches });
    },
  };
}

test('responsive module imports without a browser and preserves breakpoint ordering', () => {
  assert.equal(typeof globalThis.window, 'undefined');
  assert.deepEqual(responsiveArray, ['xxl', 'xl', 'lg', 'md', 'sm', 'xs']);
  assert.equal(responsiveMap.xxxl, '(min-width: 1840px)');
  assert.equal(observer.dispatch({ xs: true }, 'xs'), false);
});

test('responsive first subscriber registers all queries and receives one complete initial snapshot', (t) => {
  const { queries } = browser(t),
    seen: [ScreenMap, SiderBreakpoint | null][] = [];
  const token = observer.subscribe((screens, key) => {
    seen.push([screens, key]);
  });
  assert.equal(queries.size, 7);
  assert.equal(seen.length, 1);
  assert.equal(seen[0][1], null);
  assert.deepEqual(Object.keys(seen[0][0]), ['xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl']);
  observer.unsubscribe(token);
  assert.ok([...queries.values()].every((query) => query.handlers.size === 0));
});

test('responsive subscribers share current maps and media changes carry the matching breakpoint', (t) => {
  const { change } = browser(t);
  let first: ScreenMap = {},
    second: ScreenMap = {};
  const keys: (SiderBreakpoint | null)[] = [];
  const a = observer.subscribe((screens, key) => {
    first = screens;
    keys.push(key);
  });
  const b = observer.subscribe((screens) => {
    second = screens;
  });
  assert.equal(first, second);
  change('md', true);
  assert.equal(first, second);
  assert.equal(first.md, true);
  assert.equal(keys.at(-1), 'md');
  observer.unsubscribe(a);
  observer.unsubscribe(b);
});

test('responsive removes native listeners only after the last subscriber and keeps unique tokens', (t) => {
  const { queries } = browser(t);
  const a = observer.subscribe(() => {}),
    b = observer.subscribe(() => {});
  assert.notEqual(a, b);
  observer.unsubscribe(a);
  assert.ok([...queries.values()].every((query) => query.handlers.size === 1));
  observer.unsubscribe(b);
  assert.ok([...queries.values()].every((query) => query.handlers.size === 0));
  const c = observer.subscribe(() => {});
  assert.notEqual(c, a);
  assert.notEqual(c, b);
  observer.unsubscribe(c);
});

test('responsive manual dispatch preserves the supplied map identity and subscribed state', (t) => {
  browser(t);
  let seen: ScreenMap | undefined;
  const token = observer.subscribe((screens) => {
    seen = screens;
  });
  const next = { lg: true };
  assert.equal(observer.dispatch(next, 'lg'), true);
  assert.equal(seen, next);
  observer.unsubscribe(token);
  assert.equal(observer.dispatch({}, 'xs'), false);
});
