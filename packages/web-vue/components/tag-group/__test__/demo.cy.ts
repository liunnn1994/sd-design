import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/tag-group/*.vue',
);

runDemoTests('tag-group', demos, () => {
  cy.get('.sd-tag-group, [class*="sd-tag"]').should('exist');
});
