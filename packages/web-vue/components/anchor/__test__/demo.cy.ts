import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/anchor/*.vue',
);

runDemoTests('anchor', demos, () => {
  cy.get('.sd-anchor').should('exist');
  cy.get('.sd-anchor-link').should('exist');
});
