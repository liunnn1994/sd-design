import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/modal/*.vue',
);

runDemoTests('modal', demos, () => {
  cy.get('.sd-modal, .sd-btn, button').should('exist');
});
