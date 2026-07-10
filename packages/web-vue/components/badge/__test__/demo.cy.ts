import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/badge/*.vue',
);

runDemoTests('badge', demos, (demoName) => {
  cy.get('.sd-badge').should('exist');
  if (demoName === 'status') {
    cy.get('.sd-badge-status-normal').should('exist');
  }
  if (demoName === 'text') {
    cy.get('.sd-badge-text').should('exist');
  }
});
