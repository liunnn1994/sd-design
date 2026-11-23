import { defineConfig } from 'cypress';

import config from './cypress.config.ts';
import { docsE2eSpecPatterns } from './scripts/docs-e2e-specs.ts';

const selectedPages = process.env.SD_DOCS_PAGES;

export default defineConfig({
  ...config,
  ...(selectedPages && { expose: { docsFrameworks: 'react', docsPages: selectedPages } }),
  // Match the Vue documentation setup for LiveCodes' nested result frame.
  chromeWebSecurity: false,
  modifyObstructiveCode: false,
  e2e: {
    ...config.e2e,
    baseUrl: 'http://127.0.0.1:5188',
    specPattern: docsE2eSpecPatterns,
    excludeSpecPattern: [],
  },
});
