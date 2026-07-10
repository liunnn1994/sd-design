import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/resize-box/*.vue',
);

runDemoTests('resize-box', demos, () => {
  cy.get('.sd-resizebox').should('exist');
});
