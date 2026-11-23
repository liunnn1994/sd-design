import Textarea from '../index';

describe('Textarea readonly tip', () => {
  it('shows a tooltip when typing into a readonly textarea', () => {
    cy.mount(Textarea, { props: { readonly: true, modelValue: 'hello' } });
    cy.get('.sd-tooltip-content').should('not.exist');
    cy.get('textarea').trigger('keydown', { key: 'a' });
    cy.get('.sd-tooltip-content').should('be.visible').and('contain', '只读');
  });

  it('does not show a tooltip when the textarea is not readonly', () => {
    cy.mount(Textarea, { props: { modelValue: 'hello' } });
    cy.get('textarea').trigger('keydown', { key: 'a' });
    cy.get('.sd-tooltip-content').should('not.exist');
  });
});
