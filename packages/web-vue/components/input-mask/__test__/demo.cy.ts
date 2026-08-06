import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';
import { inputMaskPresets } from '../index';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/input-mask/*.vue',
);

runDemoTests('input-mask', demos, (demoName) => {
  cy.get('.sd-input-mask').should('exist');
  if (demoName === 'presets') {
    cy.get('[data-mask-preset]').should('have.length', Object.keys(inputMaskPresets).length);
  }
});
