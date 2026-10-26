import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/select/*.vue',
);

runDemoTests('select', demos, (demoName) => {
  cy.get('.sd-select, input, [class*="sd-"]').should('exist');
  if (demoName === 'linkage') {
    cy.get('.sd-select-view').first().should('contain.text', '四川');
    cy.get('.sd-select-view').eq(1).should('contain.text', '成都').click();
    cy.contains('.sd-select-option', '成都').should('have.attr', 'aria-selected', 'true');
    cy.get('.sd-select-option:visible').should('have.length', 3);
    cy.get('.sd-select-view').eq(1).click();
    cy.get('.sd-select-view').first().click();
    cy.contains('.sd-select-option', '北京').click();
    cy.get('.sd-select-view').eq(1).should('not.contain.text', '成都').click();
    cy.contains('.sd-select-option', '海淀区').click();
    cy.get('.sd-select-view').eq(1).should('contain.text', '海淀区');
  }
});
