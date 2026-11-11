describe('React Cascader integration boundaries', () => {
  it('focuses and blurs through its ref and validates Form blur/change', () => {
    cy.visit('/cascader-boundaries.html');
    cy.contains('button', 'Focus ref').click();
    cy.get('[data-testid="form-choice"] input').should('be.focused');
    cy.contains('button', 'Blur ref').click();
    cy.get('[data-testid="form-choice"] input').should('not.be.focused');
    cy.contains('Choose a leaf').should('be.visible');
    cy.get('[data-testid="form-choice"] input').click();
    cy.get('button.sd-cascader-option[title="Root"]').click();
    cy.get('button.sd-cascader-option[title="One"]').click();
    cy.get('[data-testid="model"]').should('have.text', '{"choice":"one"}');
    cy.contains('Choose a leaf').should('not.exist');
    cy.get('[data-testid="events"]').should('contain.text', 'focus|blur');
    cy.contains('button', 'Disable form').click();
    cy.get('[data-testid="form-choice"] input').should('be.disabled');
  });
  it('clears enabled values while preserving disabled tags and event order', () => {
    cy.visit('/cascader-boundaries.html');
    cy.get('[data-testid="multi"] input').focus();
    cy.get('[data-testid="multi"] .sd-select-view-clear-btn').click();
    cy.get('[data-testid="events"]').should('have.text', 'multi:["locked"]|clear');
    cy.get('[data-testid="multi"]')
      .should('contain.text', 'Root / Locked')
      .and('not.contain.text', 'Root / One');
  });
  it('blocks clearing in readonly mode', () => {
    cy.visit('/cascader-boundaries.html');
    cy.contains('button', 'Readonly multi').click();
    cy.get('[data-testid="multi"] input').focus();
    cy.get('[data-testid="multi"] .sd-select-view-clear-btn').click();
    cy.get('[data-testid="events"]').should('have.text', '');
    cy.get('[data-testid="multi"]').should('contain.text', 'Root / One');
  });
  it('honors local opt-outs under provider defaults', () => {
    cy.visit('/cascader-boundaries.html');
    cy.get('[data-testid="optout"] .sd-select-view-clear-btn').should('not.exist');
    cy.get('[data-testid="optout"] input').should('have.attr', 'readonly');
    cy.get('[data-testid="optout"] input').should('have.attr', 'aria-autocomplete', 'none');
  });
  it('applies custom trigger width to the positioning host', () => {
    cy.visit('/cascader-boundaries.html');
    cy.get('[data-testid="width-trigger"]').parent().should('have.css', 'width', '180px');
  });
});
