import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';

import {
  Typography,
  TypographyParagraph,
  TypographyTitle,
  TypographyText,
  ConfigProvider,
} from '../dist/index.js';
test('Typography SSR exposes semantic family roots, formatting and provider prefix', () => {
  const html = render(
    h(
      ConfigProvider,
      { prefixCls: 'custom' },
      h(
        Typography,
        null,
        h(TypographyTitle, { heading: 4 }, 'Heading'),
        h(TypographyParagraph, { blockquote: true, spacing: 'close' }, 'Quote'),
        h(
          TypographyText,
          {
            bold: true,
            underline: true,
            delete: true,
            code: true,
            mark: { color: 'red' },
            type: 'danger',
            disabled: true,
          },
          '<safe>',
        ),
      ),
    ),
  );
  assert.match(html, /<article class="custom-typography"/);
  assert.match(html, /<h4 class="custom-typography">Heading/);
  assert.match(html, /<blockquote class="custom-typography custom-typography-spacing-close"/);
  assert.match(html, /<mark style="background-color:red"><code><del><u><b>&lt;safe&gt;/);
  assert.match(html, /custom-typography-danger custom-typography-disabled/);
});
test('Typography SSR preserves accessible operations and an initially controlled editor', () => {
  const operations = render(
    h(
      TypographyParagraph,
      { copyable: true, editable: true, copyIcon: (copied) => (copied ? 'done' : 'custom-copy') },
      'Text',
    ),
  );
  assert.match(operations, /role="button" tabindex="0" aria-label=/);
  assert.match(operations, /custom-copy/);
  const editor = render(
    h(TypographyText, { editable: true, defaultEditing: true, editText: 'Initial' }, 'Shown'),
  );
  assert.match(editor, /sd-typography-edit-content/);
  assert.match(editor, /value="Initial"/);
});

test('Typography custom copy content can explicitly render nothing', () => {
  const html = render(
    h(TypographyText, { copyable: true, copyIcon: () => null, copyTooltip: () => null }, 'Text'),
  );
  assert.match(html, /sd-typography-operation-copy/);
  assert.doesNotMatch(html, /<svg/);
});

test('TypographyParagraph retains a blockquote citation', () => {
  const html = render(
    h(TypographyParagraph, { blockquote: true, cite: 'https://example.com/source' }, 'Quoted'),
  );
  assert.match(html, /<blockquote[^>]*cite="https:\/\/example.com\/source"/);
});
