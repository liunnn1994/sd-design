import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/tooltip/*.vue',
);

runDemoTests('tooltip', demos, () => {
  cy.get('button, [class*="sd-"]').should('exist');
});
