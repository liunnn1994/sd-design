describe('React Tree root composition', () => {
  it('keeps generated keys and selection for repeated keyless data after a presentation change', () => {
    cy.visit('/tree-root.html?keyless');
    const rows = () => cy.get('[role="treeitem"]');
    rows()
      .should('have.length', 2)
      .then(($rows) => {
        const keys = $rows.toArray().map((row) => row.getAttribute('data-key'));
        expect(new Set(keys).size).to.equal(2);
        rows().eq(1).find('.sd-tree-node-title').click();
        rows().eq(1).should('have.attr', 'aria-selected', 'true');
        cy.contains('button', 'Show tree lines').click();
        rows().should(($next) => {
          expect($next.toArray().map((row) => row.getAttribute('data-key'))).to.deep.equal(keys);
        });
        rows().eq(0).should('have.attr', 'aria-selected', 'false');
        rows().eq(1).should('have.attr', 'aria-selected', 'true');
      });
  });

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
