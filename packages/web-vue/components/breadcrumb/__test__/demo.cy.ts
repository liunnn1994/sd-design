import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/breadcrumb/*.vue',
);

runDemoTests('breadcrumb', demos, () => {
  cy.get('.sd-breadcrumb').should('exist');
  cy.get('.sd-breadcrumb-item').should('exist');
});
