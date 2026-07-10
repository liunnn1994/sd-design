import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/rate/*.vue',
);

runDemoTests('rate', demos, () => {
  cy.get('.sd-rate').should('exist');
});
