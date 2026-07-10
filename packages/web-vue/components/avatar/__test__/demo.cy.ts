import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/avatar/*.vue',
);

runDemoTests('avatar', demos, (demoName) => {
  if (demoName === 'group') {
    cy.get('.sd-avatar-group').should('exist');
  }
  cy.get('.sd-avatar').should('exist');
});
