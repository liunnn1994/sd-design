import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/typography/*.vue',
);

runDemoTests('typography', demos, () => {
  cy.document().its('body.children.length').should('be.greaterThan', 0);
});
