import assert from 'node:assert/strict';
import test from 'node:test';

import componentsData from '../data/components.json' with { type: 'json' };
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

test('calendar, trigger and upstream props survive extraction without losing types', async () => {
  const map = await buildApiMap();
  const calendar = map.get('components/calendar')?.get('sd-calendar');
  assert.ok(calendar);
  assert.equal(calendar.props.length, 44);
  assert.equal(calendar.props.find((prop) => prop.name === 'events')?.type, 'CalendarEventInput[]');
  assert.equal(calendar.props.find((prop) => prop.name === 'time-step')?.default, '60');
  assert.ok(calendar.events.some((event) => event.name === 'event-created'));
  assert.ok(calendar.slots.some((slot) => slot.name === 'cell'));

  const trigger = map.get('components/trigger')?.get('sd-trigger');
  assert.ok(trigger);
  assert.equal(trigger.props.find((prop) => prop.name === 'popup-visible')?.type, 'boolean');
  assert.equal(trigger.props.find((prop) => prop.name === 'position')?.default, "'bottom'");
  assert.equal(
    trigger.props.find((prop) => prop.name === 'popup-visible')?.description.en,
    'Whether the popup is visible (controlled)',
  );
  assert.ok(trigger.slots.some((slot) => slot.name === 'content'));

  const markdown = map.get('components/markdown-render')?.get('sd-markdown-render');
  assert.ok(markdown);
  assert.equal(markdown.props.find((prop) => prop.name === 'content')?.type, 'string | undefined');
  assert.equal(
    markdown.props.find((prop) => prop.name === 'nodes')?.type,
    'BaseNode[] | undefined',
  );
  // An upstream-owned default must not be invented by MCP.
  assert.equal(markdown.props.find((prop) => prop.name === 'content')?.default, '');
  assert.ok(markdown.events.some((event) => event.name === 'copy-code'));
  const copy = map.get('components/copy')?.get('sd-copy');
  assert.equal(
    copy?.props.find((prop) => prop.name === 'tooltip-props')?.type,
    "TooltipInstance['$props']",
  );
});

test('clamp variants expose their own props, slots and generic-component events', async () => {
  const clamp = (await buildApiMap()).get('components/clamp');
  assert.ok(clamp);
  const line = clamp.get('sd-line-clamp');
  const rich = clamp.get('sd-rich-line-clamp');
  const inline = clamp.get('sd-inline-clamp');
  const wrap = clamp.get('sd-wrap-clamp');
  assert.ok(line && rich && inline && wrap);
  assert.ok(line.props.some((prop) => prop.name === 'text'));
  assert.ok(rich.props.some((prop) => prop.name === 'html'));
  assert.ok(!rich.props.some((prop) => prop.name === 'text'));
  assert.ok(inline.props.some((prop) => prop.name === 'split'));
  assert.ok(!inline.props.some((prop) => prop.name === 'expanded'));
  assert.ok(wrap.props.some((prop) => prop.name === 'items'));
  assert.ok(wrap.slots.some((slot) => slot.name === 'item'));
  assert.ok(wrap.events.some((event) => event.name === 'update:expanded'));
  assert.ok(wrap.events.some((event) => event.name === 'clampchange'));
});

test('services expose existing configuration and methods without pretending to be SFCs', async () => {
  const map = await buildApiMap();
  for (const name of ['message', 'notification']) {
    const api = map.get(`components/${name}`)?.get(`sd-${name}`);
    assert.ok(api);
    assert.deepEqual(api.props, []);
    assert.equal(api.config?.find((field) => field.name === 'content')?.description.en, 'Content');
    assert.ok(
      api.config?.find((field) => field.name === 'onClose')?.type.includes('number | string'),
    );
    assert.ok(api.methods?.some((method) => method.name === 'success'));
    assert.ok(api.methods?.some((method) => method.name === 'clear'));
    assert.ok(!api.methods?.some((method) => method.name === 'install'));
  }
});

