import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/select/*.vue',
);

runDemoTests('select', demos, () => {
  cy.get('.sd-select, input, [class*="sd-"]').should('exist');
});
