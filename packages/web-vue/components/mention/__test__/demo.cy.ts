import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

// mention.handleResize reads getComputedStyle on an element that is absent in an
// unstyled real-browser mount. vitest mocked ResizeObserver so this never ran;
// here the real ResizeObserver fires it. Ignore that specific component quirk so
// the demo render test isn't blocked by it (not a test concern).
Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('getPropertyValue')) {
    return false;
  }
  return undefined;
});

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/mention/*.vue',
);

runDemoTests('mention', demos, () => {
  cy.document().its('body.children.length').should('be.greaterThan', 0);
});
