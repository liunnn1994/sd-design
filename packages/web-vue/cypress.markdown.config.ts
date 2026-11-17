import { defineConfig } from 'cypress';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import path from 'node:path';

export default defineConfig({
  video: false,
  chromeWebSecurity: false,
  modifyObstructiveCode: false,
  viewportWidth: 1440,
  viewportHeight: 1000,
  e2e: {
    baseUrl: 'http://127.0.0.1:4351',
    specPattern: [
      'cypress/e2e/markdown-docs.cy.ts',
      'cypress/e2e/katex-docs.cy.ts',
      'cypress/e2e/livecodes-docs.cy.ts',
      'cypress/e2e/kv-list-docs.cy.ts',
    ],
    supportFile: false,
    setupNodeEvents(on) {
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
