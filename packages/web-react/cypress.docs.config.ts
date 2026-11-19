import { defineConfig } from 'cypress';

import config from './cypress.config.ts';
import { docsE2eSpecs } from './scripts/docs-e2e-specs.ts';

export default defineConfig({
  ...config,
  // Match the Vue documentation setup for LiveCodes' nested result frame.
  chromeWebSecurity: false,
  modifyObstructiveCode: false,
  e2e: {
    ...config.e2e,
    baseUrl: 'http://127.0.0.1:5188',
    specPattern: docsE2eSpecs,
    excludeSpecPattern: [],
  },
});
