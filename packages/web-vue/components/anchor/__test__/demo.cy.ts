import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/anchor/*.vue',
);

runDemoTests('anchor', demos, (demoName) => {
  cy.get('.sd-anchor').should('exist');
  cy.get('.sd-anchor-link').should('exist');
  if (demoName === 'affix') {
    cy.get('.sd-anchor').should('have.css', 'background-color', 'rgb(255, 255, 255)');
    cy.get('body').invoke('attr', 'sd-theme', 'dark');
    cy.get('.sd-anchor').should('have.css', 'background-color', 'rgb(32, 32, 30)');
    cy.get('body').invoke('removeAttr', 'sd-theme');
  }
});
