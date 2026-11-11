import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Descriptions, DescriptionsItem } from '../dist/index.js';

test('descriptions groups spans and supports all four layouts during SSR', () => {
  const data = [
    { label: () => 'A', value: 'One' },
    { label: 'B', value: () => 'Two', span: 2 },
    { label: 'C', value: 'Three' },
  ];
  for (const layout of [
    'horizontal',
    'vertical',
    'inline-horizontal',
    'inline-vertical',
  ] as const) {
    const html = renderToStaticMarkup(
      createElement(Descriptions, {
        data,
        layout,
        column: { xs: 1, md: 3 },
        title: 'Title',
        bordered: true,
      }),
    );
    assert.equal((html.match(/<tr /g) ?? []).length, layout === 'vertical' ? 4 : 2);
    for (const value of ['A', 'One', 'B', 'Two', 'C', 'Three']) assert.ok(html.includes(value));
    assert.match(html, /sd-descriptions-border/);
    assert.match(html, layout === 'horizontal' ? /colSpan="5"/ : /colSpan="3"/i);
  }
});

test('description items override data and flatten fragments while data renderers receive indexes', () => {
  const html = renderToStaticMarkup(
    createElement(
      Descriptions,
      { data: [{ label: 'Ignored', value: 'Ignored' }] },
      createElement(
        Fragment,
        null,
        createElement(DescriptionsItem, { label: createElement('strong', null, 'Label') }, 'Value'),
      ),
    ),
  );
  assert.match(html, /<strong>Label<\/strong>/);
  assert.match(html, /Value/);
  assert.doesNotMatch(html, /Ignored/);
  assert.equal(Descriptions.DescriptionsItem, DescriptionsItem);
  const rendered = renderToStaticMarkup(
    createElement(Descriptions, {
      data: [{ label: 'Label', value: 'Value' }],
      renderValue: ({ index, data }) => `${index}:${data.value}`,
    }),
  );
  assert.match(rendered, /0:Value/);
});
