import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/cascader/*.vue',
);

runDemoTests('cascader', demos, (demoName) => {
  if (demoName === 'trigger-element') {
    cy.get('.sd-btn').should('be.visible').click();
    cy.get('.sd-cascader-panel').should('be.visible');
    return;
  }

  // Most demos render an input; the panel demo renders an inline panel.
  cy.get('input, .sd-cascader-panel').should('exist');
});
