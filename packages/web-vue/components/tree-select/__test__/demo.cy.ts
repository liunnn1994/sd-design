import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/tree-select/*.vue',
);

runDemoTests('tree-select', demos, () => {
  cy.get('input, .sd-select-view, [class*="sd-"]').should('exist');
});
