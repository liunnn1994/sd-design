import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/notification/*.vue',
);

runDemoTests('notification', demos, () => {
  cy.get('.sd-btn, button, [class*="sd-"]').should('exist');
});
