import type { Component } from 'vue';

import BasicDemo from '../../../../sd-vue-docs/src/components/generated/mention/basic.vue';
import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/mention/*.vue',
);

runDemoTests('mention', demos, () => {
  cy.document().its('body.children.length').should('be.greaterThan', 0);
});

describe('<mention> basic demo', () => {
  it('keeps the same focused input after typing', () => {
    cy.mount(BasicDemo);
    cy.get('input')
      .first()
      .then(($input) => {
        const input = $input[0];
        cy.wrap(input).type('a');
        cy.focused().should(($focused) => {
          expect($focused[0]).to.equal(input);
          expect(input.isConnected).to.equal(true);
        });
      });
  });
});
