import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/empty/*.vue',
);

runDemoTests('empty', demos, () => {
  cy.get('.sd-empty').should('exist');
});
