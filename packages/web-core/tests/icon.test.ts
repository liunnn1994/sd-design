import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getIconStyle, loadIconFontScript } from '../src/icon/foundation.ts';

test('icon styles preserve zero sizes and compose rotation without stale properties', () => {
  assert.deepEqual(getIconStyle({ size: 0 }), { fontSize: '0px' });
  assert.deepEqual(getIconStyle({ size: '1.5rem', rotate: -90, spin: true }), {
    'fontSize': '1.5rem',
    'transform': 'rotate(-90deg)',
    '--icon-rotate': '-90deg',
  });
  assert.deepEqual(getIconStyle({ rotate: 0 }), {});
  assert.deepEqual(getIconStyle({}), {});
});

function createDocument() {
  const scripts: Script[] = [];
  class Script extends EventTarget {
    attributes = new Map<string, string>();
    removed = false;
    setAttribute(name: string, value: string) {
      this.attributes.set(name, value);
    }
    remove() {
      this.removed = true;
    }
  }
  const owner = {
    createElement(name: string) {
      assert.equal(name, 'script');
      return new Script();
    },
    body: {
      appendChild(script: Script) {
        scripts.push(script);
      },
    },
  } as unknown as Document;
  return { owner, scripts };
}

test('icon font scripts deduplicate per document and retry only failed loads', () => {
  const first = createDocument();
  const second = createDocument();
  loadIconFontScript('/icons.js', first.owner);
  loadIconFontScript('/icons.js', first.owner);
  assert.equal(first.scripts.length, 1);
  assert.equal(first.scripts[0].attributes.get('data-namespace'), '/icons.js');
  loadIconFontScript('/icons.js', second.owner);
  assert.equal(second.scripts.length, 1);
  first.scripts[0].dispatchEvent(new Event('error'));
  assert.equal(first.scripts[0].removed, true);
  loadIconFontScript('/icons.js', first.owner);
  assert.equal(first.scripts.length, 2);
  first.scripts[1].dispatchEvent(new Event('load'));
  loadIconFontScript('/icons.js', first.owner);
  assert.equal(first.scripts.length, 2);
  loadIconFontScript('', first.owner);
  loadIconFontScript(undefined, first.owner);
  assert.equal(first.scripts.length, 2);
});

test('icon font loading is inert without a browser document', () => {
  assert.doesNotThrow(() => loadIconFontScript('/ssr-icons.js'));
});
