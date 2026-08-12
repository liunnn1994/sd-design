import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/tooltip/*.vue',
);

runDemoTests('tooltip', demos, (demoName) => {
  cy.get('button, [class*="sd-"]').should('exist');

  if (demoName === 'mouse-through') {
    cy.get('button').eq(0).trigger('mouseenter');
    cy.get('.sd-tooltip')
      .should('have.class', 'sd-tooltip-mouse-through')
      .and('have.css', 'pointer-events', 'none');

    cy.get('button').eq(1).trigger('mouseenter');
    cy.get('.sd-tooltip')
      .not('.sd-tooltip-mouse-through')
      .should('have.css', 'pointer-events', 'auto');
  }
});
