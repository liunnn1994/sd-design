import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getComponentPrefix, resolvePrefixCls, getCssVarToken } from '../dist/config/prefix.js';
import { createLocaleRegistry, createLocaleTranslator } from '../dist/locale/foundation.js';
import enUS from '../dist/locale/lang/en-us.js';
import { kvListEnUS } from '../dist/locale/lang/kv-list.js';
import zhCN from '../dist/locale/lang/zh-cn.js';

test('locale registry keeps dictionary identity and skips existing keys unless overwrite is enabled', () => {
  const first = { text: 'first' },
    second = { text: 'second' };
  const state = { messages: new Map([['zh-CN', first]]), locale: 'zh-CN' };
  const api = createLocaleRegistry(state, () => assert.fail('warn'));
  api.addI18nMessages({ 'zh-CN': second, 'other': second });
  assert.equal(state.messages.get('zh-CN'), first);
  assert.equal(state.messages.get('other'), second);
  api.addI18nMessages({ 'zh-CN': second }, { overwrite: true });
  assert.equal(state.messages.get('zh-CN'), second);
});

test('locale registry accepts prototype-like own keys and ignores inherited message entries', () => {
  const state = { messages: new Map<string, string>(), locale: 'zh-CN' };
  const api = createLocaleRegistry(state, () => assert.fail('warn'));
  const messages = Object.create({ inherited: 'no' });
  Object.defineProperty(messages, 'constructor', { value: 'ctor', enumerable: true });
  Object.defineProperty(messages, '__proto__', { value: 'proto', enumerable: true });
  api.addI18nMessages(messages);
  assert.equal(state.messages.has('inherited'), false);
  api.useLocale('__proto__');
  assert.equal(api.getLocale(), '__proto__');
  assert.equal(state.messages.get('constructor'), 'ctor');
});

test('unknown locale warns once with original text and retains current selection', () => {
  const events: string[] = [],
    state = { messages: new Map([['zh-CN', {}]]), locale: 'zh-CN' };
  const api = createLocaleRegistry(state, function (message) {
    assert.equal(this, undefined);
    events.push(message);
  });
  api.useLocale('missing');
  assert.equal(state.locale, 'zh-CN');
  assert.deepEqual(events, ['use missing failed! Please add missing first']);
});

test('registry construction is inert and message resolution short-circuits provider reads', () => {
  const state = {
    get messages(): Map<string, object> {
      throw Error('messages');
    },
    get locale(): string {
      throw Error('locale');
    },
    set locale(_value: string) {
      throw Error('locale write');
    },
  };
  const api = createLocaleRegistry(state, () => {}),
    provider = {};
  assert.equal(api.getMessage(provider), provider);
});

test('registry message resolution follows live selection and current default dictionary', () => {
  const fallback = {},
    chosen = {},
    replacement = {};
  const state = {
    messages: new Map([
      ['zh-CN', fallback],
      ['chosen', chosen],
    ]),
    locale: 'missing',
  };
  const api = createLocaleRegistry(state, () => {});
  assert.equal(api.getMessage(undefined), fallback);
  api.useLocale('chosen');
  assert.equal(api.getMessage(undefined), chosen);
  state.messages = new Map([['zh-CN', replacement]]);
  assert.equal(api.getMessage(undefined), replacement);
});

test('translator resolves nested objects, numeric array keys and sparse holes without coercing leaves', () => {
  const translate = createLocaleTranslator({
    message: { array: ['zero', 'one'], sparse: [, 'value'], object: { n: 3, b: false } },
    fallback: { sparse: ['fallback'], object: { n: 'number fallback' } },
  });
  assert.equal(translate('array.01'), 'one');
  assert.equal(translate('array.0'), 'zero');
  assert.equal(translate('sparse.0'), 'fallback');
  assert.equal(translate('object.n'), 'number fallback');
  assert.equal(translate('object.b'), 'object.b');
  assert.equal(translate('missing.key'), 'missing.key');
});

test('translator preserves empty strings and does not read fallback when a string is present', () => {
  const translate = createLocaleTranslator({
    message: { blank: '' },
    get fallback() {
      throw Error('fallback read');
    },
  });
  assert.equal(translate('blank'), '');
});

