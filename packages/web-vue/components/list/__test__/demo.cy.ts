import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/list/*.vue',
);

runDemoTests('list', demos, () => {
  cy.get('.sd-list').should('exist');
});
