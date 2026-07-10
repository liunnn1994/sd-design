import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/secret/*.vue',
);

runDemoTests('secret', demos, () => {
  cy.get('.sd-secret, [class*="sd-"]').should('exist');
});
