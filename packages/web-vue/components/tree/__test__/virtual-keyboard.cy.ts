import Tree from '../index';

describe('Tree virtual keyboard navigation', () => {
  it('renders and focuses distant nodes when End and Home are pressed', () => {
    cy.mount(Tree, {
      props: {
        data: Array.from({ length: 200 }, (_, key) => ({ key, title: `Node ${key}` })),
        virtualListProps: { height: 160, itemSize: 32 },
      },
    });
    cy.get('[role="treeitem"][data-key="0"]').focus().trigger('keydown', { key: 'End' });
    cy.get('[role="treeitem"][data-key="199"]').should('be.visible');
    cy.focused().should('have.attr', 'data-key', '199');
    cy.focused().trigger('keydown', { key: 'Home' });
    cy.focused().should('have.attr', 'data-key', '0');
  });
});
