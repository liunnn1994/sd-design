import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/collapse/*.vue',
);

runDemoTests('collapse', demos, () => {
  cy.get('.sd-collapse').should('exist');
});