test('discovers new public contracts without component names or file paths in a registry', async () => {
  const { mkdtemp, mkdir, writeFile, symlink, rm } = await import('node:fs/promises');
  const { tmpdir } = await import('node:os');
  const path = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const { readTypeApi } = await import('../scripts/type-api.ts');
  const root = await mkdtemp(path.join(tmpdir(), 'sd-mcp-contracts-'));
  try {
    await symlink(
      fileURLToPath(new URL('../../web-vue/node_modules', import.meta.url)),
      path.join(root, 'node_modules'),
      'dir',
    );
    const files = {
      'components/index.ts': `export { default as Planner } from './planner';
        export { default as ToastService } from './toast-service';
        export { Viewport, ClipLabel } from './clipping';
        export { default as LivePanel } from './live-panel';`,
      'components/planner/index.ts': `import _Planner from './screen.vue'; export default _Planner;`,
      'components/planner/screen.vue': `<script setup lang="ts">
        import { options } from './core/custom-options';
        defineOptions({ name: 'Planner' });
        defineProps(options);
      </script>`,
      'components/planner/core/custom-options.ts': `export const options = {
        windowSize: { type: Number, default: 3 },
        label: { type: String, default: 'today' },
      };`,
      'components/live-panel/index.ts': `import _LivePanel from './view.vue'; export default _LivePanel;`,
      'components/live-panel/view.vue': `<script setup lang="ts">
        type Settings = { active?: boolean };
        defineOptions({ name: 'LivePanel' });
        defineProps<Settings>();
      </script>`,
      'components/toast-service/index.ts': `export interface ToastServiceConfig { duration?: number; }
        export interface ToastServiceMethod { notify(config: ToastServiceConfig): void; }
        declare const service: ToastServiceMethod; export default service;`,
      'components/clipping/index.ts': `export interface ViewportProps { height?: number; }
        export interface ViewportSlots { body(): unknown; }
        export interface HiddenProps { secret: string; }
        export interface ClipLabelProps { text: string; }
        declare const Viewport: new () => { $emit(event: 'resize'): void };
        declare const ClipLabel: new () => { $props: ClipLabelProps };
        export { Viewport, ClipLabel };`,
    };
    for (const [file, content] of Object.entries(files)) {
      await mkdir(path.dirname(path.join(root, file)), { recursive: true });
      await writeFile(path.join(root, file), content);
    }
    const apis = await readTypeApi(root, [
      { dirname: 'components/planner', file: path.join(root, 'components/planner/screen.vue') },
      { dirname: 'components/live-panel', file: path.join(root, 'components/live-panel/view.vue') },
    ]);
    assert.deepEqual(
      [...apis.keys()],
      ['planner', 'toast-service', 'viewport', 'clip-label', 'live-panel'],
    );
    const planner = apis.get('planner');
    assert.equal(planner?.props.find((prop) => prop.name === 'window-size')?.type, 'number');
    assert.equal(planner?.props.find((prop) => prop.name === 'window-size')?.default, '3');
    assert.equal(planner?.props.find((prop) => prop.name === 'label')?.default, "'today'");
    assert.equal(apis.get('toast-service')?.config?.[0].name, 'duration');
    assert.equal(apis.get('toast-service')?.methods?.[0].name, 'notify');
    assert.equal(apis.get('viewport')?.dirname, 'components/clipping');
    assert.equal(apis.get('viewport')?.slots[0].name, 'body');
    assert.equal(apis.get('viewport')?.events[0].name, 'resize');
    assert.equal(apis.get('clip-label')?.props[0].name, 'text');
    assert.equal(apis.get('live-panel')?.props[0].type, 'boolean | undefined');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('every published prop declared in our own source carries a description', async () => {
  // 交付面是 data/components.json：只有文档侧边栏覆盖的组件会发布，
  // 其余子组件不进入 MCP 索引，因此不在这里断言。
  const published = componentsData.components;
  // 这些组件的 props 来自第三方包（markstream-vue / vue-clamp），仓库内没有声明处
  const upstream = new Set([
    'sd-markdown-render',
    'sd-line-clamp',
    'sd-rich-line-clamp',
    'sd-inline-clamp',
    'sd-wrap-clamp',
  ]);
  const missing: string[] = [];
  for (const entry of published) {
    if (upstream.has(entry.name)) continue;
    for (const prop of entry.props) {
      if (!prop.description.en && !prop.description.zh) missing.push(`${entry.name}.${prop.name}`);
    }
  }
  assert.deepEqual(missing, [], `undocumented published props: ${missing.slice(0, 20).join(', ')}`);
});

test('keeps the third-party components listed so the gap stays visible', () => {
  const published = componentsData.components;
  for (const name of ['sd-markdown-render', 'sd-line-clamp', 'sd-wrap-clamp']) {
    assert.ok(
      published.some((entry) => entry.name === name),
      `${name} should still be published`,
    );
  }
});

test('recovers props that docgen alone cannot see', async () => {
  const map = await buildApiMap();
  const props = (dir: string, tag: string) => map.get(dir)?.get(tag)?.props ?? [];
  // 这些组件此前在 MCP 里是空的：props 写在外部接口/对象或指向第三方类型
  assert.equal(props('components/calendar', 'sd-calendar').length, 44);
  assert.equal(props('components/select', 'sd-select').length, 45);
  assert.equal(props('components/cascader', 'sd-cascader').length, 45);
  assert.equal(props('components/tree', 'sd-tree').length, 75);
  assert.ok(props('components/markdown-render', 'sd-markdown-render').length > 0);
});

test('never publishes TypeScript-internal type kind names', async () => {
  const map = await buildApiMap();
  for (const group of map.values()) {
    for (const [tag, api] of group) {
      for (const prop of api.props ?? []) {
        assert.ok(
          !/^TS[A-Z]/.test(prop.type.trim()),
          `${tag}.${prop.name} exposes internal type kind ${prop.type}`,
        );
      }
    }
  }
  const breadcrumb = map.get('components/breadcrumb')?.get('sd-breadcrumb');
  assert.equal(
    breadcrumb?.props.find((prop) => prop.name === 'custom-url')?.type,
    '((paths: string[]) => string) | undefined',
  );
});
