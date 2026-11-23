import { posix as path } from 'node:path';

export const docsE2eSpecPatterns = [
  'tests/browser/docs-parity.cy.ts',
  'tests/browser/docs-scenarios.cy.ts',
  'tests/browser/*-docs.cy.ts',
  'tests/browser/components-docs-*.cy.ts',
];

export const isDocsE2eSpec = (spec: string) =>
  docsE2eSpecPatterns.some((pattern) => path.matchesGlob(spec, pattern));
