import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  compileReactFiles,
  createReactPreview,
  resolvePlaygroundImport,
} from '../src/browser-repl/react.ts';

test('compiles real TSX and rewrites multi-file imports without changing string literals', async () => {
  const result = await compileReactFiles(
    {
      'src/App.tsx': `import { Button } from '@sdata/web-react';
import '@sdata/web-react/styles/button.scss';
import { label } from './data';
const text: string = "import './not-a-file'";
export default function App() { return <Button title={text}>{label}</Button>; }`,
      'src/data.ts': `export const label: string = '运行成功';`,
    },
    'src/App.tsx',
  );
  assert.match(result.modules['src/App.tsx']!, /react\/jsx-runtime/);
  assert.match(result.modules['src/App.tsx']!, /@demo\/src\/data.ts/);
  assert.match(result.modules['src/App.tsx']!, /import '\.\/not-a-file'/);
  assert.doesNotMatch(result.modules['src/App.tsx']!, /styles\/button.scss/);
  assert.doesNotMatch(result.modules['src/data.ts']!, /: string/);
});

test('reports syntax and missing dependency failures', async () => {
  await assert.rejects(compileReactFiles({ 'App.tsx': 'export default <' }, 'App.tsx'));
  await assert.rejects(
    compileReactFiles({ 'App.tsx': "import './missing';" }, 'App.tsx'),
    /无法解析/,
  );
});

test('resolves TS source for JS imports and previews local runtime with escaped import maps', async () => {
  assert.equal(
    resolvePlaygroundImport('./data.js', 'src/App.tsx', { 'src/data.ts': '' }),
    'src/data.ts',
  );
  const compilation = await compileReactFiles(
    { 'App.tsx': 'export default function App() { return <p>预览</p>; }' },
    'App.tsx',
  );
  const preview = createReactPreview(
    compilation,
    { react: '/vendor/react.js' },
    {
      theme: 'dark',
      stylesheets: ['/vendor/sd.css'],
      channel: '</script>untrusted',
    },
  );
  assert.match(preview.document, /sd-theme="dark"/);
  assert.match(preview.document, /vendor\/sd.css/);
  assert.match(preview.document, /createRoot/);
  assert.match(preview.document, /blob:/);
  assert.doesNotMatch(preview.document, /<\/script>untrusted/);
  preview.dispose();
});
