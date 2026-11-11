describe('React Cascader dropdown integration', () => {
  it('opens the menu, selects zero and closes with the full path label', () => {
    cy.visit('/cascader-dropdown.html');
    cy.get('[role="combobox"]').click().should('have.attr', 'aria-expanded', 'true');
    cy.get('button.sd-cascader-option[title="Root"]').click();
    cy.get('button.sd-cascader-option[title="Zero"]').click();
    cy.get('[data-testid="events"]').should('contain.text', 'change:0');
    cy.get('.sd-cascader').should('contain.text', 'Root / Zero');
    cy.get('[role="combobox"]').should('have.attr', 'aria-expanded', 'false');
  });
  it('searches complete paths and selects a filtered leaf with the keyboard', () => {
    cy.visit('/cascader-dropdown.html');
    cy.get('[role="combobox"]').type('One');
    cy.get('.sd-cascader-search-option').should('have.length', 1).and('contain.text', 'Root / One');
    cy.get('[data-testid="events"]').should('contain.text', 'search:One');
    cy.get('[role="combobox"]').type('{downarrow}{enter}');
    cy.get('[data-testid="events"]').should('contain.text', 'change:1');
    cy.get('[role="combobox"]').should('have.value', '');
  });
  it('keeps multi selection open and clears the search after checking a result', () => {
    cy.visit('/cascader-dropdown.html?multiple');
    cy.get('[role="combobox"]').type('Zero');
    cy.get('.sd-cascader-search-option label').click();
    cy.get('[data-testid="events"]').should('contain.text', 'change:[0]');
    cy.get('[role="combobox"]').should('have.attr', 'aria-expanded', 'true').and('have.value', '');
    cy.get('.sd-cascader').should('contain.text', 'Root / Zero');
  });
  it('honors controlled show refusal and acceptance', () => {
    cy.visit('/cascader-dropdown.html?controlled');
    cy.get('[role="combobox"]').click().should('have.attr', 'aria-expanded', 'false');
    cy.get('[data-testid="events"]').should('contain.text', 'show:true');
    cy.contains('button', /^Accept$/).click();
    cy.get('[role="combobox"]').click().should('have.attr', 'aria-expanded', 'true');
  });
  it('blocks disabled and readonly opening', () => {
    cy.visit('/cascader-dropdown.html');
    cy.contains('button', /^Readonly$/).click();
    cy.get('[role="combobox"]').click().should('have.attr', 'aria-expanded', 'false');
    cy.contains('Locked field').should('be.visible');
    cy.contains('button', /^Disable$/).click();
    cy.get('[role="combobox"]').should('be.disabled');
  });
  it('renders unresolved values and a custom trigger with live display state', () => {
    cy.visit('/cascader-dropdown.html?fallback');
    cy.get('.sd-cascader').should('contain.text', 'missing');
    cy.visit('/cascader-dropdown.html?custom');
    cy.get('[data-testid="custom"]').click().should('have.text', 'Choose:true');
    cy.get('button.sd-cascader-option[title="Root"]').click();
    cy.get('button.sd-cascader-option[title="One"]').click();
    cy.get('[data-testid="custom"]').should('have.text', 'Root / One:false');
  });
});
