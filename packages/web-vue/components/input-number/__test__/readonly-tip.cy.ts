import InputNumber from '../index';

describe('InputNumber readonly tip', () => {
  it('shows a tooltip when typing into a readonly input-number', () => {
    cy.mount(InputNumber, { props: { readonly: true } });
    cy.get('.sd-tooltip-content').should('not.exist');
    cy.get('input').trigger('keydown', { key: 'a' });
    cy.get('.sd-tooltip-content').should('be.visible').and('contain', '只读');
  });

  it('does not show a tooltip when the input-number is not readonly', () => {
    cy.mount(InputNumber, { props: {} });
    cy.get('input').trigger('keydown', { key: 'a' });
    cy.get('.sd-tooltip-content').should('not.exist');
  });

  it('shows a custom tip text when readonly is a string', () => {
    cy.mount(InputNumber, { props: { readonly: '不可编辑' } });
    cy.get('input').trigger('keydown', { key: 'a' });
    cy.get('.sd-tooltip-content').should('be.visible').and('contain', '不可编辑');
  });
});
