import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/descriptions/*.vue',
);

runDemoTests('descriptions', demos, () => {
  cy.get('.sd-descriptions').should('exist');
});
