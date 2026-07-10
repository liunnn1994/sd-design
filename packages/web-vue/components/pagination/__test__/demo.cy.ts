import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/pagination/*.vue',
);

runDemoTests('pagination', demos, () => {
  cy.get('.sd-pagination').should('exist');
});
