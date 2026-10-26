import type { Component } from 'vue';

import { runDemoTests } from '../../../cypress/support/demo-test';

const demos = import.meta.glob<{ default: Component }>(
  '../../../../sd-vue-docs/src/components/generated/anchor/*.vue',
);

runDemoTests('anchor', demos, (demoName) => {
  cy.get('.sd-anchor').should('exist');
  cy.get('.sd-anchor-link').should('exist');
  cy.get('.sd-anchor-link').each(($link) => {
    const id = $link.attr('href')!.slice(1);
    cy.get('[data-anchor-content]').find(`[id="${id}"]`).should('have.length', 1);
  });
  cy.location('hash').then((previousHash) => {
    cy.get('.sd-anchor-link')
      .last()
      .invoke('attr', 'href')
      .then((hash) => {
        cy.get('.sd-anchor-link').last().click();
        cy.get('[data-anchor-content]').should(($content) => {
          expect($content[0].scrollTop).to.be.greaterThan(0);
        });
        cy.get('.sd-anchor-link').last().should('have.attr', 'aria-current', 'location');
        cy.location('hash').should('equal', demoName === 'hash' ? previousHash : hash);
      });
  });
  if (demoName === 'affix') {
    cy.get('.sd-anchor').should('have.css', 'background-color', 'rgb(255, 255, 255)');
    cy.get('body').invoke('attr', 'sd-theme', 'dark');
    cy.get('.sd-anchor').should('have.css', 'background-color', 'rgb(32, 32, 30)');
    cy.get('body').invoke('removeAttr', 'sd-theme');
  }
});
