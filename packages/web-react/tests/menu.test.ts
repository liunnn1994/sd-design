import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Menu, MenuItem, MenuItemGroup, SubMenu } from '../dist/index.js';
import MenuDefault from '../dist/menu/index.js';

test('Menu SSR preserves fragment keys, disabled semantics and selection', () => {
  const html = renderToStaticMarkup(
    h(
      Menu,
      { selectedKeys: ['one'], theme: 'dark' },
      h(
        Fragment,
        {},
        h(MenuItem, { key: 'one' }, 'One'),
        h(MenuItem, { itemKey: 'two', disabled: true }, 'Two'),
      ),
    ),
  );
  assert.match(html, /sd-menu-dark/);
  assert.match(html, /aria-current="page"/);
  assert.match(html, /aria-disabled="true"/);
  assert.match(html, /role="menu"/);
});
test('Menu SSR renders compound components, inline expansion and group indentation', () => {
  assert.equal(MenuDefault, Menu);
  assert.equal(Menu.Item, MenuItem);
  assert.equal(Menu.SubMenu, SubMenu);
  assert.equal(Menu.ItemGroup, MenuItemGroup);
  const html = renderToStaticMarkup(
    h(
      Menu,
      { openKeys: ['branch'], levelIndent: 20 },
      h(
        SubMenu,
        { itemKey: 'branch', title: 'Branch' },
        h(MenuItemGroup, { title: 'Group' }, h(MenuItem, { itemKey: 'leaf' }, 'Leaf')),
      ),
    ),
  );
  assert.match(html, /aria-expanded="true"/);
  assert.match(html, /width:20px/);
  assert.match(html, /sd-menu-group-title/);
});

test('Menu SSR matches collapsed icons and popButton collapse rules', () => {
  const collapsed = renderToStaticMarkup(
    h(
      Menu,
      { defaultCollapsed: true, showCollapseButton: true },
      h(MenuItem, { itemKey: 'one' }, 'One'),
    ),
  );
  assert.match(collapsed, /sd-icon-menu-unfold/);
  assert.match(collapsed, /M6 11h36M22 24h20/);
  const popup = renderToStaticMarkup(
    h(
      Menu,
      { mode: 'popButton', showCollapseButton: true, collapsedWidth: 64 },
      h(SubMenu, { itemKey: 'branch', title: 'Branch' }, h(MenuItem, { itemKey: 'leaf' }, 'Leaf')),
    ),
  );
  assert.match(popup, /sd-menu-pop-button/);
  assert.match(popup, /width:64px/);
  assert.doesNotMatch(popup, /sd-menu-collapse-button/);
  assert.match(popup, /sd-icon-right/);
});
