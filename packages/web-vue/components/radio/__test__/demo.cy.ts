import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/radio/*.vue',
);

runDemoTests('radio', demos, () => {
  cy.get('.sd-radio, [class*="sd-"]').should('exist');
});
