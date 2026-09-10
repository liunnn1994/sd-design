import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/theme-provider/*.vue',
);

runDemoTests('theme-provider', demos, () => {
  cy.get('.sd-theme-provider, [sd-theme]').should('exist');
});
