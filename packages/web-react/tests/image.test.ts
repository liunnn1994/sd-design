import { Image as RootImage } from '@sdata/web-react';
import { Image as EntryImage } from '@sdata/web-react/image';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';

import { ConfigProvider } from '../dist/config-provider/index.js';
import { ImageFooter } from '../dist/image/footer.js';
import { Image, ImagePreview, ImagePreviewGroup } from '../dist/image/index.js';
import { ImagePreviewAction } from '../dist/image/preview-action.js';
import { ImagePreviewArrow } from '../dist/image/preview-arrow.js';
import { ImagePreviewToolbar } from '../dist/image/preview-toolbar.js';

test('Image keeps Vue compound entries, native image attrs and wrapper sizing', () => {
  assert.equal(RootImage, Image);
  assert.equal(EntryImage, Image);
  assert.equal(Image.Preview, ImagePreview);
  assert.equal(Image.PreviewGroup, ImagePreviewGroup);
  const html = render(
    h(Image, {
      src: '/picture.png',
      width: 120,
      height: '50%',
      fit: 'cover',
      description: 'Landscape',
      className: 'photo',
      style: { borderRadius: 4 },
      id: 'native',
      loading: 'lazy',
    }),
  );
  assert.match(html, /class="sd-image photo" style="width:120px;height:50%;border-radius:4px"/);
  assert.match(html, /<img[^>]*id="native"[^>]*loading="lazy"/);
  assert.match(html, /object-fit:cover/);
  assert.match(html, /alt="Landscape"/);
  assert.doesNotMatch(html, /with-footer|caption/);
});

test('Image never-hide footer renders before loading and honors explicit empty alt', () => {
  const html = render(
    h(Image, {
      description: 'Caption',
      alt: '',
      hideFooter: 'never',
      extra: h('b', null, 'Extra'),
    }),
  );
  assert.match(html, /alt=""/);
  assert.match(html, /caption-description" title="Caption"/);
  assert.match(html, /sd-image-footer-extra"><b>Extra/);
  assert.doesNotMatch(html, /with-footer/);
  assert.doesNotMatch(render(h(Image, { title: 'Hidden', hideFooter: true })), /sd-image-footer/);
});

test('image footer keeps caption tooltips, custom content and inherited prefix', () => {
  const html = render(
    h(
      ConfigProvider,
      { prefixCls: 'custom' },
      h(ImageFooter, {
        title: 'A < B',
        description: 'Details',
        extra: h('button', null, 'Download'),
        className: 'footer',
      }),
    ),
  );
  assert.match(html, /custom-image-footer footer/);
  assert.match(html, /caption-title" title="A &lt; B"/);
  assert.match(html, /caption-description" title="Details"/);
  assert.match(html, /custom-image-footer-extra"><button>Download/);
  assert.doesNotMatch(render(h(ImageFooter)), /caption|extra/);
});

test('image action omits empty content and preserves disabled state and native attributes', () => {
  assert.equal(render(h(ImagePreviewAction, { name: 'Unused' })), '');
  const html = render(
    h(ImagePreviewAction, { disabled: true, id: 'action', className: 'extra' }, 'Save'),
  );
  assert.match(html, /id="action"/);
  assert.match(html, /sd-image-preview-toolbar-action-disabled extra/);
  assert.match(html, /toolbar-action-content">Save/);
});

test('image toolbar follows layout order and retains custom actions', () => {
  const html = render(
    h(ImagePreviewToolbar, {
      actions: [
        { key: 'first', children: 'FIRST' },
        { key: 'second', children: 'SECOND' },
        { key: 'hidden', children: 'HIDDEN' },
      ],
      actionsLayout: ['second', 'first'],
      children: h('button', null, 'CUSTOM'),
    }),
  );
  assert.ok(html.indexOf('SECOND') < html.indexOf('FIRST'));
  assert.ok(html.indexOf('FIRST') < html.indexOf('CUSTOM'));
  assert.doesNotMatch(html, /HIDDEN/);
});

test('image arrows disable only unavailable directions', () => {
  const html = render(h(ImagePreviewArrow, { onNext() {} }));
  assert.match(html, /arrow-left sd-image-preview-arrow-disabled/);
  assert.match(html, /class="sd-image-preview-arrow-right"/);
  assert.match(html, /sd-icon-left/);
  assert.match(html, /sd-icon-right/);
});
