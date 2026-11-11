import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import AffixDefault from '../dist/affix/index.js';
import { Affix } from '../dist/index.js';

test('Affix renders an unfixed SSR shell and forwards native attributes to its wrapper', () => {
  assert.equal(Affix, AffixDefault);
  const html = renderToStaticMarkup(
    h(
      Affix,
      {
        'offsetTop': 20,
        'target': '#scroll',
        'className': 'wrapper',
        'style': { width: 200 },
        'aria-label': 'Pinned toolbar',
      },
      h('button', {}, 'Action'),
    ),
  );
  assert.match(html, /class="wrapper"/);
  assert.match(html, /width:200px/);
  assert.match(html, /aria-label="Pinned toolbar"/);
  assert.match(html, /<div><button>Action<\/button><\/div>/);
  assert.doesNotMatch(html, /sd-affix|offsetTop|target=/);
});
