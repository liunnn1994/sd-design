describe('React Cascader columns and search panel', () => {
  it('expands columns, preserves active paths and selects typed leaf values', () => {
    cy.visit('/cascader-panels.html');
    cy.get('.sd-cascader-panel-column').should('have.length', 1);
    cy.contains('button', /^Root$/).click();
    cy.get('.sd-cascader-panel-column')
      .should('have.length', 2)
      .first()
      .should('have.css', 'z-index', '2');
    cy.get('.sd-cascader-panel-column').last().should('have.css', 'z-index', '1');
    cy.contains('button', /^Root$/).should('have.class', 'sd-cascader-option-active');
    cy.contains('button', 'Item 0').click();
    cy.get('[data-testid="value"]').should('have.text', '0');
    cy.get('[role="menu"]').should('have.length', 2);
  });
  it('prefers local empty content over provider content and updates after source replacement', () => {
    cy.visit('/cascader-panels.html');
    cy.contains('button', /^Empty$/).click();
    cy.get('.sd-empty').should('exist');
    cy.contains('button', /^Global$/).click();
    cy.get('.sd-cascader-list-empty').should('have.text', 'Global cascader');
    cy.contains('button', /^Local$/).click();
    cy.get('.sd-cascader-list-empty').should('have.text', 'Local empty');
    cy.contains('button', 'Replace').click();
    cy.contains('button', /^Root$/).click();
    cy.contains('button', 'Item 2').should('exist');
  });
  it('virtualizes large columns, scrolls to the last leaf and replaces the item set', () => {
    cy.on('uncaught:exception', (error) => {
      // The same native delivery warning is reproducible with Virtua alone.
      if (error.message.includes('ResizeObserver loop completed with undelivered notifications.'))
        return false;
    });
    cy.visit('/cascader-panels.html?virtual');
    cy.contains('button', /^Root$/).click();
    cy.get('.sd-cascader-panel-column')
      .last()
      .find('.sd-cascader-option')
      .should('have.length.lessThan', 50);
    cy.get('.sd-cascader-panel-column').last().find('.sd-virtual-list-scroller').scrollTo('bottom');
    cy.contains('button', 'Item 499').click();
    cy.get('[data-testid="value"]').should('have.text', '499');
    cy.contains('button', 'Replace').click();
    cy.contains('button', 'Item 2').should('exist');
    cy.contains('button', 'Item 499').should('not.exist');
  });
  it('renders search paths, selection and loading without expansion arrows', () => {
    cy.visit('/cascader-panels.html?search');
    cy.get('.sd-cascader-search-option').should('have.length', 2);
    cy.contains('button', 'Root / Item 1').click();
    cy.get('[data-testid="value"]').should('have.text', '1');
    cy.get('[data-testid="search"] .sd-icon-right').should('not.exist');
    cy.contains('button', 'Loading').click();
    cy.get('[data-testid="search"]').should('contain.text', 'Fetching');
    cy.get('.sd-cascader-search-option').should('not.exist');
    cy.contains('button', 'Loading').click();
    cy.get('.sd-cascader-search-option').should('have.length', 2);
  });
  it('uses local and provider empty content in search results', () => {
    cy.visit('/cascader-panels.html?search');
    cy.contains('button', /^Empty$/).click();
    cy.contains('button', /^Global$/).click();
    cy.get('[data-testid="search"]').should('contain.text', 'Global cascader');
    cy.contains('button', /^Local$/).click();
    cy.get('[data-testid="search"]').should('contain.text', 'Local empty');
  });
});
