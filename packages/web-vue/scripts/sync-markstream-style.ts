import type { PackageJson } from 'type-fest';

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// markstream-vue 是纯 ESM 包，既未在 exports 中暴露 package.json，也没有 require 条件；
// 从已公开的 CSS 子路径向上找到它自己的清单。
// 版本从锁定安装包读取，避免依赖升级后生成文件头与实际 CSS 不一致。
async function readPackageJson(fromSubpath: string, name: string) {
  let directory = dirname(fileURLToPath(import.meta.resolve(fromSubpath)));
  for (;;) {
    try {
      const manifest: PackageJson = JSON.parse(
        await readFile(join(directory, 'package.json'), 'utf8'),
      );
      if (manifest.name === name) return manifest;
    } catch {}
    const parent = dirname(directory);
    if (parent === directory) throw new Error(`Cannot locate package.json for ${name}`);
    directory = parent;
  }
}
const { version } = await readPackageJson('markstream-vue/index.css', 'markstream-vue');
const banner = `/* Generated from markstream-vue@${version} (MIT). Do not edit. */\n@layer sd-design, markstream;\n@layer markstream {\n`;

// 上游 CSS 由 Tailwind 扫描产出，把未加作用域的 `.container` 工具类一起打进了产物。
// 上游组件自身从不输出这个类（CodeBlockNode 里的 "container" 只是 ref 名），
// 但全量 CSS 会随组件库进入每个应用，与消费方自己的同名工具类冲突。
// 这里把它收敛到 .markstream-vue 作用域内：行为不变，但不再泄漏为全局样式。
function scopeGlobalUtilities(css: string) {
  return css.replace(/(?<=[{},\s])(\.\\?!?container)(?![\w-])/g, '.markstream-vue $1');
}

const css = scopeGlobalUtilities(
  await readFile(fileURLToPath(import.meta.resolve('markstream-vue/index.css')), 'utf8'),
);
// 保持生成样式与精确锁定的依赖一致；发布 SCSS 和 CSS 均包含此文件。
await writeFile(
  new URL('../components/markdown-render/style/upstream.css', import.meta.url),
  `${banner}${css}\n}\n`,
);

for (const name of ['index.px.css', 'index.tailwind.css']) {
  const source = scopeGlobalUtilities(
    await readFile(fileURLToPath(import.meta.resolve(`markstream-vue/${name}`)), 'utf8'),
  );
  await writeFile(
    new URL(`../components/markdown-render/style/${name}`, import.meta.url),
    `${banner}${source}\n}\n`,
  );
}
