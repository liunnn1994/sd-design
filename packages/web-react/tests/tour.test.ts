import { Tour as RootTour } from '@sdata/web-react';
import { Tour as EntryTour } from '@sdata/web-react/tour';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';

import { Tour } from '../dist/tour/index.js';

test('Tour SSR renders children without creating browser overlays or calling render props', () => {
  assert.equal(RootTour, Tour);
  assert.equal(EntryTour, Tour);
  let renders = 0;
  const html = render(
    h(
      Tour,
      {
        animate: undefined,
        steps: [{ element: '#target', popover: { title: 'Native title' } }],
        renderTitle: () => {
          renders++;
          return 'Custom title';
        },
      },
      h('button', { id: 'target' }, 'Target'),
    ),
  );
  assert.equal(html, '<button id="target">Target</button>');
  assert.equal(renders, 0);
});
