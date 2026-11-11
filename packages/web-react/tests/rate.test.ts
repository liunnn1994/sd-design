import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Rate, Form, FormItem } from '../dist/index.js';
import DefaultRate from '../dist/rate/index.js';

test('Rate SSR preserves half selection ARIA, rounded display and threshold colors', () => {
  assert.equal(Rate, DefaultRate);
  const html = renderToStaticMarkup(
    h(Rate, {
      'value': 2.5,
      'allowHalf': true,
      'count': 4,
      'color': { 2: 'red', 4: 'blue' },
      'aria-label': 'Score',
    }),
  );
  assert.equal((html.match(/role="radio"/g) ?? []).length, 8);
  assert.equal((html.match(/aria-checked="true"/g) ?? []).length, 1);
  assert.match(html, /aria-setsize="8"/);
  assert.match(html, /aria-posinset="5"/);
  assert.match(html, /sd-rate-character-half/);
  assert.match(html, /color:red/);
  assert.match(html, /color:blue/);
  assert.match(html, /aria-label="Score"/);
});
test('Rate SSR preserves grading faces, custom zero characters and inherited disabled state', () => {
  const grading = renderToStaticMarkup(h(Rate, { grading: true, count: 2, value: 2 }));
  assert.equal((grading.match(/role="radio"/g) ?? []).length, 5);
  assert.equal((grading.match(/sd-icon-face-frown-fill/g) ?? []).length, 6);
  assert.equal((grading.match(/sd-icon-face-meh-fill/g) ?? []).length, 4);
  const html = renderToStaticMarkup(
    h(
      Form,
      { model: {}, disabled: true },
      h(FormItem, {}, h(Rate, { renderCharacter: (index) => index, readonly: true })),
    ),
  );
  assert.match(html, /sd-rate-disabled/);
  assert.match(html, /sd-rate-readonly/);
  assert.doesNotMatch(html, /tabindex=/);
  assert.match(html, /sd-rate-character-left">0/);
});
