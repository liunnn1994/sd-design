import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Steps, Step } from '../dist/index.js';

test('Steps derives direction and labels from shared type rules', () => {
  const html = renderToStaticMarkup(
    h(
      Steps,
      { type: 'navigation', direction: 'vertical', labelPlacement: 'vertical' },
      h(Step, { title: 'Title' }),
    ),
  );
  assert.match(html, /sd-steps-horizontal/);
  assert.match(html, /sd-steps-label-horizontal/);
  assert.match(html, /role="list" aria-label="步骤条"/);
});
test('Steps custom nodes receive status and disabled steps do not enter the tab sequence', () => {
  const html = renderToStaticMarkup(
    h(
      Steps,
      { changeable: true },
      h(
        Step,
        { disabled: true, status: 'error', node: ({ status }) => h('b', {}, status) },
        'Custom',
      ),
    ),
  );
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /<b>error<\/b>/);
  assert.doesNotMatch(html, /tabindex/);
});
