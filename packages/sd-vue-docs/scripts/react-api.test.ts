import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildReactApiManifest } from './build-react-api-manifest.ts';
import { parseDocument, renderDocument } from './framework-docs.ts';

test('API tables use the public React contract and leave slot context tables intact', () => {
  const api = buildReactApiManifest();
  const source = `---
title: Sender
---
## API
### 属性
| 参数名 | 描述 | 类型 | 默认值 |
| --- | --- | --- | --- |
| model-value (v-model) | 输入值 | string | - |
### 事件
| 事件名 | 描述 | 参数 |
| --- | --- | --- |
| submit | 提交 | value |
### 插槽
| 插槽名 | 描述 | 参数 |
| --- | --- | --- |
| footer | 底部 | actions |
#### 上下文
| 名称 | 描述 | 类型 |
| --- | --- | --- |
| actions | 操作 | SenderActionContext |
`;
  const gaps: Parameters<typeof renderDocument>[4] = [];
  const output = renderDocument(source, 'react', 'components/sender', api, gaps);
  assert.deepEqual(gaps, []);
  assert.match(output, /`value`.*受控/);
  assert.match(output, /`onSubmit`/);
  assert.match(output, /`slots.footer`/);
  assert.match(output, /\| actions \| 操作 \| SenderActionContext \|/);
  assert.doesNotMatch(output, /\| submit \|/);
  const tables = parseDocument(output).children!.filter((node) => node.type === 'table');
  assert.equal(tables.length, 4);
  for (const table of tables) {
    const columns = table.children![0]!.children!.length;
    assert.ok(table.children!.length > 1, 'API data rows remain inside the table');
    for (const row of table.children!) assert.equal(row.children!.length, columns);
  }
});

test('React prose and inline examples use controlled props and native JSX', () => {
  const source =
    '---\ntitle: Button\n---\n通过 `:ellipsis="false"` 关闭省略，`ellipsis-expand-trigger="click"` 展开。\n\n使用 `#tooltip` 插槽，监听 `@click`。模式值为 `performant-ellipsis`。';
  const output = renderDocument(source, 'react', 'components/button', buildReactApiManifest());
  assert.match(output, /`ellipsis=\{false\}`/);
  assert.match(output, /`ellipsisExpandTrigger="click"`/);
  assert.match(output, /`tooltipContent` 内容属性/);
  assert.match(output, /`onClick`/);
  assert.match(output, /`performant-ellipsis`/);
  assert.doesNotMatch(output, /插槽|:ellipsis|@click/);
});

test('template event signatures map to their actual React index signature', () => {
  const source = `---\ntitle: Test\n---\n## API\n### 事件\n| 事件名 | 描述 | 参数 |\n| --- | --- | --- |\n| update:field | 修改 | string |`;
  const gaps: Parameters<typeof renderDocument>[4] = [];
  const output = renderDocument(
    source,
    'react',
    'components/test',
    {
      Test: { '`on${string}Change`': '(value: string) => void' },
    },
    gaps,
  );
  assert.deepEqual(gaps, []);
  assert.match(output, /onFieldChange/);
});

test('slot bags do not capture controlled bindings or unrelated inline identifiers', () => {
  const source =
    '---\ntitle: Sender\n---\n通过 `v-model` 绑定内容；调用 `setJSON`，传入 `prefix` 插槽。';
  const output = renderDocument(source, 'react', 'components/sender', {
    Sender: {
      slots: 'Record<string, unknown>',
      value: 'string',
      onValueChange: '(value: string) => void',
    },
  });
  assert.match(output, /`value \/ onValueChange`/);
  assert.match(output, /`setJSON`/);
  assert.match(output, /`slots.prefix` 内容属性/);
  assert.doesNotMatch(output, /slots\.v-model|slots\.setJSON/);
});
