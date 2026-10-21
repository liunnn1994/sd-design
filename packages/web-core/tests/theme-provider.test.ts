import assert from 'node:assert/strict';
import { test, type TestContext } from 'node:test';

import { applyGlobalTheme, releaseGlobalTheme } from '../dist/config-provider/global-theme.js';
import {
  createThemeProviderFoundation,
  getThemeProviderEffectiveMode,
  hasThemeProviderContainer,
  normalizeThemeProviderTheme,
  type ThemeProviderFoundationState,
} from '../dist/config-provider/provider.js';
import { normalizeTheme } from '../dist/config-provider/theme.js';

class Target {
  attributes = new Map<string, string>();
  writes = 0;
  className = '';
  children: Target[] = [];
  parentElement: Target | null = null;
  parentNode: Target | null = null;
  values = new Map<string, { value: string; priority: string }>();
  style = {
    zIndex: '',
    setProperty: (key: string, value: string, priority = '') => {
      this.values.set(key, { value, priority });
    },
    removeProperty: (key: string) => {
      const old = this.values.get(key)?.value ?? '';
      this.values.delete(key);
      return old;
    },
    getPropertyValue: (key: string) => this.values.get(key)?.value ?? '',
    getPropertyPriority: (key: string) => this.values.get(key)?.priority ?? '',
  };
  getAttribute(key: string) {
    return this.attributes.get(key) ?? null;
  }
  hasAttribute(key: string) {
    return this.attributes.has(key);
  }
  setAttribute(key: string, value: string) {
    this.writes++;
    this.attributes.set(key, value);
  }
  removeAttribute(key: string) {
    this.writes++;
    this.attributes.delete(key);
  }
  appendChild(child: Target) {
    this.children.push(child);
    child.parentNode = this;
    child.parentElement = this;
    return child;
  }
  removeChild(child: Target) {
    this.children.splice(this.children.indexOf(child), 1);
    child.parentNode = null;
    child.parentElement = null;
    return child;
  }
  closest(selector: string): Target | null {
    let target: Target | null = this;
    while (target) {
      if (
        target.hasAttribute('sd-theme') ||
        (selector.includes('data-sd-theme') && target.hasAttribute('data-sd-theme'))
      )
        return target;
      target = target.parentElement;
    }
    return null;
  }
  get element() {
    return this as unknown as HTMLElement;
  }
}
function globalValue(t: TestContext, key: string, value: unknown) {
  const old = Object.getOwnPropertyDescriptor(globalThis, key);
  Object.defineProperty(globalThis, key, { configurable: true, value });
  t.after(() => {
    if (old) Object.defineProperty(globalThis, key, old);
    else Reflect.deleteProperty(globalThis, key);
  });
}
function fixture(t: TestContext) {
  const body = new Target(),
    root = body.appendChild(new Target()),
    observers: Observer[] = [];
  class Observer {
    target: Element | undefined;
    options: MutationObserverInit | undefined;
    disconnected = false;
    readonly callback: () => void;
    constructor(callback: () => void) {
      this.callback = callback;
      observers.push(this);
    }
    observe(target: Element, options: MutationObserverInit) {
      this.target = target;
      this.options = options;
    }
    disconnect() {
      this.disconnected = true;
    }
  }
  globalValue(t, 'document', { body, documentElement: body, createElement: () => new Target() });
  globalValue(t, 'MutationObserver', Observer);
  const state: {
    -readonly [Key in keyof ThemeProviderFoundationState]: ThemeProviderFoundationState[Key];
  } = {
    global: false,
    rootElement: root.element,
    effectiveMode: undefined,
    normalizedTheme: normalizeTheme({ tokens: { primary6: '1,2,3' } }),
    popupVariables: { '--primary-6': '1,2,3' },
    popupMode: undefined,
    usesLocalThemeContainer: true,
    popupContainerClass: 'native-popup',
    zIndex: 1042,
    popupContainer: null,
    inheritedMode: undefined,
  };
  return { body, root, state, observers, controller: createThemeProviderFoundation(state) };
}

