import { defineConfig } from 'cypress';
import { basename, dirname } from 'node:path';
import { build } from 'vite';

import { docsE2eSpecPatterns } from './scripts/docs-e2e-specs.ts';

export default defineConfig({
  e2e: {
    baseUrl: 'http://127.0.0.1:5187',
    specPattern: 'tests/browser/*.cy.ts',
    excludeSpecPattern: docsE2eSpecPatterns,
    supportFile: false,
    setupNodeEvents(on) {
      on('before:browser:launch', (browser, launchOptions) => {
        if (
          process.platform === 'linux' &&
          browser.family === 'chromium' &&
          browser.name !== 'electron' &&
          browser.isHeadless
        ) {
          // Match the desktop hover capability used by Vue's Linux headless runs.
          launchOptions.args.push('--blink-settings=primaryHoverType=2,availableHoverTypes=2');
        }
        return launchOptions;
      });
      // Cypress's ts-loader requests one source map; TNB emits maps for every spec in the program.
      on('file:preprocessor', async (file) => {
        const result = await build({
          configFile: false,
          logLevel: 'error',
          build: {
            watch: file.shouldWatch ? {} : null,
            emptyOutDir: false,
            outDir: dirname(file.outputPath),
            sourcemap: 'inline',
            minify: false,
            lib: {
              entry: file.filePath,
              name: 'spec',
              formats: ['iife'],
              fileName: () => basename(file.outputPath),
            },
          },
        });
        if ('on' in result) {
          file.on('close', () => void result.close());
          await new Promise<void>((resolve, reject) => {
            let ready = false;
            result.on('event', (event) => {
              if (event.code === 'ERROR') reject(event.error);
              if (event.code === 'BUNDLE_END') void event.result.close();
              if (event.code === 'END') {
                if (ready) file.emit('rerun');
                ready = true;
                resolve();
              }
            });
          });
        }
        return file.outputPath;
      });
    },
  },
  video: false,
  // Match the Vue suite's Cypress 16 browser-memory setting for long runs.
  manageBrowserMemory: false,
});
