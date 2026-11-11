import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Grid, GridItem, Row, Col } from '../dist/index.js';

test('row and col SSR preserve gutters, numeric zero flex and div-mode visibility', () => {
  const html = renderToStaticMarkup(
    createElement(Row, { gutter: [16, 8], wrap: false }, createElement(Col, { flex: 0 }, 'Flex')),
  );
  assert.match(html, /sd-row-nowrap/);
  assert.match(html, /margin-left:-8px/);
  assert.match(html, /padding-top:4px/);
  assert.match(html, /flex:0/);
  assert.doesNotMatch(renderToStaticMarkup(createElement(Col, { span: 0 }, 'Hidden')), /Hidden/);
  const div = renderToStaticMarkup(
    createElement(Row, { div: true, gutter: 16 }, createElement(Col, { span: 0 }, 'Visible')),
  );
  assert.match(div, /Visible/);
  assert.doesNotMatch(div, /sd-row|sd-col|padding-left|margin-left/);
});

test('grid exposes compound components and renders responsive SSR columns without DOM collection', () => {
  assert.equal(Grid.Row, Row);
  assert.equal(Grid.Col, Col);
  assert.equal(Grid.Item, GridItem);
  const html = renderToStaticMarkup(
    createElement(
      Grid,
      { cols: { xs: 1, md: 3 }, colGap: 8, rowGap: 4 },
      createElement(GridItem, { suffix: true }, ({ overflow }) => String(overflow)),
    ),
  );
  assert.match(html, /grid-template-columns:repeat\(3, minmax\(0px, 1fr\)\)/);
  assert.match(html, /gap:4px 8px/);
  assert.match(html, /false/);
});
