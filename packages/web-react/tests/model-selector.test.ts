import * as root from '@sdata/web-react';
import ModelSelectorDefault, * as selector from '@sdata/web-react/model-selector';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { test } from 'node:test';
import { createElement as h, Fragment } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';

import { createModelSelectorKeyTracker } from '../dist/model-selector/keyboard.js';
import { modelSelectorLogoSources } from '../dist/model-selector/logo-sources.js';

test('ModelSelector public entries and all compound views share identity', () => {
  assert.equal(root.ModelSelector, selector.ModelSelector);
  assert.equal(ModelSelectorDefault, selector.ModelSelector);
  for (const name of [
    'Trigger',
    'Content',
    'Dialog',
    'Input',
    'List',
    'Empty',
    'Group',
    'Item',
    'Shortcut',
    'Separator',
    'Logo',
    'LogoGroup',
    'Name',
  ] as const) {
    assert.equal(selector.ModelSelector[name], selector[`ModelSelector${name}`]);
    assert.equal(root[`ModelSelector${name}`], selector[`ModelSelector${name}`]);
  }
});

test('ModelSelector SSR preserves controlled undefined and distinct combobox/list identifiers', () => {
  const controlled = render(
    h(selector.ModelSelector, { visible: undefined, defaultVisible: true }, (state) =>
      String(state.visible),
    ),
  );
  assert.equal(controlled, 'false');
  const markup = () =>
    h(
      selector.ModelSelector,
      { defaultVisible: true },
      h(selector.ModelSelectorInput),
      h(selector.ModelSelectorList),
    );
  const html = render(h(Fragment, null, markup(), markup()));
  const listIds = [...html.matchAll(/aria-controls="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(listIds.length, 2);
  assert.notEqual(listIds[0], listIds[1]);
  assert.match(html, /role="combobox"/);
  assert.match(html, /aria-expanded="true"/);
  assert.match(html, /role="listbox"/);
});

test('ModelSelector views require their root context', () => {
  assert.throws(() => render(h(selector.ModelSelectorInput)), /必须在 ModelSelector 内使用/);
  assert.throws(() => render(h(selector.ModelSelectorGroup)), /必须在 ModelSelector 内使用/);
});

test('ModelSelector unnamed groups do not reference a missing heading', () => {
  const html = render(
    h(
      selector.ModelSelector,
      null,
      h(
        selector.ModelSelectorGroup,
        null,
        h(selector.ModelSelectorItem, { value: 'alpha' }, 'Alpha'),
      ),
    ),
  );
  assert.match(html, /role="group"/);
  assert.doesNotMatch(html, /aria-labelledby=/);
});

test('ModelSelector bundled logos exactly preserve all original SVG bytes', () => {
  const directory = new URL(
    '../../web-vue/components/model-selector/assets/logos/',
    import.meta.url,
  );
  const files = readdirSync(directory)
    .filter((file) => file.endsWith('.svg'))
    .sort();
  assert.deepEqual(
    Object.keys(modelSelectorLogoSources).sort(),
    files.map((file) => file.slice(0, -4)).sort(),
  );
  for (const file of files) {
    const source = modelSelectorLogoSources[file.slice(0, -4)];
    assert.equal(
      source,
      `data:image/svg+xml;base64,${readFileSync(new URL(file, directory)).toString('base64')}`,
    );
  }
  const fallback = render(h(selector.ModelSelectorLogo, { provider: 'constructor' }));
  assert.ok(fallback.includes(modelSelectorLogoSources.default));
  assert.match(fallback, /alt="constructor logo"/);
});

test('ModelSelector key tracking matches key names and releases modifier dependencies', () => {
  const keys = createModelSelectorKeyTracker();
  const update = (key: string, code: string, type = 'keydown', modifier?: string) =>
    keys.update({
      key,
      code,
      type,
      getModifierState: (name: string) => name === modifier,
    } as KeyboardEvent);
  update('a', 'KeyA');
  assert.deepEqual([...keys.current], ['a']);
  update('a', 'KeyA', 'keyup');
  assert.equal(keys.current.size, 0);
  for (const modifier of ['Meta', 'Shift', 'Alt']) {
    update(modifier, `${modifier}Left`, 'keydown', modifier);
    update('a', 'KeyA', 'keydown', modifier);
    assert.equal(keys.current.has('a'), true);
    update(modifier, `${modifier}Left`, 'keyup');
    assert.equal(keys.current.size, 0);
  }
  update('b', 'KeyB');
  keys.clear();
  assert.equal(keys.current.size, 0);
});
