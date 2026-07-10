import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/tag/*.vue',
);

runDemoTests('tag', demos, () => {
  cy.get('.sd-tag, [class*="sd-tag"]').should('exist');
});
