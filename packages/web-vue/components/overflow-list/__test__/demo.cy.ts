import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/overflow-list/*.vue',
);

runDemoTests('overflow-list', demos, () => {
  cy.get('.sd-overflow-list').should('exist');
});
