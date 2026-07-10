import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/switch/*.vue',
);

runDemoTests('switch', demos, () => {
  cy.get('button.sd-switch, .sd-switch').should('exist');
});
