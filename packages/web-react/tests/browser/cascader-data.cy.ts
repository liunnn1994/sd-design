describe('React Cascader data contracts', () => {
  it('closes an open popup when disabled and keeps its combobox state synchronized', () => {
    cy.visit('/cascader-data.html');
    cy.get('[role="combobox"]').click().should('have.attr', 'aria-expanded', 'true');
    cy.contains('button', /^Disable$/).then(($button) => $button[0].click());
    cy.get('[role="combobox"]').should('be.disabled').and('have.attr', 'aria-expanded', 'false');
    cy.get('#popup-host .sd-cascader-panel').should('not.exist');
  });
  it('maps custom fields, preserves object path values and uses the requested popup container', () => {
    cy.visit('/cascader-data.html?mapped');
    cy.get('[aria-label="Data choice"]').click();
    cy.get('#popup-host button[title="Mapped root"]').click();
    cy.get('#popup-host button[title="Mapped child"]').click();
    cy.get('[data-testid="value"]').should('have.text', '[{"key":"r"},{"key":"child"}]');
    cy.get('.sd-cascader').should('contain.text', 'Mapped root / Mapped child');
  });
  it('passes raw options to custom filtering and displays only the matching leaf label', () => {
    cy.visit('/cascader-data.html?filter');
    cy.get('[role="combobox"]').type('B');
    cy.get('.sd-cascader-search-option')
      .should('have.length', 1)
      .and('contain.text', 'Two')
      .and('not.contain.text', 'Root');
    cy.get('.sd-cascader-search-option button').click();
    cy.get('[data-testid="value"]').should('have.text', '"two"');
  });
  it('inherits virtual list settings and selects the last of 500 children', () => {
    cy.visit('/cascader-data.html?virtual');
    cy.get('[role="combobox"]').click();
    cy.get('#popup-host button[title="Root"]').click();
    cy.get('.sd-cascader-panel-column')
      .last()
      .find('.sd-cascader-option')
      .should('have.length.lessThan', 50);
    cy.get('.sd-cascader-panel-column').last().find('.sd-virtual-list-scroller').scrollTo('bottom');
    cy.get('#popup-host button[title="Item 499"]').click();
    cy.get('[data-testid="value"]').should('have.text', '499');
  });
  it('ignores stale lazy results after replacing the raw source at the same key', () => {
    cy.visit('/cascader-data.html?lazy');
    cy.get('[role="combobox"]').click();
    cy.get('#popup-host button[title="Old root"]').click();
    cy.get('[data-testid="calls"]').should('have.text', '1');
    cy.contains('button', 'Replace source').click();
    cy.get('[role="combobox"]').click();
    cy.get('#popup-host button[title="New root"]').click();
    cy.get('[data-testid="calls"]').should('have.text', '2');
    cy.contains('button', 'Resolve old').click();
    cy.get('[role="combobox"]').click();
    cy.get('#popup-host button[title="Old child"]').should('not.exist');
    cy.get('#popup-host .sd-icon-loading').should('exist');
    cy.contains('button', 'Resolve new').click();
    cy.get('[role="combobox"]').click();
    cy.get('#popup-host button[title="New root"]').click();
    cy.get('[data-testid="calls"]').should('have.text', '2');
    cy.get('#popup-host button[title="New child"]').click();
    cy.get('[data-testid="value"]').should('have.text', '"new"');
  });
  it('ignores late lazy results after the dropdown unmounts', () => {
    cy.visit('/cascader-data.html?lazy');
    cy.get('[role="combobox"]').click();
    cy.get('#popup-host button[title="Old root"]').click();
    cy.contains('button', 'Unmount').click();
    cy.contains('button', 'Resolve old').click();
    cy.get('#popup-host .sd-cascader-panel').should('not.exist');
    cy.get('[data-testid="value"]').should('have.text', '');
  });
});
