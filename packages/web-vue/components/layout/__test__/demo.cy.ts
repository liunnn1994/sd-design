import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/layout/*.vue',
);

runDemoTests('layout', demos, () => {
  cy.get('.sd-layout, [class*="sd-layout"]').should('exist');
});
