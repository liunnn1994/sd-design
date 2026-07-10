import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/popover/*.vue',
);

runDemoTests('popover', demos, () => {
  cy.get('button, [class*="sd-"]').should('exist');
});
