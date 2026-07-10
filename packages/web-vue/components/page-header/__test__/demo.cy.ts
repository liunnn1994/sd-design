import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/page-header/*.vue',
);

runDemoTests('page-header', demos, () => {
  cy.get('.sd-page-header').should('exist');
});
