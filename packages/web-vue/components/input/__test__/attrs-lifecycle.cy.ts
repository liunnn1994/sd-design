import { h, ref } from 'vue';

import Input, { InputPassword } from '../index';

describe('Input dynamic attributes', () => {
  it('removes native overrides and invalid state when their props are cleared', () => {
    cy.mount(Input, {
      props: {
        inputAttrs: {
          'aria-label': 'Original',
          'autocomplete': 'off',
          'style': { letterSpacing: '4px' },
        },
        error: true,
      },
    });
    cy.get('input')
      .should('have.attr', 'aria-invalid', 'true')
      .and('have.css', 'letter-spacing', '4px');
    cy.get('@vue').then(({ wrapper }) =>
      wrapper.setProps({ inputAttrs: { 'aria-label': 'Updated' }, error: false }),
    );
    cy.get('input').should('have.attr', 'aria-label', 'Updated');
    cy.get('input').should('not.have.attr', 'autocomplete');
    cy.get('input').should('not.have.attr', 'aria-invalid');
    cy.get('input')
      .should('have.css', 'letter-spacing', '0')
      .type('value')
      .should('have.value', 'value');
  });

  it('preserves the password value and focus through visibility changes', () => {
    cy.mount(InputPassword);
    cy.get('input').type('secret');
    cy.get('.sd-input-suffix .sd-icon-hover').click();
    cy.get('input')
      .should('have.attr', 'type', 'text')
      .and('have.value', 'secret')
      .and('be.focused');
    cy.get('.sd-input-suffix .sd-icon-hover').click();
    cy.get('input').should('have.attr', 'type', 'password').and('have.value', 'secret');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ invisibleButton: false }));
    cy.get('.sd-input-suffix .sd-icon-hover').should('not.exist');
    cy.get('input').type('2').should('have.value', 'secret2');
  });

  it('updates wrapper attributes and native event listeners', () => {
    const updated = ref(false);
    const first = cy.spy().as('first');
    const second = cy.spy().as('second');
    cy.mount({
      setup: () => () =>
        h(Input, {
          title: updated.value ? 'New title' : 'Old title',
          style: { marginTop: updated.value ? '20px' : '10px' },
          onKeyup: updated.value ? second : first,
        }),
    });
    cy.get('.sd-input-wrapper').should('have.attr', 'title', 'Old title');
    cy.get('input').type('a');
    cy.get('@first').should('have.been.calledOnce');
    cy.then(() => {
      updated.value = true;
    });
    cy.get('.sd-input-wrapper').should('have.attr', 'title', 'New title');
    cy.get('.sd-input-wrapper').should('have.css', 'margin-top', '20px');
    cy.get('input').type('b');
    cy.get('@first').should('have.been.calledOnce');
    cy.get('@second').should('have.been.calledOnce');
  });
});
