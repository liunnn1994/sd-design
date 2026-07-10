import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/calendar/*.vue',
);

runDemoTests('calendar', demos, () => {
  cy.get('.sd-calendar').should('exist');
});
