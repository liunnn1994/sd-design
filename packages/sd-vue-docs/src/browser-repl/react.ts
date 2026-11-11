import { init, parse } from 'es-module-lexer';
import { transform } from 'sucrase';

export interface ReactCompilation {
  modules: Record<string, string>;
  styles: string[];
  mainFile: string;
}

export function resolvePlaygroundImport(
  specifier: string,
  importer: string,
  files: Record<string, string>,
) {
  const pathname = new URL(specifier, `https://playground.invalid/${importer}`).pathname.slice(1);
  const candidates = [
    pathname,
    `${pathname}.tsx`,
    `${pathname}.ts`,
    `${pathname}.jsx`,
    `${pathname}.js`,
    `${pathname}/index.tsx`,
    `${pathname}/index.ts`,
  ];
  if (pathname.endsWith('.js'))
    candidates.push(pathname.slice(0, -3) + '.ts', pathname.slice(0, -3) + '.tsx');
  const resolved = candidates.find((file) => file in files);
  if (!resolved) throw new Error(`无法解析 ${importer} 中的 ${specifier}`);
  return resolved;
}

export async function compileReactFiles(
  files: Record<string, string>,
  mainFile: string,
): Promise<ReactCompilation> {
  await init;
  if (!(mainFile in files)) throw new Error(`缺少主文件 ${mainFile}`);
  const modules: Record<string, string> = {};
  const styles: string[] = [];
  for (const [filename, source] of Object.entries(files)) {
    if (filename.endsWith('.css')) {
      styles.push(source);
      continue;
    }
    if (filename.endsWith('.json')) {
      modules[filename] = `export default ${JSON.stringify(JSON.parse(source))};`;
      continue;
    }
    let code = transform(source, {
      transforms: ['typescript', 'jsx'],
      filePath: filename,
      jsxRuntime: 'automatic',
      production: true,
    }).code;
    const [imports] = parse(code);
    const replacements: { start: number; end: number; text: string }[] = [];
    for (const entry of imports) {
      if (!('specifier' in entry) || !entry.specifier) continue;
      const specifier = entry.specifier;
      if (/\.(?:css|scss)$/.test(specifier)) {
        if (specifier.startsWith('.')) {
          const file = resolvePlaygroundImport(specifier, filename, files);
          if (!file.endsWith('.css'))
            throw new Error('自定义样式文件请使用 CSS；组件 SCSS 已由共享样式包提供。');
        }
        replacements.push({ start: entry.importStart, end: entry.importEnd, text: '' });
      } else if (specifier.startsWith('.')) {
        const target = `@demo/${resolvePlaygroundImport(specifier, filename, files)}`;
        replacements.push({
          start: entry.start,
          end: entry.end,
          text: entry.type === 'dynamic' ? JSON.stringify(target) : target,
        });
      }
    }
    for (const edit of replacements.sort((a, b) => b.start - a.start))
      code = code.slice(0, edit.start) + edit.text + code.slice(edit.end);
    modules[filename] = code;
  }
  return { modules, styles, mainFile };
}

const inlineJson = (value: unknown) => JSON.stringify(value).replaceAll('<', '\\u003c');

export function createReactPreview(
  compilation: ReactCompilation,
  imports: Record<string, string>,
  {
    theme,
    stylesheets,
    channel,
  }: { theme: 'light' | 'dark'; stylesheets: string[]; channel: string },
) {
  const urls: string[] = [];
  const mappings = { ...imports };
  for (const [filename, code] of Object.entries(compilation.modules)) {
    const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
    urls.push(url);
    mappings[`@demo/${filename}`] = url;
  }
  const document = `<!doctype html><html><head><meta charset="utf-8">
${stylesheets.map((href) => `<link rel="stylesheet" href="${href.replaceAll('&', '&amp;').replaceAll('"', '&quot;')}">`).join('\n')}
<style>body{margin:0;padding:16px;font-family:Inter,Segoe UI,sans-serif;background:#fff;color:#1d2129}body[sd-theme="dark"]{background:#141414;color:#f2f3f5}#app{min-height:40px}</style>
<style>${compilation.styles.join('\n').replaceAll('</style', '<\\/style')}</style>
<script>
globalThis.process = { env: { NODE_ENV: 'production' } }; globalThis.global = globalThis;
const channel = ${inlineJson(channel)};
const report = error => parent.postMessage({ type: 'sd-react-repl:error', channel, message: String(error?.stack || error?.message || error) }, '*');
window.addEventListener('error', event => report(event.error || event.message || '预览资源加载失败'));
window.addEventListener('unhandledrejection', event => report(event.reason));
</script>
<script type="importmap">${inlineJson({ imports: mappings })}</script>
</head><body${theme === 'dark' ? ' sd-theme="dark"' : ''}><div id="app"></div>
<script type="module">
import React from 'react';
import { createRoot } from 'react-dom/client';
import Example from ${inlineJson(`@demo/${compilation.mainFile}`)};
try {
  const root = createRoot(document.getElementById('app'), { onUncaughtError: report });
  root.render(React.createElement(Example));
  window.addEventListener('pagehide', () => root.unmount(), { once: true });
  parent.postMessage({ type: 'sd-react-repl:ready', channel }, '*');
} catch (error) { report(error); }
</script></body></html>`;
  return { document, dispose: () => urls.forEach((url) => URL.revokeObjectURL(url)) };
}
