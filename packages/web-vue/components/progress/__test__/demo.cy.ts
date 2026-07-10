import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/progress/*.vue',
);

runDemoTests('progress', demos, () => {
  cy.get('.sd-progress').should('exist');
});
