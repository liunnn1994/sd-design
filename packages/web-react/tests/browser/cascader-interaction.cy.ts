describe('React Cascader interaction adapter', () => {
  it('opens on manual input, debounces search and clears the draft on close', () => {
    cy.visit('/cascader-interaction.html');
    cy.clock();
    cy.get('input').type('abc');
    cy.get('[data-testid="state"]')
      .should('contain.text', '"visible":true')
      .and('contain.text', '"search":true');
    cy.tick(199);
    cy.get('[data-testid="events"]').should('not.contain.text', 'search:');
    cy.tick(1);
    cy.get('[data-testid="events"]').should('have.text', 'input:a|input:ab|input:abc|search:abc');
    cy.contains('button', 'Toggle').click();
    cy.get('input').should('have.value', '');
    cy.tick(200);
    cy.get('[data-testid="events"]').should('contain.text', 'input:|search:');
  });
  it('restores the selected leaf path when opened', () => {
    cy.visit('/cascader-interaction.html');
    cy.contains('button', 'Select').click();
    cy.contains('button', 'Toggle').click();
    cy.get('[data-testid="state"]')
      .should('contain.text', '"active":"root-leaf"')
      .and('contain.text', '"path":"root-leaf"');
    cy.contains('button', 'Clear').click();
    cy.contains('button', 'Toggle').click();
    cy.get('[data-testid="state"]').should('not.contain.text', 'root-leaf');
  });
  it('honors controlled input while retaining the internal draft on release', () => {
    cy.visit('/cascader-interaction.html');
    cy.contains('button', 'Control').click();
    cy.get('input').type('x').should('have.value', 'fixed');
    cy.get('[data-testid="events"]').should('contain.text', 'input:fixedx');
    cy.contains('button', 'Release').click();
    cy.get('input').should('have.value', 'fixedx');
  });
  it('does not clear input or emit clear when selection clearing is blocked', () => {
    cy.visit('/cascader-interaction.html');
    cy.get('input').type('abc');
    cy.contains('button', 'Block').click();
    cy.contains('button', 'Clear').click();
    cy.get('input').should('have.value', 'abc');
    cy.get('[data-testid="events"]').should('not.contain.text', 'clear');
  });
  it('cancels pending searches when unmounted in StrictMode', () => {
    cy.visit('/cascader-interaction.html');
    cy.clock();
    cy.get('input').type('abc');
    cy.contains('button', 'Unmount').click();
    cy.tick(1000);
    cy.get('[data-testid="events"]').should('have.text', 'input:a|input:ab|input:abc');
  });
});
