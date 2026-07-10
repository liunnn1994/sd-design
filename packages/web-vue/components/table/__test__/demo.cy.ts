import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/table/*.vue',
);

runDemoTests('table', demos, () => {
  cy.get('.sd-table, [class*="sd-table"]').should('exist');
});
