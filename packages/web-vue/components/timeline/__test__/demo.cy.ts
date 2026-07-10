import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/timeline/*.vue',
);

runDemoTests('timeline', demos, () => {
  cy.get('.sd-timeline, [class*="sd-timeline"]').should('exist');
});
