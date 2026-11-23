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
  it('toggles virtualization without closing the popup or losing later options', () => {
    cy.visit('/cascader-data.html?virtual-toggle&updates');
    const popup = () => cy.get('#popup-host .sd-cascader-panel');
    cy.get('[role="combobox"]').click();
    popup().find('.sd-cascader-option').should('have.length', 100);
    cy.contains('button', 'Toggle virtualization').then(([$button]) => $button.click());
    popup().find('.sd-virtual-list-scroller').should('be.visible');
    popup().find('.sd-cascader-option').should('have.length.lessThan', 100);
    cy.contains('button', 'Toggle virtualization').then(([$button]) => $button.click());
    popup().find('.sd-virtual-list').should('not.exist');
    popup().find('.sd-cascader-option').should('have.length', 100);
    cy.get('#popup-host button[title="Option 99"]').scrollIntoView().click();
    cy.get('[data-testid="value"]').should('have.text', '99');
  });

  it('updates an open search path separator and rejects selection while readonly', () => {
    cy.visit('/cascader-data.html?updates');
    const result = () => cy.get('#popup-host .sd-cascader-search-option');
    cy.get('[role="combobox"]').type('Two');
    result().should('have.length', 1).and('contain.text', 'Root / Two');
    cy.contains('button', 'Change separator').then(([$button]) => $button.click());
    result().should('contain.text', 'Root > Two');
    cy.contains('button', 'Toggle readonly').then(([$button]) => $button.click());
    result().find('button').click();
    cy.get('[data-testid="value"]').should('be.empty');
    cy.contains('button', 'Toggle readonly').then(([$button]) => $button.click());
    result().find('button').click();
    cy.get('[data-testid="value"]').should('have.text', '"two"');
  });

  for (const key of ['{rightarrow}', '{enter}']) {
    it(`loads a popup lazy branch using ${key} and selects the loaded leaf by keyboard`, () => {
      cy.visit('/cascader-data.html?lazy&updates');
      const input = () => cy.get('[role="combobox"]');
      input().click().type(`{downarrow}${key}`);
      cy.get('[data-testid="calls"]').should('have.text', '1');
      cy.get('#popup-host .sd-icon-loading').should('be.visible');
      input().type(key);
      cy.get('[data-testid="calls"]').should('have.text', '1');
      cy.contains('button', 'Resolve old').then(([$button]) => $button.click());
      cy.get('#popup-host button[title="Old child"]').should('be.visible');
      input().type('{rightarrow}{enter}');
      cy.get('[data-testid="value"]').should('have.text', '"old"');
      input().should('have.attr', 'aria-expanded', 'false');
    });
  }

  for (const failure of ['throw', 'reject']) {
    it(`clears the popup loading indicator and retries after ${failure}`, () => {
      cy.visit(`/cascader-data.html?lazy&updates&failure=${failure}`);
      const branch = () => cy.get('#popup-host button[title="Old root"]');
      cy.get('[role="combobox"]').click();
      branch().click();
      cy.get('[data-testid="calls"]').should('have.text', '1');
      cy.get('#popup-host .sd-icon-loading').should('not.exist');
      cy.get('[data-testid="value"]').should('be.empty');
      branch().click();
      cy.get('[data-testid="calls"]').should('have.text', '2');
      cy.get('#popup-host .sd-icon-loading').should('be.visible');
      cy.contains('button', 'Resolve new').click();
      cy.get('#popup-host button[title="New child"]').click();
      cy.get('#popup-host .sd-icon-loading').should('not.exist');
      cy.get('[data-testid="value"]').should('have.text', '"new"');
    });
  }

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
