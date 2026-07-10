import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/upload/*.vue',
);

runDemoTests('upload', demos, () => {
  cy.get('[class*="sd-"]').should('exist');
});
