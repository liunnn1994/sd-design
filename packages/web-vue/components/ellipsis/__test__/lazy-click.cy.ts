import { h } from 'vue';

import { PerformantEllipsis } from '../index';

describe('PerformantEllipsis first click', () => {
  it('expands after activation without emitting a second external click', () => {
    const onClick = cy.spy().as('clicked');
    cy.mount(PerformantEllipsis, {
      props: { tooltip: false, expandTrigger: 'click' },
      attrs: { style: 'width: 150px', onClick },
      slots: { default: 'Long text '.repeat(30) },
    });
    // A native click avoids mouseenter activating the lazy wrapper first.
    cy.get('.sd-ellipsis').then(($root) => $root[0].click());
    cy.get('.sd-ellipsis--expanded').should('exist');
    cy.get('@clicked').should('have.been.calledOnce');
  });

  it('keeps the first inner-button click independent from expansion', () => {
    const onClick = cy.spy().as('buttonClicked');
    cy.mount(PerformantEllipsis, {
      props: { tooltip: false, expandTrigger: 'click' },
      attrs: { style: 'width: 220px' },
      slots: { default: () => [h('button', { onClick }, 'Action'), 'Long text '.repeat(30)] },
    });
    cy.get('.sd-ellipsis > button').then(($button) => $button[0].click());
    cy.get('.sd-ellipsis[data-part="root"]').should('have.class', 'sd-ellipsis--expandable');
    cy.then(() => Cypress.Promise.delay(250));
    cy.get('.sd-ellipsis[data-part="root"]').should('have.attr', 'aria-expanded', 'false');
    cy.get('@buttonClicked').should('have.been.calledOnce');
  });
});
