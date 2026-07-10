import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/skeleton/*.vue',
);

runDemoTests('skeleton', demos, () => {
  cy.get('.sd-skeleton').should('exist');
});
