import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/selectable-card/*.vue',
);

runDemoTests('selectable-card', demos, () => {
  cy.get('.sd-selectable-card').should('exist');
});
