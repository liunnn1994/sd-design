import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/back-top/*.vue',
);

runDemoTests('back-top', demos, () => {
  // Back-top only appears after scrolling; assert the scroll container rendered.
  cy.get('ul').should('exist');
});
