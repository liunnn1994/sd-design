import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Slider, Form, FormItem } from '../dist/index.js';
import DefaultSlider from '../dist/slider/index.js';

test('Slider SSR preserves negative-range geometry, ticks, marks and range ARIA', () => {
  assert.equal(Slider, DefaultSlider);
  const html = renderToStaticMarkup(
    h(Slider, {
      value: [-20, 20],
      range: true,
      min: -50,
      max: 50,
      step: 10,
      marks: { '-20': 'Low', 20: 'High' },
      showTicks: true,
      formatTooltip: (value) => `${value}%`,
    }),
  );
  assert.match(html, /left:30%;right:30%/);
  assert.equal((html.match(/role="slider"/g) ?? []).length, 2);
  assert.equal((html.match(/class="sd-slider-tick[ "]/g) ?? []).length, 9);
  assert.match(html, /aria-valuetext="-20%"/);
  assert.match(html, /aria-valuenow="20"/);
  assert.match(html, /Low/);
  assert.match(html, /High/);
});
test('Slider SSR composes number inputs and vertical geometry with FormItem disabled state', () => {
  const html = renderToStaticMarkup(
    h(
      Form,
      { model: {}, disabled: true },
      h(
        FormItem,
        {},
        h(Slider, { value: [20, 80], range: true, showInput: true, direction: 'vertical' }),
      ),
    ),
  );
  assert.match(html, /sd-slider-vertical/);
  assert.match(html, /bottom:20%;top:20%/);
  assert.equal((html.match(/role="spinbutton"/g) ?? []).length, 2);
  assert.equal((html.match(/tabindex="-1" role="slider"/g) ?? []).length, 2);
  assert.match(html, /sd-slider-track-disabled/);
});
