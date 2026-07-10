import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/json-form/*.vue',
);

runDemoTests('json-form', demos, () => {
  cy.get('form, .sd-form, [class*="sd-"]').should('exist');
});
