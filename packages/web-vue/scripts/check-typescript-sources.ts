import glob from 'fast-glob';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'vue/compiler-sfc';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const files = await glob(
  ['*.{js,jsx,mjs,cjs}', 'scripts/**/*.{js,jsx,mjs,cjs,vue}', 'packages/**/*.{js,jsx,mjs,cjs,vue}'],
  {
    cwd: root,
    dot: true,
    ignore: [
      '**/node_modules/**',
      '**/dist/**',
      '**/es/**',
      '**/public/**',
      '**/.astro/**',
      '**/.temp-types/**',
    ],
  },
);
const errors: string[] = [];
for (const file of files) {
  if (!file.endsWith('.vue')) {
    errors.push(`${file}: 项目源码应使用 TypeScript`);
    continue;
  }
  const { descriptor } = parse(await readFile(resolve(root, file), 'utf8'), { filename: file });
  if (descriptor.script || (descriptor.scriptSetup && descriptor.scriptSetup.lang !== 'ts')) {
    errors.push(`${file}: Vue 逻辑应使用 <script setup lang="ts">`);
  }
}
if (errors.length) throw new Error(errors.join('\n'));
console.log(
  `TypeScript source check passed (${files.filter((file) => file.endsWith('.vue')).length} Vue files).`,
);
