import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/color-picker/*.vue',
);

runDemoTests('color-picker', demos, () => {
  cy.get('[class*="sd-"]').should('exist');
});
