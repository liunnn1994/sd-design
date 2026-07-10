import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/copy/*.vue',
);

runDemoTests('copy', demos, () => {
  cy.get('a, .sd-copy').should('exist');
});
