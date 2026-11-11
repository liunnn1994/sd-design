import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Dropdown, Doption, Dgroup } from '../dist/index.js';

test('Dropdown SSR renders an accessible trigger and defers the popup', () => {
  const html = renderToStaticMarkup(
    h(Dropdown, { children: h('button', {}, 'Menu'), content: h(Doption, {}, 'Option') }),
  );
  assert.match(html, /aria-haspopup="menu"/);
  assert.doesNotMatch(html, /role="menu"/);
});
test('Dropdown options and groups retain semantics, decorations and disabled state', () => {
  const html = renderToStaticMarkup(
    h(
      Dgroup,
      { title: 'Actions' },
      h(Doption, { disabled: true, icon: '*', suffix: 'key' }, 'Disabled'),
    ),
  );
  assert.match(html, /sd-dropdown-group-title/);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /sd-dropdown-option-has-suffix/);
  assert.doesNotMatch(html, /tabindex/);
});

test('DropdownButton forwards native attributes to the outer button group', () => {
  const html = renderToStaticMarkup(
    h(Dropdown.Button, { id: 'split', className: 'custom-split', style: { width: 200 } }, 'Action'),
  );
  assert.match(html, /^<div id="split" style="width:200px" class="sd-btn-group custom-split"/);
});
