describe('React Tree root composition', () => {
  it('combines node expansion, keyboard checking and ref operations', () => {
    cy.visit('/tree-root.html');
    cy.get('[role="tree"]').should('have.attr', 'aria-label', 'Files');
    cy.get('[role="treeitem"]')
      .focus()
      .trigger('keydown', { eventConstructor: 'KeyboardEvent', key: 'ArrowRight' });
    cy.get('[role="treeitem"]').should('have.length', 3);
    cy.contains('button', 'Check one').click();
    cy.get('output').first().should('have.text', '["one"]');
    cy.get('[data-key="one"] input').should('be.checked');
  });
  it('scrolls a real virtual list to its last item through the public ref', () => {
    cy.visit('/tree-root.html?virtual');
    cy.get('[role="treeitem"]').should('have.length.lessThan', 200);
    cy.contains('button', 'Scroll last').click();
    cy.get('[data-key="199"]').should('be.visible');
  });
});
