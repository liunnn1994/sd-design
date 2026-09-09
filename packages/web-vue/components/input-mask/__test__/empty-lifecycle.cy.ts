import InputMask from '../index';

describe('InputMask empty lifecycle', () => {
  for (const clearButton of [true, false]) {
    it(`hides an empty fixed mask after ${clearButton ? 'clearing' : 'deleting'} and blur`, () => {
      cy.mount(InputMask, { props: { mask: '99-99', defaultValue: '1234', allowClear: true } });
      cy.get('input').focus();
      if (clearButton) cy.get('.sd-input-clear-btn').click({ force: true });
      else cy.get('input').clear();
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).to.equal('');
      });
      cy.get('.sd-input-clear-btn').should('not.exist');
      cy.get('input').blur().should('have.value', '');
      cy.get('input').focus().should('have.value', '__-__').type('56');
      cy.get('input').should('have.value', '56-__');
    });
  }
});
