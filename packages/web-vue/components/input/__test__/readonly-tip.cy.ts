import Input from '../index';

describe('Input readonly tip', () => {
  it('shows a tooltip when typing into a readonly input', () => {
    cy.mount(Input, { props: { readonly: true, modelValue: 'hello' } });
    cy.get('.sd-tooltip-content').should('not.exist');
    cy.get('input').trigger('keydown', { key: 'a' });
    cy.get('.sd-tooltip-content').should('be.visible').and('contain', '只读');
  });

  it('does not show a tooltip when the input is not readonly', () => {
    cy.mount(Input, { props: { modelValue: 'hello' } });
    cy.get('input').trigger('keydown', { key: 'a' });
    cy.get('.sd-tooltip-content').should('not.exist');
  });

  it('shows a custom tip text when readonly is a string', () => {
    cy.mount(Input, { props: { readonly: '内容已锁定', modelValue: 'hello' } });
    cy.get('input').trigger('keydown', { key: 'a' });
    cy.get('.sd-tooltip-content')
      .should('be.visible')
      .and('contain', '内容已锁定')
      .and('not.contain', '只读');
  });
});
