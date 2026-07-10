import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/input/*.vue',
);

runDemoTests('input', demos, () => {
  cy.get('.sd-input').should('exist');
});
