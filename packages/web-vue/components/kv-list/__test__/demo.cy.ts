import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/kv-list/*.vue',
);

runDemoTests('kv-list', demos, () => {
  cy.get('.sd-kv-list').should('exist');
});
