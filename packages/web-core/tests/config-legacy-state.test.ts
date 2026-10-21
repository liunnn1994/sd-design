import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import test from 'node:test';

import { resolveLegacyMergedValue, syncLegacyMergedValue } from '../dist/state/legacy-merge.js';

test('legacy merge uses a fallback only for undefined and retains value identity', () => {
  for (const value of [false, 0, '', null, { key: 'value' }]) {
    assert.equal(
      resolveLegacyMergedValue({
        value,
        get fallback(): typeof value {
          throw new Error('Fallback must remain unread');
        },
      }),
      value,
    );
  }
  const fallback = {};
  assert.equal(resolveLegacyMergedValue({ value: undefined, fallback }), fallback);
});

test('legacy merge preserves two provided reads and one undefined read before fallback', () => {
  const reads: string[] = [];
  assert.equal(
    resolveLegacyMergedValue({
      get value() {
        reads.push('value');
        return 'held';
      },
      get fallback() {
        reads.push('fallback');
        return 'default';
      },
    }),
    'held',
  );
  assert.deepEqual(reads, ['value', 'value']);
  reads.length = 0;
  assert.equal(
    resolveLegacyMergedValue({
      get value() {
        reads.push('value');
        return undefined;
      },
      get fallback() {
        reads.push('fallback');
        return 'default';
      },
    }),
    'default',
  );
  assert.deepEqual(reads, ['value', 'fallback']);
});

test('legacy merge synchronization clears only on undefined, including repeated undefined', () => {
  let clears = 0;
  for (const value of [false, 0, '', null, {}, undefined, undefined])
    syncLegacyMergedValue(value, () => {
      clears++;
    });
  assert.equal(clears, 2);
});

test('legacy merge release clears a pending local request instead of restoring defaults', () => {
  const state: { value: string | undefined; fallback: string | undefined } = {
    value: 'held',
    fallback: 'pending',
  };
  assert.equal(resolveLegacyMergedValue(state), 'held');
  state.value = undefined;
  syncLegacyMergedValue(state.value, () => {
    state.fallback = undefined;
  });
  assert.equal(resolveLegacyMergedValue(state), undefined);
  state.fallback = 'later';
  assert.equal(resolveLegacyMergedValue(state), 'later');
});

test('legacy merge preserves getter and clear exceptions', () => {
  const error = new Error('original');
  assert.throws(
    () =>
      resolveLegacyMergedValue({
        get value(): undefined {
          throw error;
        },
        get fallback(): undefined {
          throw new Error('Wrong fallback');
        },
      }),
    (candidate) => candidate === error,
  );
  assert.throws(
    () =>
      syncLegacyMergedValue(undefined, () => {
        throw error;
      }),
    (candidate) => candidate === error,
  );
});

const descriptors = Object.fromEntries(
  ['window', 'document'].map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]),
);
Object.defineProperty(globalThis, 'window', { value: {}, configurable: true });
Object.defineProperty(globalThis, 'document', { value: {}, configurable: true });
const { resolvePopupContainer } = await import('../dist/trigger/popup-container.js');
for (const [key, descriptor] of Object.entries(descriptors)) {
  if (descriptor) Object.defineProperty(globalThis, key, descriptor);
  else Reflect.deleteProperty(globalThis, key);
}
function withQuery(
  t: { after(callback: () => void): void },
  query: (selector: string) => HTMLElement | null,
) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', {
    value: { querySelector: query },
    configurable: true,
  });
  t.after(() => {
    if (descriptor) Object.defineProperty(globalThis, 'document', descriptor);
    else Reflect.deleteProperty(globalThis, 'document');
  });
}

test('legacy popup passes raw selectors through without escaping or target normalization', (t) => {
  const target = { id: 'target' } as unknown as HTMLElement;
  withQuery(t, (selector) => {
    assert.equal(selector, '#raw:id');
    return target;
  });
  let reads = 0;
  assert.equal(
    resolvePopupContainer({
      get popupContainer() {
        reads++;
        return '#raw:id';
      },
      get defaultContainer(): undefined {
        throw new Error('Fallback must remain unread');
      },
    }),
    target,
  );
  assert.equal(reads, 2);
});

test('legacy popup direct elements bypass query and fallback', (t) => {
  const target = { id: 'direct' } as unknown as HTMLElement;
  withQuery(t, () => {
    throw new Error('Query must remain unread');
  });
  assert.equal(
    resolvePopupContainer({
      popupContainer: target,
      get defaultContainer(): undefined {
        throw new Error('Fallback must remain unread');
      },
    }),
    target,
  );
});

test('legacy popup missing selectors and undefined use their exact fallback', (t) => {
  const fallback = { id: 'fallback' } as unknown as HTMLElement;
  const selectors: string[] = [];
  withQuery(t, (selector) => {
    selectors.push(selector);
    return null;
  });
  assert.equal(
    resolvePopupContainer({ popupContainer: '#missing', defaultContainer: fallback }),
    fallback,
  );
  assert.equal(
    resolvePopupContainer({ popupContainer: undefined, defaultContainer: fallback }),
    fallback,
  );
  assert.deepEqual(selectors, ['#missing']);
});

test('legacy popup selector errors propagate without fallback', (t) => {
  const error = new Error('invalid selector');
  withQuery(t, () => {
    throw error;
  });
  assert.throws(
    () =>
      resolvePopupContainer({
        popupContainer: '[',
        get defaultContainer(): undefined {
          throw new Error('Wrong fallback');
        },
      }),
    (candidate) => candidate === error,
  );
});

test('legacy popup selector fallback is inert in a fresh server process', () => {
  const entry = new URL('../dist/trigger/popup-container.js', import.meta.url).href;
  const code = `import assert from 'node:assert/strict';import{resolvePopupContainer}from ${JSON.stringify(entry)};const fallback={id:'ssr'};assert.equal(typeof globalThis.document,'undefined');assert.equal(resolvePopupContainer({popupContainer:'#missing',defaultContainer:fallback}),fallback);`;
  execFileSync(process.execPath, ['--input-type=module', '-e', code], { stdio: 'pipe' });
});
