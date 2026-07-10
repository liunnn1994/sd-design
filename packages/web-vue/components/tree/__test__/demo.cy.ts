import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/tree/*.vue',
);

runDemoTests('tree', demos, () => {
  cy.get('.sd-tree, [class*="sd-tree"]').should('exist');
});
