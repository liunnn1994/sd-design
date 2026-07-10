import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/result/*.vue',
);

runDemoTests('result', demos, () => {
  cy.get('.sd-result').should('exist');
});
