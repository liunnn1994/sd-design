import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/checkbox/*.vue',
);

runDemoTests('checkbox', demos, () => {
  cy.get('.sd-checkbox').should('exist');
});
