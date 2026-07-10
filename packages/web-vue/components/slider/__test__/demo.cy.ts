import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/slider/*.vue',
);

runDemoTests('slider', demos, () => {
  cy.get('.sd-slider').should('exist');
});
