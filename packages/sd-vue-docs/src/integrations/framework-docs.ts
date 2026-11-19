import type { AstroIntegration } from 'astro';
import type { IncomingMessage, ServerResponse } from 'node:http';

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { send } from 'vite';

import { generateFrameworkDocs } from '../../scripts/framework-docs.ts';

export function frameworkDocs(): AstroIntegration {
  return {
    name: 'sd-design:shared-framework-docs',
    hooks: {
      'astro:config:setup': async ({ command, logger }) => {
        if (command === 'preview') return;
        generateFrameworkDocs();
        const root = resolve(import.meta.dirname, '../..');
        if (
          (command === 'dev' || command === 'build') &&
          [
            'public/vendor/livecodes/index.html',
            'public/vendor/livecodes/livecodes/sd-vue-language.js',
            'public/vendor/livecodes/livecodes/sd-vue-html-data.json',
            'public/vendor/sd-web-vue/types-map.json',
            'public/vendor/sd-web-react/types-map.json',
            'public/vendor/sd-web-vue/deps/import-map.json',
            'public/vendor/sd-web-vue/dist/sd.css',
            'public/vendor/sd-web-vue/vue.runtime.esm-browser.js',
            'public/vendor/sd-web-react/import-map.json',
            'public/vendor/sd-web-react/type-reference-manifest.json',
          ].some((file) => !existsSync(resolve(root, file)))
        ) {
          logger.info('Preparing local Vue and React playground assets…');
          await new Promise<void>((done, reject) => {
            const child = spawn('pnpm', ['run', 'docs:vendor'], {
              cwd: root,
              stdio: 'inherit',
              shell: process.platform === 'win32',
            });
            child.once('error', reject);
            child.once('exit', (code) =>
              code === 0 ? done() : reject(new Error(`docs:vendor exited with ${code}`)),
            );
          });
        }
      },
      'astro:server:setup': ({ server }) => {
        const vendor = resolve(import.meta.dirname, '../../public/vendor');
        // The official sandbox loads public compiler scripts cross-origin. Keep source modules protected.
        server.httpServer?.once('listening', () =>
          server.middlewares.stack.unshift({
            route: '',
            handle: async (
              request: IncomingMessage,
              response: ServerResponse,
              next: () => void,
            ) => {
              const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
              if (
                !pathname.startsWith('/vendor/') ||
                !['GET', 'HEAD'].includes(request.method ?? '')
              )
                return next();
              const file = resolve(vendor, pathname.slice('/vendor/'.length));
              if (!file.startsWith(`${vendor}/`) && !file.startsWith(`${vendor}\\`)) return next();
              const type = file.endsWith('.js')
                ? 'js'
                : file.endsWith('.css')
                  ? 'css'
                  : file.endsWith('.wasm')
                    ? 'application/wasm'
                    : undefined;
              if (!type) return next();
              try {
                send(request, response, await readFile(file), type, {
                  headers: { 'Access-Control-Allow-Origin': '*' },
                });
              } catch {
                next();
              }
            },
          }),
        );
        const source = resolve(import.meta.dirname, '../content/shared');
        server.watcher.add(source);
        let queued = false;
        const regenerate = (file: string) => {
          if (!file.replaceAll('\\', '/').startsWith(source.replaceAll('\\', '/'))) return;
          if (queued) return;
          queued = true;
          queueMicrotask(() => {
            queued = false;
            try {
              generateFrameworkDocs();
            } catch (error) {
              server.config.logger.error(String(error));
            }
          });
        };
        server.watcher.on('add', regenerate).on('change', regenerate).on('unlink', regenerate);
        server.httpServer?.once('close', () => {
          server.watcher.off('add', regenerate).off('change', regenerate).off('unlink', regenerate);
        });
      },
    },
  };
}
