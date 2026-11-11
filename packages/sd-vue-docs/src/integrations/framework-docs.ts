import type { AstroIntegration } from 'astro';

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { generateFrameworkDocs } from '../../scripts/framework-docs.ts';

export function frameworkDocs(): AstroIntegration {
  return {
    name: 'sd-design:shared-framework-docs',
    hooks: {
      'astro:config:setup': async ({ command, logger }) => {
        generateFrameworkDocs();
        const root = resolve(import.meta.dirname, '../..');
        if (
          (command === 'dev' || command === 'build') &&
          [
            'public/vendor/sd-web-vue/deps/import-map.json',
            'public/vendor/sd-web-vue/dist/sd.css',
            'public/vendor/sd-web-react/import-map.json',
            'public/vendor/sd-web-react/types.json',
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
