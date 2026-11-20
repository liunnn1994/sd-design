import { defineConfig } from 'cypress';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import path from 'node:path';

const realWebLLM = process.env.SD_REAL_WEBLLM === '1';

export default defineConfig({
  video: false,
  viewportWidth: 1600,
  viewportHeight: 1100,
  e2e: {
    baseUrl: 'http://localhost:4321',
    specPattern: realWebLLM
      ? 'cypress/e2e/home-local-chat-real.cy.ts'
      : [
          'cypress/e2e/component-regressions.cy.ts',
          'cypress/e2e/theme-editor.cy.ts',
          'cypress/e2e/docs-styles.cy.ts',
          'cypress/e2e/multiselect-styles.cy.ts',
          'cypress/e2e/panel-group-docs.cy.ts',
          'cypress/e2e/corner-shape.cy.ts',
          'cypress/e2e/liquid-glass-logo-docs.cy.ts',
          'cypress/e2e/docs-localization.cy.ts',
          'cypress/e2e/framework-switch.cy.ts',
          'cypress/e2e/home.cy.ts',
          'cypress/e2e/home-local-chat.cy.ts',
          'cypress/e2e/home-workbench.cy.ts',
          'cypress/e2e/home-entrance.cy.ts',
        ],
    supportFile: false,
    setupNodeEvents(on) {
      on('before:browser:launch', (browser, launchOptions) => {
        if (process.platform === 'linux' && browser.name === 'chrome' && browser.isHeadless) {
          // Match desktop hover and allow software WebGL on runners without a GPU.
          launchOptions.args.push(
            '--blink-settings=primaryHoverType=2,availableHoverTypes=2',
            '--enable-unsafe-swiftshader',
          );
          if (realWebLLM) launchOptions.args.push('--enable-unsafe-webgpu');
        }
        return launchOptions;
      });
      // This standalone route spec has no module imports. Strip its types only;
      // the default webpack loader otherwise includes unrelated component specs
      // in its TNB emit program and fails with duplicate source-map outputs.
      on('file:preprocessor', async (file) => {
        await mkdir(path.dirname(file.outputPath), { recursive: true });
        await writeFile(
          file.outputPath,
          stripTypeScriptTypes(await readFile(file.filePath, 'utf8')),
        );
        return file.outputPath;
      });
    },
  },
});
