import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { TagGroup } from '../dist/index.js';
import TagGroupDefault from '../dist/tag-group/index.js';

test('TagGroup merges item classes while forcing visible and nowrap', () => {
  const html = renderToStaticMarkup(
    h(TagGroup, {
      maxCount: 1,
      options: [
        {
          label: 'Item',
          value: 'i',
          itemProps: { className: 'custom-group-tag', visible: false, nowrap: false },
        },
      ],
    }),
  );
  assert.match(html, /custom-group-tag/);
  assert.match(html, /sd-tag-group-item-content/);
  assert.match(html, /Item/);
});

test('TagGroup fixed limits, primitives, function labels and empty fallback share Vue rules', () => {
  assert.equal(TagGroup, TagGroupDefault);
  const html = renderToStaticMarkup(
    h(TagGroup, { maxCount: 1, options: [0, 'B', { label: () => 'C', value: 'c' }] }),
  );
  assert.match(html, /\+2/);
  assert.match(html, /tabindex="0"/);
  assert.match(html, /aria-haspopup="true"/);
  assert.match(renderToStaticMarkup(h(TagGroup, {}, 'Empty')), /sd-tag-group-empty.*Empty/);
  assert.doesNotMatch(
    renderToStaticMarkup(h(TagGroup, { maxCount: 0, options: ['A', 'B'] })),
    /sd-tag-group-item-counter/,
  );
});
test('TagGroup normalizes mapped fields and preserves custom item context', () => {
  let context;
  const html = renderToStaticMarkup(
    h(TagGroup, {
      maxCount: 1,
      options: [{ name: 'Docs', id: 0 }],
      fieldNames: { label: 'name', value: 'id' },
      renderItem: (info) => {
        context = info;
        return h('b', {}, info.label);
      },
    }),
  );
  assert.match(html, /<b>Docs<\/b>/);
  assert.equal(context.value, 0);
  assert.equal(context.data, context.option);
  assert.equal(context.measure, false);
});
test('TagGroup defers hidden item render functions until the popup is mounted', () => {
  const rendered: number[] = [];
  renderToStaticMarkup(
    h(TagGroup, {
      maxCount: 1,
      options: ['A', 'B', 'C'],
      renderItem: ({ index, label }) => {
        rendered.push(index);
        return label;
      },
    }),
  );
  assert.deepEqual(rendered, [0]);
});
