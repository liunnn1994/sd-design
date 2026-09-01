import type { Component } from 'vue';

import BasicDemo from '../../../../sd-vue-docs/src/components/generated/regex-vis/basic.vue';
import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/regex-vis/*.vue',
);

runDemoTests('regex-vis', demos, () => {
  cy.get('.sd-regex-vis').should('exist');
});

describe('<regex-vis> basic demo overflow', () => {
  it('keeps long diagrams inside the demo and scrolls the graph viewport', () => {
    cy.viewport(640, 500);
    cy.mount(BasicDemo);

    const longPattern = String.raw`^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#()?&//=]*)$`;
    cy.get('.sd-regex-vis-input input')
      .clear()
      .type(longPattern, { parseSpecialCharSequences: false });

    cy.get('.sd-regex-vis-viewport').should(($viewport) => {
      const viewport = $viewport[0];
      expect(getComputedStyle(viewport).overflowX).to.equal('auto');
      expect(viewport.scrollWidth).to.be.greaterThan(viewport.clientWidth);
    });
    cy.get('.regex-vis-demo').should(($demo) => {
      expect($demo[0].scrollWidth).to.equal($demo[0].clientWidth);
    });
  });
});
