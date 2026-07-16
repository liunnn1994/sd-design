import AutoComplete from '../index';

describe('AutoComplete readonly tip', () => {
  it('shows a tooltip when typing into a readonly auto-complete', () => {
    cy.mount(AutoComplete, { props: { readonly: true, data: ['apple', 'banana'] } });
    cy.get('.sd-tooltip-content').should('not.exist');
    cy.get('input').trigger('keydown', { key: 'a' });
    cy.get('.sd-tooltip-content').should('be.visible').and('contain', '只读');
  });

  it('does not show a tooltip when the auto-complete is not readonly', () => {
    cy.mount(AutoComplete, { props: { data: ['apple', 'banana'] } });
    cy.get('input').trigger('keydown', { key: 'a' });
    cy.get('.sd-tooltip-content').should('not.exist');
  });
});
