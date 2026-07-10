import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/comment/*.vue',
);

runDemoTests('comment', demos, () => {
  cy.get('.sd-comment').should('exist');
});
