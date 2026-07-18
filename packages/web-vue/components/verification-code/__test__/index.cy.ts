import VerificationCode from '../index';

describe('VerificationCode', () => {
  it('marks the field group and gives each cell an accessible name', () => {
    cy.mount(VerificationCode, { props: { length: 4 } });
    cy.get('.sd-verification-code').should('have.attr', 'role', 'group');
    cy.get('.sd-verification-code').should('have.attr', 'aria-label', '验证码');
    cy.get('input').eq(0).should('have.attr', 'aria-label', '第 1 个字符,共 4 个');
    cy.get('input').eq(3).should('have.attr', 'aria-label', '第 4 个字符,共 4 个');
  });
});
