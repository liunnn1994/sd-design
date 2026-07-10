import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/image/*.vue',
);

runDemoTests('image', demos, () => {
  cy.get('[class*="sd-image"], img, [class*="sd-"]').should('exist');
});
