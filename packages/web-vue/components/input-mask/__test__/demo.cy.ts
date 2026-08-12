import type { Component } from 'vue';

import BasicDemo from '../../../../sd-vue-docs/src/components/generated/input-mask/basic.vue';
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

describe('<input-mask> basic demo', () => {
  it('keeps the same focused input after typing', () => {
    cy.mount(BasicDemo);
    cy.get('.sd-input-mask input').then(($input) => {
      const input = $input[0];
      cy.wrap(input).type('2');
      cy.focused().should(($focused) => {
        expect($focused[0]).to.equal(input);
        expect(input.isConnected).to.equal(true);
      });
    });
  });
});
