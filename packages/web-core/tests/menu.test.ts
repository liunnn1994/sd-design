import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { MenuOpenStateProps } from '../src/menu/open.ts';
import type { MenuData } from '../src/menu/types.ts';

import { createMenuCollector, getMenuKeys } from '../dist/menu/collector.js';
import {
  createMenuFoundation,
  getMenuFocusTarget,
  activateMenuItemKey,
  activateMenuItem,
  activatePopupMenu,
  selectPopupMenuItem,
  getMenuPopupMaxHeight,
} from '../dist/menu/foundation.js';
import { createMenuOpenFoundation, initialMenuOpenValue } from '../dist/menu/open.js';
import { getMenuOverflowIndex, roundMenuWidth, parseMenuMargin } from '../dist/menu/overflow.js';

function setupOpen(patch: Partial<MenuOpenStateProps> = {}) {
  const props: MenuOpenStateProps = {
    modelValue: undefined,
    defaultValue: undefined,
    autoOpen: false,
    autoOpenSelected: false,
    selectedKeys: [],
    subMenuKeys: ['a', 'b'],
    menuData: [
      { key: 'a', children: [{ key: 'nested', children: [{ key: 'leaf' }] }] },
      { key: 'b', children: [{ key: 'other' }] },
    ],
    accordion: false,
    ...patch,
  };
  let local = initialMenuOpenValue(props);
  const writes: string[][] = [];
  const foundation = createMenuOpenFoundation({
    props,
    get openKeys() {
      return props.modelValue || local;
    },
    setLocal(value) {
      local = value;
      writes.push(value);
    },
  });
  return {
    props,
    foundation,
    writes,
    get local() {
      return local;
    },
  };
}

test('initial open value preserves controlled/default references and controlled rejection', () => {
  const controlled = ['a'];
  const defaults = ['b'];
  const s = setupOpen({ modelValue: controlled, defaultValue: defaults });
  assert.equal(s.local, controlled);
  assert.deepEqual(s.foundation.open('b', 1), ['a', 'b']);
  assert.deepEqual(s.foundation.open('b', 1), ['a', 'b']);
  assert.equal(s.props.modelValue, controlled);
  s.props.modelValue = undefined;
  s.foundation.syncModel(undefined);
  assert.deepEqual(s.local, []);
  assert.equal(setupOpen({ defaultValue: defaults }).local, defaults);
});

test('mount auto-open and selected paths retain accordion precedence', () => {
  const s = setupOpen({
    autoOpen: true,
    autoOpenSelected: true,
    selectedKeys: ['leaf', 'other'],
    accordion: true,
  });
  s.foundation.mount();
  assert.deepEqual(s.local, ['a', 'nested']);
  s.props.accordion = false;
  s.foundation.mount();
  assert.deepEqual(s.local, ['a', 'b']);
  s.props.autoOpen = false;
  s.foundation.mount();
  assert.deepEqual(s.local, ['a', 'nested', 'b']);
});

test('first collector update preserves legacy comma-joined equality, later updates reconcile', () => {
  const s = setupOpen({ defaultValue: ['a,b', 'missing'], subMenuKeys: ['a,b', 'c'] });
  s.foundation.mount();
  s.foundation.syncKeys(['a', 'b,c'], []);
  assert.deepEqual(s.local, ['a,b', 'missing']);
  s.foundation.syncKeys(['a', 'b,c'], ['a', 'b,c']);
  assert.deepEqual(s.local, []);
});

test('dynamic keys prune missing entries and append duplicates before accordion limiting', () => {
  const s = setupOpen({ autoOpen: true });
  s.foundation.mount();
  s.foundation.syncKeys(['b', 'c', 'c'], ['a', 'b']);
  assert.deepEqual(s.local, ['b', 'c', 'c']);
  s.props.accordion = true;
  assert.deepEqual(s.foundation.open('c', 1), []);
  assert.deepEqual(s.foundation.open('a', 1), ['a']);
  assert.deepEqual(s.foundation.open('nested', 2), ['a', 'nested']);
});

test('collector preserves in-place aliases, replacement and captured versus current report keys', () => {
  let data: MenuData = [];
  const reports: unknown[][] = [];
  const options = { key: 'initial', type: 'subMenu' as const };
  const parent = {
    collectSubMenu(...args: unknown[]) {
      reports.push(args);
    },
    removeSubMenu(key: string) {
      reports.push(['remove', key]);
    },
    collectMenuItem() {},
    removeMenuItem() {},
    reportMenuData(value: MenuData) {
      reports.push(['report', value]);
    },
  };
  const c = createMenuCollector({
    options,
    get data() {
      return data;
    },
    parent,
    replace(value) {
      data = value;
    },
  });
  c.context.collectMenuItem('one');
  const original = data;
  c.mount();
  c.context.collectSubMenu('branch', []);
  assert.notEqual(data, original);
  const live = data;
  c.context.collectSubMenu('branch', [{ key: 'two' }], true);
  assert.equal(data, live);
  options.key = 'current';
  c.context.collectSubMenu('branch', [], true);
  assert.equal(reports.at(-1)?.[0], 'current');
  const replacement = [{ key: 'replacement' }];
  c.context.reportMenuData(replacement);
  assert.equal(data, replacement);
  assert.equal(reports.at(-1)?.[0], 'initial');
  c.context.removeMenuItem('replacement');
  assert.equal(data, replacement);
  assert.deepEqual(data, []);
  c.unmount();
  assert.deepEqual(reports.at(-1), ['remove', 'initial']);
});

