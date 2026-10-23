import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { generateThemeCatalog } from './theme-catalog.ts';

test('ModelSelector 的组件名不会被误判为选择器配置', async () => {
  for (const file of [
    '../../web-core/styles/config-provider/theme-catalog.json',
    '../components/config-provider/theme-catalog.json',
  ]) {
    const catalog = JSON.parse(await fs.readFile(new URL(file, import.meta.url), 'utf8'));
    const component = catalog.components.find(
      (item: { name: string }) => item.name === 'model-selector',
    );
    assert.ok(component);
    assert.ok(
      component.tokens.some((token: { key: string }) => token.key === 'model-selector-item-height'),
    );
  }
});

test('SkeletonReveal 从 Core 进入两份主题目录', async () => {
  const paths = [
    '../../web-core/styles/config-provider/theme-catalog.json',
    '../components/config-provider/theme-catalog.json',
  ];
  for (const file of paths) {
    const catalog = JSON.parse(await fs.readFile(new URL(file, import.meta.url), 'utf8'));
    const component = catalog.components.find(
      (item: { name: string }) => item.name === 'skeleton-reveal',
    );
    assert.deepEqual(
      component.tokens.map((token: { key: string }) => token.key),
      ['skeleton-reveal-stroke', 'skeleton-reveal-stroke-width'],
    );
    assert.deepEqual(component.tokens[0].dependencies, ['color-text-3']);
    assert.equal(component.tokens[1].value, '1px');
  }
});

test('新增组件从样式声明自动进入主题目录，重复生成结果稳定', async () => {
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'sd-theme-catalog-'));
  try {
    await fs.cp(
      new URL('../../web-core/styles/style/', import.meta.url),
      path.join(temporary, 'style'),
      {
        recursive: true,
      },
    );
    await fs.mkdir(path.join(temporary, 'config-provider'));
    await fs.mkdir(path.join(temporary, 'future-widget/style'), { recursive: true });
    const tokenPath = path.join(temporary, 'future-widget/style/token.scss');
    await fs.writeFile(
      tokenPath,
      "@use '@style/theme/global.scss' as global;\n$future-widget-color: global.$color-primary-6;\n$future-widget-radius: 12px;\n$accent2: blue;\n$radius: 4px;\n$future-widget-color: global.$color-success-6;\n",
    );
    await generateThemeCatalog(temporary);
    const first = await fs.readFile(tokenPath, 'utf8');
    const catalogue: {
      components: { name: string; tokens: { key: string; dependencies: string[] }[] }[];
    } = JSON.parse(
      await fs.readFile(path.join(temporary, 'config-provider/theme-catalog.json'), 'utf8'),
    );
    assert.equal(catalogue.components[0].name, 'future-widget');
    assert.deepEqual(
      catalogue.components[0].tokens.map((token: { key: string }) => token.key),
      ['future-widget-color', 'future-widget-radius', 'accent-2', 'radius'],
    );
    assert.match(first, /theme-runtime\.token\(\s*'future-widget',\s*'future-widget-radius'/);
    assert.deepEqual(catalogue.components[0].tokens[0].dependencies, ['color-success-6']);
    await generateThemeCatalog(temporary);
    assert.equal(await fs.readFile(tokenPath, 'utf8'), first);
    // css-variables 的 var() 包装必须幂等：oxfmt 折行后的长值不得再次包裹。
    const cssVariablesPath = path.join(temporary, 'style/theme/css-variables.scss');
    const cssVariables = await fs.readFile(cssVariablesPath, 'utf8');
    assert.doesNotMatch(cssVariables, /var\(\s*--color-neutral-1,\s*var\(--color-neutral-1/);
    await generateThemeCatalog(temporary);
    assert.equal(await fs.readFile(cssVariablesPath, 'utf8'), cssVariables);
  } finally {
    await fs.rm(temporary, { recursive: true, force: true });
  }
});
