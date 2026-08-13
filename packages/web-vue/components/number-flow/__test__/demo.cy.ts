import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/number-flow/*.vue',
);

runDemoTests('number-flow', demos, () => {
  cy.get('.sd-number-flow').should('exist');
  cy.contains('button', '切换随机数').click();
  cy.get('.sd-number-flow-animating').should('exist');
});
