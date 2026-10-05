import VerificationCode from '../index';

describe('VerificationCode robustness', () => {
  it('preserves entered uncontrolled characters when the length changes', () => {
    cy.mount(VerificationCode, { props: { length: 4 } });
    cy.get('input').eq(0).type('a');
    cy.focused().type('b');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ length: 6 }));
    cy.get('input').should('have.length', 6);
    cy.get('input').eq(0).should('have.value', 'a');
    cy.get('input').eq(1).should('have.value', 'b');
    cy.get('input').eq(2).should('have.value', '');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ length: 1 }));
    cy.get('input').should('have.length', 1);
    cy.get('input').eq(0).should('have.value', 'a');
  });

  it('allows focusing an empty set of cells', () => {
    cy.mount(VerificationCode, { props: { length: 0 } });
    cy.get('@vue').then(({ wrapper }) => {
      expect(() => wrapper.vm.focus()).not.to.throw();
      expect(() => wrapper.vm.blur()).not.to.throw();
    });
    cy.get('input').should('not.exist');
  });
});
