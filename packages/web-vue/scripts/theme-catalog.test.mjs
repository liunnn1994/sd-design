import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { generateThemeCatalog } from './theme-catalog.mjs';

test('新增组件从样式声明自动进入主题目录，重复生成结果稳定', async () => {
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'sd-theme-catalog-'));
  try {
    await fs.cp(new URL('../components/style/', import.meta.url), path.join(temporary, 'style'), {
      recursive: true,
    });
    await fs.mkdir(path.join(temporary, 'config-provider'));
    await fs.mkdir(path.join(temporary, 'future-widget/style'), { recursive: true });
    const tokenPath = path.join(temporary, 'future-widget/style/token.scss');
    await fs.writeFile(
      tokenPath,
      "@use '@style/theme/global.scss' as global;\n$future-widget-color: global.$color-primary-6;\n$future-widget-radius: 12px;\n$accent2: blue;\n$radius: 4px;\n",
    );
    await generateThemeCatalog(temporary);
    const first = await fs.readFile(tokenPath, 'utf8');
    const catalogue = JSON.parse(
      await fs.readFile(path.join(temporary, 'config-provider/theme-catalog.json'), 'utf8'),
    );
    assert.equal(catalogue.components[0].name, 'future-widget');
    assert.deepEqual(
      catalogue.components[0].tokens.map((token) => token.key),
      ['future-widget-color', 'future-widget-radius', 'accent-2', 'radius'],
    );
    assert.match(first, /theme-runtime\.token\(\s*'future-widget',\s*'future-widget-radius'/);
    assert.deepEqual(catalogue.components[0].tokens[0].dependencies, ['color-primary-6']);
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
