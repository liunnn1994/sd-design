import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/input-tag/*.vue',
);

runDemoTests('input-tag', demos, () => {
  cy.get('.sd-input-tag').should('exist');
});
