import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/card/*.vue',
);

runDemoTests('card', demos, () => {
  cy.get('.sd-card').should('exist');
});
