import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';

import { Carousel, CarouselItem, ConfigProvider } from '../dist/index.js';

test('Carousel SSR is timer-free and retains accessible content and animation configuration', () => {
  const html = render(
    h(
      Carousel,
      {
        'autoPlay': true,
        'direction': 'vertical',
        'animationName': 'fade',
        'moveSpeed': 120,
        'transitionTimingFunction': 'linear',
        'aria-label': 'Gallery',
      },
      h(CarouselItem, { 'data-slide': 'one' }, 'First'),
    ),
  );
  assert.match(html, /role="region"/);
  assert.match(html, /aria-label="Gallery"/);
  assert.match(html, /sd-carousel-fade sd-carousel-vertical/);
  assert.match(html, /aria-roledescription="slide"/);
  assert.match(html, /transition-duration:120ms/);
  assert.match(html, />First</);
  assert.doesNotMatch(html, /sd-carousel-arrow/);
});

test('Carousel exports its Item alias and inherits prefixes without retaining controls for an empty root', () => {
  assert.equal(Carousel.Item, CarouselItem);
  const html = render(
    h(
      ConfigProvider,
      { prefixCls: 'custom' },
      h(Carousel, { indicatorPosition: 'outer', showArrow: 'never', indicatorType: 'never' }),
    ),
  );
  assert.match(html, /custom-carousel-indicator-position-outer/);
  assert.doesNotMatch(html, /role="button"/);
});
