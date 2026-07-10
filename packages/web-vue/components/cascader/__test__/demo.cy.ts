import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/cascader/*.vue',
);

runDemoTests('cascader', demos, () => {
  // Most demos render an input; the panel demo renders an inline panel.
  cy.get('input, .sd-cascader-panel').should('exist');
});
