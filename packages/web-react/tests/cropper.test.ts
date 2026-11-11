import { Cropper as RootCropper, ConfigProvider } from '@sdata/web-react';
import { Cropper } from '@sdata/web-react/cropper';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';

test('Cropper public entries render native attributes and geometry without a browser engine', () => {
  assert.equal(RootCropper, Cropper);
  const html = render(
    h(Cropper, {
      'src': '/avatar.png',
      'width': 400,
      'height': '50vh',
      'id': 'cropper',
      'aria-label': 'Avatar cropper',
      'className': 'custom',
    }),
  );
  assert.match(html, /id="cropper"/);
  assert.match(html, /aria-label="Avatar cropper"/);
  assert.match(html, /class="sd-cropper custom"/);
  assert.match(html, /width:400px/);
  assert.match(html, /height:50vh/);
  assert.match(html, /src="\/avatar.png"/);
  assert.doesNotMatch(html, /<cropper-canvas/);
});

test('Cropper preserves provider prefix and explicit root styles', () => {
  const html = render(
    h(
      ConfigProvider,
      { prefixCls: 'custom' },
      h(Cropper, {
        src: '/avatar.png',
        width: 400,
        style: { width: 320, borderRadius: 12 },
      }),
    ),
  );
  assert.match(html, /class="custom-cropper"/);
  assert.match(html, /width:320px/);
  assert.match(html, /border-radius:12px/);
});
