import InputTag from '../index';

describe('InputTag readonly tip', () => {
  it('shows a tooltip when typing into a readonly input-tag', () => {
    cy.mount(InputTag, { props: { readonly: true } });
    cy.get('.sd-tooltip-content').should('not.exist');
    cy.get('input').trigger('keydown', { key: 'a' });
    cy.get('.sd-tooltip-content').should('be.visible').and('contain', '只读');
  });

  it('does not show a tooltip when the input-tag is not readonly', () => {
    cy.mount(InputTag, { props: {} });
    cy.get('input').trigger('keydown', { key: 'a' });
    cy.get('.sd-tooltip-content').should('not.exist');
  });
});
