import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { NumberFlow } from '../dist/index.js';

test('number flow shares locale formatting and accessible value in SSR', () => {
  const html = renderToStaticMarkup(
    createElement(NumberFlow, {
      value: 1234.5,
      locales: 'en-US',
      format: { minimumFractionDigits: 2 },
      prefix: '$',
      suffix: ' USD',
      nonce: 'test-nonce',
    }),
  );
  assert.match(html, /aria-label="\$1,234.50 USD"/);
  assert.match(html, /nonce="test-nonce"/);
  assert.doesNotMatch(html, /sd-number-flow-animated/);
});

test('number flow sanitizes invalid values and custom content replaces string affixes', () => {
  const html = renderToStaticMarkup(
    createElement(NumberFlow, {
      value: 'bad',
      prefix: 'hidden',
      prefixContent: createElement('b', null, 'custom'),
    }),
  );
  assert.match(html, /aria-label="0"/);
  assert.match(html, /<b>custom<\/b>/);
  assert.doesNotMatch(html, /hidden0/);
});
