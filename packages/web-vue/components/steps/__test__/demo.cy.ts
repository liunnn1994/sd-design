import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/steps/*.vue',
);

runDemoTests('steps', demos, () => {
  cy.get('.sd-steps, [class*="sd-step"]').should('exist');
});
