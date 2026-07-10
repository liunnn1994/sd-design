import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/tabs/*.vue',
);

runDemoTests('tabs', demos, () => {
  cy.get('.sd-tabs').should('exist');
});
