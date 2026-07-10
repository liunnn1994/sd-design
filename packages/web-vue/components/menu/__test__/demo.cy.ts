import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/menu/*.vue',
);

runDemoTests('menu', demos, () => {
  cy.get('.sd-menu, [class*="sd-"]').should('exist');
});
