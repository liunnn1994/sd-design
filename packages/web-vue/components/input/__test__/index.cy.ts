import Input from '../index';

describe('Input', () => {
  it('should update value and emit on input', () => {
    cy.mount(Input);
    cy.get('input').type('test');
    cy.get('input').should('have.value', 'test');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('input')).to.have.length(4);
    });
  });

  it('should clear content', () => {
    cy.mount(Input, { props: { defaultValue: 'test', allowClear: true } });
    cy.get('input').should('have.value', 'test');
    cy.get('.sd-input-clear-btn').click({ force: true });
    cy.get('input').should('have.value', '');
  });

  it('exposes the clear button with a name and keyboard activation', () => {
    cy.mount(Input, { props: { defaultValue: 'test', allowClear: true } });
    cy.get('.sd-input-clear-btn').as('clear');
    cy.get('@clear').should('have.attr', 'role', 'button');
    cy.get('@clear').should('have.attr', 'tabindex', '0');
    cy.get('@clear').should('have.attr', 'aria-label', '清除');
    cy.get('input').should('have.value', 'test');
    cy.get('@clear').trigger('keydown', { key: 'Enter', force: true });
    cy.get('input').should('have.value', '');
  });
});
