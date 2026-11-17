import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createLiveCodesConfig, createLiveCodesTheme } from '../src/browser-repl/livecodes.ts';

const base = {
  baseUrl: 'https://docs.example.com/design/',
  imports: { react: 'vendor/react.js' },
  types: { '@sdata/web-react': 'https://docs.example.com/design/vendor/types/index.d.ts' },
  stylesheets: ['vendor/sd.css'],
  css: '',
  dark: true,
  mainFile: 'Example.tsx',
};

test('keeps React source intact and resolves local resources for the official Monaco playground', () => {
  const source = 'export default function App() { return <button>编辑</button>; }';
  const config = createLiveCodesConfig({ ...base, framework: 'react', source });
  assert.equal(config.editor, 'monaco');
  assert.equal(config.appLanguage, 'zh-CN');
  assert.deepEqual(config.types, base.types);
  assert.deepEqual(config.editorTheme, ['vs@light', 'vs-dark@dark']);
  assert.equal(config.mode, 'full');
  assert.equal(config.script?.content, source);
  assert.equal(config.script?.language, 'tsx');
  assert.deepEqual(config.imports, { react: 'https://docs.example.com/design/vendor/react.js' });
  assert.deepEqual(config.stylesheets, ['https://docs.example.com/design/vendor/sd.css']);
  assert.equal(config.htmlAttrs?.['sd-theme'], 'dark');
  assert.deepEqual(createLiveCodesTheme(false).htmlAttrs, { 'lang': 'zh-CN', 'sd-theme': 'light' });
});

test('makes globally registered Vue demo components explicit in the editable SFC', () => {
  const source = '<template><sd-button>测试</sd-button><sd-button /></template>';
  const config = createLiveCodesConfig({
    ...base,
    framework: 'vue',
    source,
    components: {
      exports: {
        Button: { importMode: 'default', specifier: '@sdata/web-vue/es/button/index.js' },
      },
    },
  });
  assert.equal(config.markup?.language, 'vue');
  assert.ok(config.markup?.content?.endsWith(source));
  assert.equal(config.markup?.content?.match(/import SdButton/g)?.length, 1);
  assert.match(config.markup?.content ?? '', /<script setup>\nimport SdButton/);
  assert.equal(config.markup?.hiddenContent, undefined);
});

test('removes the docs JSX directive that opts out of LiveCodes automatic mounting', () => {
  const source =
    'export default function Example() { const count: number = 1; return <div>{count}</div>; }';
  const config = createLiveCodesConfig({
    ...base,
    framework: 'react',
    source: `/** @jsxImportSource react */\n${source}`,
  });
  assert.equal(config.script?.content, source);
});

test('uses an existing setup block and preserves existing component and icon imports', () => {
  const source = `<script setup lang="ts">import SdButton from '@sdata/web-vue/es/button/index.js'; import { IconPlus } from '@sdata/web-vue/es/icon.js';</script><template><sd-button><icon-plus /></sd-button></template>`;
  const config = createLiveCodesConfig({
    ...base,
    framework: 'vue',
    source,
    components: {
      exports: {
        Button: { importMode: 'default', specifier: '@sdata/web-vue/es/button/index.js' },
      },
    },
  });
  assert.equal(config.markup?.content, source);
  const injected = createLiveCodesConfig({
    ...base,
    framework: 'vue',
    source: '<script setup lang="ts">const count = 0;</script><template><icon-plus /></template>',
  });
  assert.match(injected.markup?.content ?? '', /<script setup lang="ts">\nimport \{ IconPlus \}/);
  assert.equal(injected.markup?.content?.match(/<script/g)?.length, 1);
});
