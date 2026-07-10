import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/grid/*.vue',
);

runDemoTests('grid', demos, () => {
  cy.get('.sd-row, .sd-col, [class*="sd-grid"]').should('exist');
});
