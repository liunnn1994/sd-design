import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Avatar, AvatarGroup, ConfigProvider } from '../dist/index.js';

test('avatar uses shared sizing and trigger color rules with provider prefix and RTL', () => {
  const html = renderToStaticMarkup(
    createElement(
      ConfigProvider,
      { prefixCls: 'custom', rtl: true },
      createElement(
        Avatar,
        {
          size: 32,
          shape: 'square',
          style: { backgroundColor: 'red' },
          triggerIcon: '+',
        },
        'AB',
      ),
    ),
  );
  assert.match(html, /width:32px;height:32px;font-size:16px/);
  assert.match(html, /custom-avatar-square/);
  assert.match(html, /custom-avatar-rtl/);
  assert.match(html, /custom-avatar-trigger-icon-button" style="color:red"/);
});
test('avatar group flattens fragments, applies group defaults and limits visible children in SSR', () => {
  assert.equal(Avatar.Group, AvatarGroup);
  const html = renderToStaticMarkup(
    createElement(
      AvatarGroup,
      { size: 32, shape: 'square', maxCount: 1 },
      createElement(
        Fragment,
        null,
        createElement(Avatar, { size: 64 }, 'A'),
        createElement(Avatar, null, 'B'),
      ),
      createElement(Avatar, null, 'C'),
    ),
  );
  assert.equal((html.match(/class="sd-avatar sd-avatar-square/g) ?? []).length, 2);
  assert.match(html, /width:32px/);
  assert.doesNotMatch(html, /width:64px/);
  assert.match(html, /\+2/);
});
