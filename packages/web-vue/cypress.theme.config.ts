import { defineConfig } from 'cypress';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import path from 'node:path';

export default defineConfig({
  video: false,
  allowCypressEnv: false,
  viewportWidth: 1600,
  viewportHeight: 1100,
  e2e: {
    baseUrl: 'http://localhost:4321',
    specPattern: 'cypress/e2e/theme-editor.cy.ts',
    supportFile: false,
    setupNodeEvents(on) {
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