test('collector traversal retains empty submenus and duplicate leaf keys', () => {
  const data: MenuData = [
    { key: 'empty', children: [] },
    { key: 'sub', children: [{ key: 'leaf' }, { key: 'leaf' }] },
  ];
  assert.deepEqual(
    getMenuKeys(data, (item) => !!item.children),
    ['empty', 'sub'],
  );
  assert.deepEqual(
    getMenuKeys(data, (item) => !item.children),
    ['leaf', 'leaf'],
  );
});

test('root actions preserve selection array separation and open publication identity', () => {
  let local: string[] = [];
  let openValue: string[] = [];
  const events: unknown[][] = [];
  const f = createMenuFoundation({
    collapsed: false,
    setCollapsed(value) {
      events.push(['localCollapsed', value]);
    },
    onCollapsed(value, reason) {
      events.push(['collapsed', value, reason]);
    },
    setSelected(value) {
      local = value;
    },
    onSelected(value, key) {
      assert.notEqual(value, local);
      events.push(['selected', value, key]);
    },
    open() {
      openValue = ['sub'];
      return openValue;
    },
    setOpen(value) {
      assert.equal(value, openValue);
    },
    onOpen(value, key) {
      assert.equal(value, openValue);
      events.push(['open', value, key]);
    },
  });
  f.select('leaf');
  f.open('sub', 1);
  f.toggleCollapse();
  f.toggleCollapse();
  assert.deepEqual(events.slice(0, 2), [
    ['selected', ['leaf'], 'leaf'],
    ['open', ['sub'], 'sub'],
  ]);
  assert.equal(events.filter(([name]) => name === 'collapsed').length, 2);
});

test('navigation clamps edges, uses direct target indexing, and ignores cross-axis arrows', () => {
  assert.equal(getMenuFocusTarget('horizontal', 'ArrowDown', 0, 3), undefined);
  assert.equal(getMenuFocusTarget('horizontal', 'ArrowRight', 2, 3), 2);
  assert.equal(getMenuFocusTarget('vertical', 'ArrowUp', -1, 3), 0);
  assert.equal(getMenuFocusTarget('pop', 'End', 0, 3), 2);
  assert.equal(getMenuFocusTarget('vertical', 'Home', 1, 0), undefined);
});

test('item keyboard default prevention precedes disabled guard and popup callbacks keep order', () => {
  const events: string[] = [];
  activateMenuItemKey(
    {
      key: 'Enter',
      preventDefault() {
        events.push('prevent');
      },
    } as KeyboardEvent,
    (event) =>
      activateMenuItem(
        event,
        true,
        () => events.push('select'),
        () => events.push('click'),
      ),
  );
  assert.deepEqual(events, ['prevent']);
  activatePopupMenu({
    key: 'sub',
    level: 1,
    selectable: true,
    onSubmenu: () => events.push('open'),
    onSelect: () => events.push('select'),
  });
  selectPopupMenuItem(
    'leaf',
    () => events.push('leaf'),
    () => events.push('close'),
  );
  assert.deepEqual(events, ['prevent', 'open', 'select', 'leaf', 'close']);
  assert.deepEqual(getMenuPopupMaxHeight(NaN), { maxHeight: 'unset' });
  assert.deepEqual(getMenuPopupMaxHeight(0), { maxHeight: '0px' });
  let selectable = true;
  activatePopupMenu({
    key: 'sub',
    level: 1,
    get selectable() {
      return selectable;
    },
    onSubmenu() {
      selectable = false;
    },
    onSelect() {
      throw new Error('must re-read selectable after submenu callback');
    },
  });
});

test('overflow retains mirror reservation, strict threshold, lazy measurement and pixel parsing', () => {
  function* nodes() {
    yield { type: 'mirror' as const, width: 20 };
    yield { type: 'item' as const, width: 70 };
    throw new Error('must not measure after overflow');
  }
  assert.equal(getMenuOverflowIndex(99, nodes()), -1);
  assert.equal(
    getMenuOverflowIndex(100, [
      { type: 'mirror', width: 20 },
      { type: 'overflow', width: 1000 },
      { type: 'item', width: 70 },
    ]),
    null,
  );
  assert.equal(roundMenuWidth(10.126), 10.13);
  assert.equal(parseMenuMargin('auto'), 0);
  assert.equal(parseMenuMargin('-2px'), -2);
});
