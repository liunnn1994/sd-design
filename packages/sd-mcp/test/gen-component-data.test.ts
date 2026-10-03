import assert from 'node:assert/strict';
import test from 'node:test';

import { buildApiMap, getComponentSources } from '../scripts/gen-component-data.ts';

test('components sharing a displayName keep their own API', async () => {
  const map = await buildApiMap();

  // menu/item.vue 与 timeline/item.vue 的 displayName 都是 Item。
  // 旧实现按 displayName 建全局索引，后解析的会覆盖先解析的；
  // 现在按组件目录分组，两者必须同时存在且内容不同。
  const menu = map.get('components/menu');
  const timeline = map.get('components/timeline');

  assert.ok(menu, 'components/menu should be indexed');
  assert.ok(timeline, 'components/timeline should be indexed');

  const menuItem = menu.get('sd-item');
  const timelineItem = timeline.get('sd-item');
  assert.ok(menuItem, 'components/menu should index its own item');
  assert.ok(timelineItem, 'components/timeline should index its own item');

  // 两者的 props 集合必须不同，否则说明仍然共用同一份数据
  assert.notDeepEqual(menuItem.props, timelineItem.props);
});

test('every source file is tracked under its own component directory', async () => {
  const sources = await getComponentSources();
  assert.ok(sources.length > 0);
  for (const { dirname, file } of sources) {
    assert.match(dirname, /^components\/[^/]+$/, `unexpected dirname: ${dirname}`);
    assert.ok(file.length > 0);
  }
});

test('a documented component resolves from its own directory', async () => {
  const map = await buildApiMap();
  // alert 有完整的 @zh/@en 注释，应当能取到 props
  const alert = map.get('components/alert')?.get('sd-alert');
  assert.ok(alert, 'sd-alert should resolve');
  assert.ok(alert.props.length > 0, 'sd-alert should expose props');
});