test('effective mode short-circuits explicit modes and compact alone stays inherited', () => {
  assert.equal(
    getThemeProviderEffectiveMode({
      themeMode: 'light',
      get theme() {
        throw Error('theme read');
      },
    }),
    'light',
  );
  assert.equal(getThemeProviderEffectiveMode({ theme: { algorithm: ['compact'] } }), undefined);
  assert.equal(
    getThemeProviderEffectiveMode({ theme: { algorithm: ['compact', 'dark'] } }),
    'dark',
  );
});
test('normalization preserves lazy absent-theme mode and lets inherited darkness replace algorithm darkness', () => {
  assert.deepEqual(
    normalizeThemeProviderTheme(undefined, () => {
      throw Error('mode read');
    }),
    normalizeTheme(),
  );
  const theme = {
    algorithm: ['compact', 'dark'] as ('compact' | 'dark')[],
    tokens: { primary6: '1,2,3' },
  };
  assert.deepEqual(
    normalizeThemeProviderTheme(theme, () => 'light'),
    normalizeTheme({ ...theme, algorithm: ['compact'] }),
  );
  assert.deepEqual(
    normalizeThemeProviderTheme(theme, () => 'dark'),
    normalizeTheme({ ...theme, algorithm: ['compact', 'dark'] }),
  );
  assert.deepEqual(theme.algorithm, ['compact', 'dark']);
});
test('container decision short-circuits global and explicit mode before normalized tokens', () => {
  assert.equal(
    hasThemeProviderContainer({
      global: true,
      get effectiveMode() {
        throw Error('mode');
      },
      get normalizedTheme() {
        throw Error('theme');
      },
    }),
    false,
  );
  assert.equal(
    hasThemeProviderContainer({
      global: false,
      effectiveMode: 'dark',
      get normalizedTheme() {
        throw Error('theme');
      },
    }),
    true,
  );
  for (const [theme, expected] of [
    [{}, false],
    [{ tokens: { primary6: 'red' } }, true],
    [{ components: { button: { height: 20 } } }, true],
  ] as const)
    assert.equal(
      hasThemeProviderContainer({
        global: false,
        effectiveMode: undefined,
        normalizedTheme: normalizeTheme(theme),
      }),
      expected,
    );
});
test('local target and body popup share variables, inherit mode and avoid unchanged attribute writes', (t) => {
  const { body, root, state, observers, controller } = fixture(t);
  body.setAttribute('sd-theme', 'dark');
  controller.syncThemeTarget();
  const popup = state.popupContainer as unknown as Target;
  assert.equal(state.inheritedMode, 'dark');
  assert.equal(popup.className, 'native-popup');
  assert.equal(popup.style.zIndex, '1042');
  assert.equal(root.style.getPropertyValue('--primary-6'), '1,2,3');
  assert.equal(popup.style.getPropertyValue('--primary-6'), '1,2,3');
  assert.equal(popup.getAttribute('sd-theme'), 'dark');
  const writes = [root.writes, popup.writes];
  controller.syncThemeTarget();
  assert.deepEqual([root.writes, popup.writes], writes);
  assert.equal(observers.length, 1);
  assert.deepEqual(observers[0].options, {
    attributes: true,
    attributeFilter: ['sd-theme', 'data-sd-theme'],
    subtree: true,
  });
  controller.syncPopupZIndex(2099);
  assert.equal(popup.style.zIndex, '2099');
  controller.dispose();
  assert.equal(state.popupContainer, null);
  assert.equal(body.children.includes(popup), false);
  assert.equal(root.getAttribute('data-sd-theme'), null);
  assert.equal(root.style.getPropertyValue('--primary-6'), '');
  assert.equal(observers[0].disconnected, true);
});
test('local variable replacement clears stale keys on both real target ports', (t) => {
  const { root, state, controller } = fixture(t);
  controller.syncThemeTarget();
  state.normalizedTheme = normalizeTheme({ tokens: { success6: '4,5,6' } });
  state.popupVariables = { '--success-6': '4,5,6' };
  state.effectiveMode = 'dark';
  state.popupMode = 'dark';
  controller.syncThemeTarget();
  const popup = state.popupContainer as unknown as Target;
  for (const target of [root, popup]) {
    assert.equal(target.style.getPropertyValue('--primary-6'), '');
    assert.equal(target.style.getPropertyValue('--success-6'), '4,5,6');
    assert.equal(target.getAttribute('sd-theme'), 'dark');
  }
  controller.dispose();
});
test('ancestor insertion rebinds native observation and follows data-sd-theme mode', (t) => {
  const { body, root, state, observers, controller } = fixture(t);
  controller.syncThemeTarget();
  const ancestor = body.appendChild(new Target());
  ancestor.setAttribute('data-sd-theme', 'dark');
  body.removeChild(root);
  ancestor.appendChild(root);
  observers[0].callback();
  assert.equal(state.inheritedMode, 'dark');
  assert.equal(observers.length, 2);
  assert.equal(observers[0].disconnected, true);
  assert.equal(observers[1].target, ancestor);
  controller.dispose();
});
test('switching local roots removes the old styles and reuses the single popup container', (t) => {
  const { body, root, state, controller } = fixture(t);
  controller.syncThemeTarget();
  const popup = state.popupContainer;
  const next = body.appendChild(new Target());
  state.rootElement = next.element;
  controller.syncThemeTarget();
  assert.equal(root.style.getPropertyValue('--primary-6'), '');
  assert.equal(next.style.getPropertyValue('--primary-6'), '1,2,3');
  assert.equal(state.popupContainer, popup);
  controller.dispose();
});
test('passthrough clears inherited state and observer, then can recreate a local container', (t) => {
  const { body, state, observers, controller } = fixture(t);
  body.setAttribute('sd-theme', 'dark');
  controller.syncThemeTarget();
  const old = state.popupContainer;
  state.usesLocalThemeContainer = false;
  controller.syncThemeTarget();
  assert.equal(state.inheritedMode, undefined);
  assert.equal(state.popupContainer, null);
  assert.equal(observers[0].disconnected, true);
  state.usesLocalThemeContainer = true;
  controller.syncThemeTarget();
  assert.notEqual(state.popupContainer, old);
  controller.dispose();
});
test('local/global switches preserve body baseline and release only their owned layer', (t) => {
  const { body, root, state, controller } = fixture(t);
  body.style.setProperty('--primary-6', 'baseline', 'important');
  body.setAttribute('sd-theme', 'light');
  controller.syncThemeTarget();
  state.global = true;
  state.effectiveMode = 'dark';
  state.popupMode = 'dark';
  controller.syncThemeTarget();
  assert.equal(root.style.getPropertyValue('--primary-6'), '');
  assert.equal(state.popupContainer, null);
  assert.equal(body.style.getPropertyValue('--primary-6'), '1,2,3');
  assert.equal(body.getAttribute('sd-theme'), 'dark');
  state.global = false;
  controller.syncThemeTarget();
  assert.equal(body.style.getPropertyValue('--primary-6'), 'baseline');
  assert.equal(body.style.getPropertyPriority('--primary-6'), 'important');
  assert.equal(body.getAttribute('sd-theme'), 'light');
  assert.ok(state.popupContainer);
  controller.dispose();
});
test('overlapping global owners retain mount order and restore original priority after final release', () => {
  const target = new Target(),
    first = Symbol(),
    second = Symbol();
  target.style.setProperty('--primary-6', 'base', 'important');
  target.setAttribute('sd-theme', 'light');
  applyGlobalTheme(
    target.element,
    first,
    normalizeTheme({ tokens: { primary6: 'first' } }),
    'dark',
  );
  applyGlobalTheme(
    target.element,
    second,
    normalizeTheme({ tokens: { primary6: 'second' } }),
    'light',
  );
  applyGlobalTheme(
    target.element,
    first,
    normalizeTheme({ tokens: { primary6: 'updated' } }),
    'dark',
  );
  assert.equal(target.style.getPropertyValue('--primary-6'), 'second');
  releaseGlobalTheme(target.element, second);
  assert.equal(target.style.getPropertyValue('--primary-6'), 'updated');
  assert.equal(target.getAttribute('sd-theme'), 'dark');
  releaseGlobalTheme(target.element, first);
  assert.equal(target.style.getPropertyValue('--primary-6'), 'base');
  assert.equal(target.style.getPropertyPriority('--primary-6'), 'important');
  assert.equal(target.getAttribute('sd-theme'), 'light');
  releaseGlobalTheme(target.element, first);
});
test('token-only global owners follow external mode changes and restore their original baseline', () => {
  const target = new Target(),
    owner = Symbol();
  target.setAttribute('sd-theme', 'light');
  applyGlobalTheme(target.element, owner, normalizeTheme({ tokens: { primary6: 'value' } }));
  target.setAttribute('sd-theme', 'dark');
  applyGlobalTheme(target.element, owner, normalizeTheme({ tokens: { success6: 'next' } }));
  assert.equal(target.getAttribute('sd-theme'), 'dark');
  assert.equal(target.style.getPropertyValue('--primary-6'), '');
  releaseGlobalTheme(target.element, owner);
  assert.equal(target.getAttribute('sd-theme'), 'light');
  assert.equal(target.style.getPropertyValue('--success-6'), '');
});
test('SSR factory, sync and disposal require no document or MutationObserver', (t) => {
  globalValue(t, 'document', undefined);
  globalValue(t, 'MutationObserver', undefined);
  const state: ThemeProviderFoundationState = {
    global: true,
    rootElement: null,
    effectiveMode: undefined,
    normalizedTheme: normalizeTheme(),
    popupVariables: {},
    popupMode: undefined,
    usesLocalThemeContainer: false,
    popupContainerClass: 'native',
    zIndex: 0,
    popupContainer: null,
    inheritedMode: 'dark',
  };
  const controller = createThemeProviderFoundation(state);
  controller.syncThemeTarget();
  controller.syncPopupZIndex(12);
  controller.dispose();
  assert.equal(state.inheritedMode, undefined);
});
