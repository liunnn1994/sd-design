import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/link/*.vue',
);

runDemoTests('link', demos, () => {
  cy.get('.sd-link').should('exist');
});
