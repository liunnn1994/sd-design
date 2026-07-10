import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/qr-code/*.vue',
);

runDemoTests('qr-code', demos, () => {
  cy.get('.sd-qr-code, [class*="sd-"]').should('exist');
});
