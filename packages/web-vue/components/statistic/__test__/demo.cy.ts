import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/statistic/*.vue',
);

runDemoTests('statistic', demos, () => {
  cy.get('.sd-statistic, [class*="sd-"]').should('exist');
});
