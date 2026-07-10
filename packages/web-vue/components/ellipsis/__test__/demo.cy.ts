import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/ellipsis/*.vue',
);

runDemoTests('ellipsis', demos, () => {
  cy.get('.sd-ellipsis').should('exist');
});
