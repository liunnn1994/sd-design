import TreeSelect from '../index';

describe('TreeSelect readonly tip', () => {
  it('shows a tooltip when clicking a readonly tree-select', () => {
    cy.mount(TreeSelect, { props: { readonly: true, data: [{ key: '1', title: 'A' }] } });
    cy.get('.sd-tooltip-content').should('not.exist');
    cy.get('.sd-select-view').click();
    cy.get('.sd-tooltip-content').should('be.visible').and('contain', '只读');
  });

  it('does not show a tooltip when the tree-select is not readonly', () => {
    cy.mount(TreeSelect, { props: { data: [{ key: '1', title: 'A' }] } });
    cy.get('.sd-select-view').click();
    cy.get('.sd-tooltip-content').should('not.exist');
  });
});
