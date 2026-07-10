import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/button/*.vue',
);

runDemoTests('button', demos, () => {
  cy.get('.sd-btn').should('exist');
});
