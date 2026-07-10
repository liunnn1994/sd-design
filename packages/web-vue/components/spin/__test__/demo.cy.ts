import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/spin/*.vue',
);

runDemoTests('spin', demos, () => {
  cy.get('.sd-spin').should('exist');
});
