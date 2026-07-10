import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/drawer/*.vue',
);

runDemoTests('drawer', demos, () => {
  // Most drawer demos render a trigger button; the function/api demo opens via JS.
  cy.get('button, .sd-btn, .sd-drawer').should('exist');
});
