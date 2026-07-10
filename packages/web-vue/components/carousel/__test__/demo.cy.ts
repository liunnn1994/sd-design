import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/carousel/*.vue',
);

runDemoTests('carousel', demos, () => {
  cy.get('.sd-carousel').should('exist');
});
