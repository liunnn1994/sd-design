import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/rich-text-editor/*.vue',
);

runDemoTests('rich-text-editor', demos, () => {
  cy.get('.sd-rich-text-editor').should('exist');
});
