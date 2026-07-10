import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/scrollbar/*.vue',
);

runDemoTests('scrollbar', demos, () => {
  cy.get('.sd-scrollbar').should('exist');
});
