import { readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';

const require = createRequire(import.meta.url);

const WORKER_SPECIFIER = 'pdfjs-dist/build/pdf.worker.min.mjs';
const WORKER_ASSET = 'pdfjs-worker.min.mjs';
const WORKER_CHUNK_HINT = 'pdfjs-worker-url';

// vite 在 lib 构建下会把 `new URL(asset, import.meta.url)` 内联为 base64 data URL（无法 emit 成独立文件）。
// 本插件把 pdfjs-worker-url 块里内联的 worker data URL 还原为对独立 worker 文件的引用，
// 并把 worker 作为真实文件 emit 到 es/file-previewer/ 下，使其可被 HTTP/V8 缓存。
// 消费方的 vite/webpack 会解析该 `new URL` 并自动 emit 这个 worker 文件。
export default function pdfjsWorkerAssetPlugin() {
  let workerSource = '';

  return {
    name: 'sd:pdfjs-worker-asset',
    apply: 'build',
    buildStart() {
      workerSource = readFileSync(require.resolve(WORKER_SPECIFIER), 'utf8');
    },
    generateBundle(_options, bundle) {
      // generateBundle 在所有 renderChunk（含 vite 的资源内联）之后执行，
      // 此时 pdfjs-worker-url 块里已是内联的 worker data URL，把它还原为对独立 worker 文件的引用，
      // 由消费方打包器（vite/webpack）解析并 emit 该文件。
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type !== 'chunk') continue;
        if (!fileName.includes(WORKER_CHUNK_HINT)) continue;
        if (!chunk.code.includes('data:text/javascript;base64')) continue;
        chunk.code = chunk.code.replace(
          /new URL\("data:text\/javascript;base64,[^"]*",\s*(?:"" \+ )?import\.meta\.url\)/g,
          `new URL("./${WORKER_ASSET}", import.meta.url)`,
        );
      }
    },
    async writeBundle(options) {
      if (!workerSource) return;
      const outDir = options.dir ?? (options.file ? dirname(resolve(options.file)) : 'es');
      const target = join(outDir, 'file-previewer', WORKER_ASSET);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, workerSource);
    },
  };
}
