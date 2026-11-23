describe('React Cascader option indexes', () => {
  it('rebuilds lazy children and invalidates cached children when a source is replaced', () => {
    cy.visit('/cascader-options.html');
    cy.get('[data-testid="leaves"]').should('have.text', '');
    cy.contains('button', /^Load$/).click();
    cy.get('[data-testid="loading"]').should('have.text', 'true');
    cy.contains('button', 'Complete').click();
    cy.get('[data-testid="leaves"]').should('have.text', 'branch-child');
    cy.get('[data-testid="depth"]').should('have.text', '2');
    cy.contains('button', 'Replace').click();
    cy.get('[data-testid="leaves"]').should('have.text', '');
    cy.contains('button', /^Load$/).click();
    cy.get('[data-testid="calls"]').should('have.text', '2');
    cy.contains('button', 'Complete').click();
    cy.get('[data-testid="leaves"]').should('have.text', 'branch-child');
  });
  it('uses direct children over cached data and clears indexes when options are removed', () => {
    cy.visit('/cascader-options.html');
    cy.contains('button', /^Load$/).click();
    cy.contains('button', 'Complete').click();
    cy.contains('button', 'Mutate').click();
    cy.get('[data-testid="leaves"]').should('have.text', 'branch-direct');
    cy.get('[data-testid="keys"]').should('not.contain', 'branch-child');
    cy.contains('button', 'Remove').click();
    cy.get('[data-testid="keys"]').should('have.text', '');
    cy.get('[data-testid="values"]').should('have.text', '[]');
  });
  it('reclassifies branches when strict selection or lazy loading changes', () => {
    cy.visit('/cascader-options.html');
    cy.contains('button', 'Strict').click();
    cy.get('[data-testid="leaves"]').should('have.text', 'branch');
    cy.contains('button', 'Strict').click();
    cy.get('[data-testid="leaves"]').should('have.text', '');
    cy.contains('button', 'Loader').click();
    cy.get('[data-testid="leaves"]').should('have.text', 'branch');
    cy.contains('button', /^Load$/).click();
    cy.get('[data-testid="calls"]').should('have.text', '0');
  });
  it('maps custom fields and object value keys without losing disabled selection rules', () => {
    cy.visit('/cascader-options.html?mode=fields');
    cy.get('[data-testid="keys"]').should('have.text', 'root-child,root');
    cy.get('[data-testid="nodes"]')
      .invoke('text')
      .then((text) => {
        const nodes = JSON.parse(text);
        expect(nodes[0]).to.include({ label: 'Child', disabled: true });
        expect(nodes[0].pathValue).to.deep.equal([{ id: 'root' }, { id: 'child' }]);
        expect(nodes[1]).to.include({ selectionDisabled: true });
      });
    cy.contains('button', 'Strict').click();
    cy.get('[data-testid="leaves"]').should('have.text', 'root-child,root');
    cy.get('[data-testid="nodes"]')
      .invoke('text')
      .then((text) => expect(JSON.parse(text)[1].selectionDisabled).to.equal(false));
  });
  it('ignores completion after the loading option is removed', () => {
    cy.visit('/cascader-options.html');
    cy.contains('button', /^Load$/).click();
    cy.contains('button', 'Remove').click();
    cy.contains('button', 'Complete').click();
    cy.get('[data-testid="keys"]').should('have.text', '');
    cy.get('[data-testid="leaves"]').should('have.text', '');
  });
});