test('translator reads live message and fallback ports for every call', () => {
  const state = { message: { text: 'first' } as unknown, fallback: { text: 'fallback' } };
  const translate = createLocaleTranslator(state);
  assert.equal(translate('text'), 'first');
  state.message = undefined;
  assert.equal(translate('text'), 'fallback');
  state.fallback = { text: 'latest' };
  assert.equal(translate('text'), 'latest');
});

test('interpolation preserves zero, false, empty strings and unresolved/nullish placeholders', () => {
  const translate = createLocaleTranslator({
    message: { text: '{0}|{1}|{2}|{3}|{4}|{01}|{0}' },
    fallback: undefined,
  });
  assert.equal(translate('text', 0, false, '', null, undefined), '0|false||{3}|{4}|{01}|0');
  assert.equal(translate('text'), '{0}|{1}|{2}|{3}|{4}|{01}|{0}');
});

test('interpolation uses literal callback replacements and propagates argument conversion errors', () => {
  const error = Error('convert'),
    translate = createLocaleTranslator({ message: { text: '{0}' }, fallback: undefined });
  assert.equal(translate('text', '$&'), '$&');
  assert.throws(
    () =>
      translate('text', {
        toString() {
          throw error;
        },
      }),
    (value) => value === error,
  );
});

test('translator preserves inherited object traversal and terminal string requirement', () => {
  const translate = createLocaleTranslator({
    message: Object.create({ inherited: { text: 'native' } }),
    fallback: undefined,
  });
  assert.equal(translate('inherited.text'), 'native');
  assert.equal(translate('inherited'), 'inherited');
});

test('component prefix keeps nullish default and accepts empty custom strings', () => {
  assert.equal(getComponentPrefix(), 'Sd');
  assert.equal(getComponentPrefix({ componentPrefix: '' }), '');
  assert.equal(getComponentPrefix({ componentPrefix: 'Custom' }), 'Custom');
});

test('class prefix prioritizes provider, global, app and default including empty prefixes', () => {
  const state = {
    providerPrefix: undefined as string | undefined,
    globalPrefix: undefined as string | undefined,
    appPrefix: undefined as string | undefined,
  };
  assert.equal(resolvePrefixCls('button', state), 'sd-button');
  state.appPrefix = 'app';
  assert.equal(resolvePrefixCls(undefined, state), 'app');
  state.globalPrefix = 'global';
  assert.equal(resolvePrefixCls('', state), 'global');
  state.providerPrefix = '';
  assert.equal(resolvePrefixCls('button', state), '-button');
  state.providerPrefix = 'scope';
  assert.equal(resolvePrefixCls('button', state), 'scope-button');
});

test('class prefix short-circuits unused state ports and preserves read order', () => {
  assert.equal(
    resolvePrefixCls('x', {
      providerPrefix: 'scope',
      get globalPrefix() {
        throw Error('global');
      },
      get appPrefix() {
        throw Error('app');
      },
    }),
    'scope-x',
  );
  const reads: string[] = [];
  assert.equal(
    resolvePrefixCls(undefined, {
      get providerPrefix() {
        reads.push('provider');
        return undefined;
      },
      get globalPrefix() {
        reads.push('global');
        return undefined;
      },
      get appPrefix() {
        reads.push('app');
        return 'app';
      },
    }),
    'app',
  );
  assert.deepEqual(reads, ['provider', 'global', 'app']);
});

test('CSS token names retain fixed sd prefix and remove only one leading double dash', () => {
  assert.equal(getCssVarToken('color'), '--sd-color');
  assert.equal(getCssVarToken('--color'), '--sd-color');
  assert.equal(getCssVarToken('----color'), '--sd---color');
  assert.equal(getCssVarToken(''), '--sd-');
});

test('complete native language packs keep known values and shared English kv-list identity', () => {
  assert.equal(zhCN.locale, 'zh-CN');
  assert.equal(enUS.locale, 'en-US');
  assert.equal(enUS.kvList, kvListEnUS);
  assert.equal(
    createLocaleTranslator({ message: enUS, fallback: zhCN })('empty.description'),
    'No Data',
  );
  assert.equal(typeof globalThis.document, 'undefined');
});
