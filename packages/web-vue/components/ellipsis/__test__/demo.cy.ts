import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/ellipsis/*.vue',
);

runDemoTests('ellipsis', demos, (demoName) => {
  cy.get('.sd-ellipsis').should('exist').and('have.css', 'text-overflow', 'ellipsis');

  if (demoName === 'line-clamp') {
    cy.get('.sd-ellipsis')
      .should('have.css', 'width', '256px')
      .and('have.css', '-webkit-line-clamp', '2')
      .and(($ellipsis) => {
        expect($ellipsis[0].scrollHeight).to.be.greaterThan($ellipsis[0].clientHeight);
      });
    return;
  }

  const expectedWidth = demoName === 'custom-tooltip' || demoName === 'expand-trigger' ? 224 : 192;
  cy.get('.sd-ellipsis')
    .should('have.css', 'width', `${expectedWidth}px`)
    .and(($ellipsis) => {
      expect($ellipsis[0].scrollWidth).to.be.greaterThan($ellipsis[0].clientWidth);
    });
});
