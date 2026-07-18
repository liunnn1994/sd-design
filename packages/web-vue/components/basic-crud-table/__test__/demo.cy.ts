import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';
const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/basic-crud-table/*.vue',
);
runDemoTests('basic-crud-table', demos, () => {
  cy.get('.sd-basic-crud-table').should('exist');
});
