import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/bloom-menu/*.vue',
);

runDemoTests('bloom-menu', demos, () => {
  cy.get('.sd-bloom-menu').should('exist');
  cy.get('[data-bloom-menu-trigger]').should('exist');
});
