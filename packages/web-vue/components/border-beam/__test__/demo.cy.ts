import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/border-beam/*.vue',
);

runDemoTests('border-beam', demos, () => {
  cy.get('.sd-border-beam').should('exist');
  cy.get('[data-beam]').should('exist');
});
