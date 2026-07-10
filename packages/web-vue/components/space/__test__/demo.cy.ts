import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/space/*.vue',
);

runDemoTests('space', demos, () => {
  cy.get('.sd-space').should('exist');
});
