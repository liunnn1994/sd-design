import { h, ref } from 'vue';

import Input, { InputSearch } from '../index';

describe('Input dynamic slot layout', () => {
  for (const slot of ['prepend', 'append']) {
    for (const initial of [false, true]) {
      it(`updates ${slot} when the slot starts ${initial ? 'present' : 'absent'}`, () => {
        const visible = ref(initial);
        cy.mount({
          setup: () => () => h(Input, {}, visible.value ? { [slot]: () => 'Addon' } : {}),
        });
        cy.get('input').type('edited');
        cy.get('.sd-input-outer').should(initial ? 'exist' : 'not.exist');
        cy.then(() => {
          visible.value = !initial;
        });
        cy.get('.sd-input-outer').should(initial ? 'not.exist' : 'exist');
        cy.get(`.sd-input-${slot}`).should(initial ? 'not.exist' : 'have.text', 'Addon');
        cy.get('input').should('have.value', 'edited');
        cy.then(() => {
          visible.value = initial;
        });
        cy.get('.sd-input-outer').should(initial ? 'exist' : 'not.exist');
        cy.get('input').should('have.value', 'edited');
      });
    }
  }

  it('updates the outer suffix class as the slot is added and removed', () => {
    const suffix = ref(false);
    cy.mount({
      setup: () => () =>
        h(Input, { prepend: 'Label' }, suffix.value ? { suffix: () => 'Suffix' } : {}),
    });
    cy.get('.sd-input-outer').should('not.have.class', 'sd-input-outer-has-suffix');
    cy.then(() => {
      suffix.value = true;
    });
    cy.get('.sd-input-suffix').should('have.text', 'Suffix');
    cy.get('.sd-input-outer').should('have.class', 'sd-input-outer-has-suffix');
    cy.then(() => {
      suffix.value = false;
    });
    cy.get('.sd-input-outer').should('not.have.class', 'sd-input-outer-has-suffix');
  });

  for (const initial of [false, true]) {
    it(`updates InputSearch from searchButton=${initial} without losing its value`, () => {
      cy.mount(InputSearch, { props: { searchButton: initial } });
      cy.get('input').type('query');
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ searchButton: !initial }));
      cy.get('.sd-input-outer').should(initial ? 'not.exist' : 'exist');
      cy.get('input').should('have.value', 'query');
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ searchButton: initial }));
      cy.get('.sd-input-outer').should(initial ? 'exist' : 'not.exist');
      cy.get('input').should('have.value', 'query');
    });
  }
});
