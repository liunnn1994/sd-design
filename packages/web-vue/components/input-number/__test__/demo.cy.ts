import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/input-number/*.vue',
);

runDemoTests('input-number', demos, () => {
  cy.get('.sd-input-number').should('exist');
});
