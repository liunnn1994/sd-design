import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/form/*.vue',
);

runDemoTests('form', demos, () => {
  cy.get('form.sd-form, .sd-form, form').should('exist');
});
