import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/alert/*.vue',
);

runDemoTests('alert', demos, (demoName) => {
  cy.get('.sd-alert').should('exist');

  if (demoName === 'type') {
    cy.get('.sd-alert-info').should('exist');
    cy.get('.sd-alert-success').should('exist');
    cy.get('.sd-alert-warning').should('exist');
    cy.get('.sd-alert-error').should('exist');
  }

  if (demoName === 'closable' || demoName === 'action') {
    cy.get('.sd-alert-close-btn').should('exist');
  }
});
