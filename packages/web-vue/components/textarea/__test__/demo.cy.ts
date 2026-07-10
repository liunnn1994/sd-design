import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/textarea/*.vue',
);

runDemoTests('textarea', demos, () => {
  cy.get('.sd-textarea, textarea').should('exist');
});
