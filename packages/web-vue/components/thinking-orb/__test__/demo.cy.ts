import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/thinking-orb/*.vue',
);

runDemoTests('thinking-orb', demos, () => {
  cy.get('.sd-thinking-orb').should('exist');
});
