import VerificationCode from '../index';

describe('VerificationCode', () => {
  it('marks the field group and gives each cell an accessible name', () => {
    cy.mount(VerificationCode, { props: { length: 4 } });
    cy.get('.sd-verification-code').should('have.attr', 'role', 'group');
    cy.get('.sd-verification-code').should('have.attr', 'aria-label', 'Verification code');
    cy.get('input').eq(0).should('have.attr', 'aria-label', 'Character 1 of 4');
    cy.get('input').eq(3).should('have.attr', 'aria-label', 'Character 4 of 4');
  });
});
