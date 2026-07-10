import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/affix/*.vue',
);

runDemoTests('affix', demos, () => {
  // Affix only adds the `.sd-affix` class once fixed; at rest it's a wrapper, so
  // assert the slotted button rendered.
  cy.get('.sd-btn').should('exist');
});
