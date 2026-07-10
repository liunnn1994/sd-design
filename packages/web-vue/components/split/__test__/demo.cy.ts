import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/split/*.vue',
);

runDemoTests('split', demos, () => {
  cy.get('.sd-split, [class*="sd-"]').should('exist');
});
