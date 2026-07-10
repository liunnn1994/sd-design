import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/auto-complete/*.vue',
);

runDemoTests('auto-complete', demos, () => {
  cy.get('input').should('exist');
});
