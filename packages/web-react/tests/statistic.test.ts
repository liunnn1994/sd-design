import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Statistic, Countdown } from '../dist/index.js';
import StatisticDefault from '../dist/statistic/index.js';

test('Statistic exports and formats numbers with prefixes, precision and extra content', () => {
  assert.equal(Statistic, StatisticDefault);
  assert.equal(Statistic.Countdown, Countdown);
  const html = renderToStaticMarkup(
    h(Statistic, {
      value: 1234.5,
      precision: 2,
      showGroupSeparator: true,
      title: 'Sales',
      prefix: '$',
      suffix: 'USD',
      extra: 'Today',
      animation: false,
    }),
  );
  assert.match(html, /aria-label="1,234.50"/);
  assert.match(html, /sd-statistic-prefix/);
  assert.match(html, /sd-statistic-suffix/);
  assert.match(html, /Today/);
});
test('Statistic respects initial animation value, date format and placeholders', () => {
  assert.match(
    renderToStaticMarkup(h(Statistic, { value: 10, valueFrom: 2, start: false })),
    /aria-label="2"/,
  );
  assert.match(
    renderToStaticMarkup(h(Statistic, { value: new Date(2026, 0, 2), format: 'YYYY-MM-DD' })),
    /2026-01-02/,
  );
  const html = renderToStaticMarkup(h(Statistic, { placeholder: 'Pending', prefix: 'Hidden' }));
  assert.match(html, /Pending/);
  assert.doesNotMatch(html, /Hidden/);
});
test('Countdown has deterministic SSR when now is supplied and retains literal separators', () => {
  const html = renderToStaticMarkup(
    h(Countdown, { now: 1000, value: 62000, format: 'mm:ss', start: false }),
  );
  assert.equal((html.match(/aria-label="01"/g) ?? []).length, 2);
  assert.match(html, /sd-statistic-countdown/);
  assert.match(html, /:/);
});
