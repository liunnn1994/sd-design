import type { Component } from 'vue';

import CompositionDemo from '../../../../sd-vue-docs/src/components/generated/skeleton-reveal/composition.vue';
import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/skeleton-reveal/*.vue',
);
runDemoTests('skeleton-reveal', demos, () => {
  cy.get('.sd-skeleton-reveal').should('exist');
});

describe('组合内容重播', () => {
  it('无需重新挂载即可连续重播', () => {
    cy.mount(CompositionDemo);
    cy.get('.sd-skeleton-reveal').should('have.attr', 'data-state', 'complete');
    for (let replay = 0; replay < 2; replay++) {
      cy.contains('button', '重播组合内容').click();
      cy.get('.sd-skeleton-reveal').should('have.attr', 'data-state', 'drawing');
      cy.get('.sd-skeleton-reveal-overlay').should('exist');
      cy.get('.sd-skeleton-reveal').should('have.attr', 'data-state', 'complete');
      cy.get('.sd-skeleton-reveal-overlay').should('not.exist');
    }
  });
});
