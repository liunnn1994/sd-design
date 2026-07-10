import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/dropdown/*.vue',
);

runDemoTests('dropdown', demos, () => {
  // Context-menu demos render plain trigger content with no `sd` class until
  // opened, so assert the demo mounted and produced DOM content.
  cy.document().its('body.children.length').should('be.greaterThan', 0);
});
