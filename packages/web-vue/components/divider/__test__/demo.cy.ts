import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/divider/*.vue',
);

runDemoTests('divider', demos, () => {
  cy.get('.sd-divider').should('exist');
});
