import Mention from '../index';

describe('Mention readonly tip', () => {
  it('shows a tooltip when typing into a readonly mention', () => {
    cy.mount(Mention, { props: { readonly: true } });
    cy.get('.sd-tooltip-content').should('not.exist');
    cy.get('input').trigger('keydown', { key: 'a' });
    cy.get('.sd-tooltip-content').should('be.visible').and('contain', '只读');
  });

  it('does not show a tooltip when the mention is not readonly', () => {
    cy.mount(Mention, { props: {} });
    cy.get('input').trigger('keydown', { key: 'a' });
    cy.get('.sd-tooltip-content').should('not.exist');
  });
});
