import { h } from 'vue';

import Ellipsis from '../ellipsis.vue';

describe('Ellipsis nested keyboard controls', () => {
  it('does not expand when Enter originates from an inner button', () => {
    cy.mount(Ellipsis, {
      props: { expandTrigger: 'click', tooltip: false },
      attrs: { style: 'width: 220px' },
      slots: {
        default: () => [h('button', { class: 'inner-button' }, 'Action'), 'Long text '.repeat(30)],
      },
    });
    cy.get('.sd-ellipsis[data-part="root"]').should('have.attr', 'aria-expanded', 'false');
    cy.get('.sd-ellipsis[data-part="root"]').should('have.class', 'sd-ellipsis--expandable');
    cy.get('.sd-ellipsis[data-part="root"] > .sd-ellipsis-content .inner-button')
      .focus()
      .trigger('keydown', { key: 'Enter' });
    cy.get('.sd-ellipsis[data-part="root"]').should('have.attr', 'aria-expanded', 'false');
    cy.get('.sd-ellipsis[data-part="root"]').focus().trigger('keydown', { key: 'Enter' });
    cy.get('.sd-ellipsis[data-part="root"]').should('have.attr', 'aria-expanded', 'true');
  });

  it('preserves spaces typed in an inner input without expanding', () => {
    cy.mount(Ellipsis, {
      props: { expandTrigger: 'click', tooltip: false },
      attrs: { style: 'width: 220px' },
      slots: {
        default: () => [
          h('input', { class: 'inner-input', style: 'width: 70px' }),
          'Long text '.repeat(30),
        ],
      },
    });
    cy.get('.sd-ellipsis[data-part="root"]').should('have.class', 'sd-ellipsis--expandable');
    cy.get('.sd-ellipsis[data-part="root"] > .sd-ellipsis-content .inner-input')
      .type('a b')
      .should('have.value', 'a b');
    cy.get('.sd-ellipsis[data-part="root"]').should('have.attr', 'aria-expanded', 'false');
  });
});
