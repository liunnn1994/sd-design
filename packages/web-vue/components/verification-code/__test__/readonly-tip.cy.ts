import VerificationCode from '../index';

describe('VerificationCode readonly tip', () => {
  it('shows a tooltip when typing into a readonly verification-code', () => {
    cy.mount(VerificationCode, { props: { readonly: true } });
    cy.get('.sd-tooltip-content').should('not.exist');
    cy.get('input').first().trigger('keydown', { key: 'a' });
    cy.get('.sd-tooltip-content').should('be.visible').and('contain', '只读');
  });

  it('does not show a tooltip when the verification-code is not readonly', () => {
    cy.mount(VerificationCode, { props: {} });
    cy.get('input').first().trigger('keydown', { key: 'a' });
    cy.get('.sd-tooltip-content').should('not.exist');
  });
});
