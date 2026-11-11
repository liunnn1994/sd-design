describe('React Cascader option view', () => {
  it('expands parents, selects leaves and disables locked options', () => {
    cy.visit('/cascader-option.html');
    cy.get('[data-testid="root"] > button').click().should('have.attr', 'aria-haspopup', 'true');
    cy.get('[data-testid="path"]').should('have.text', 'root');
    cy.get('[data-testid="value"]').should('have.text', '""');
    cy.get('[data-testid="one"] > button').click();
    cy.get('[data-testid="value"]').should('have.text', '"one"');
    cy.get('[data-testid="locked"] > button').should('be.disabled');
  });
  it('expands on hover and clears active state on leave', () => {
    cy.visit('/cascader-option.html?hover');
    cy.get('[data-testid="root"] > button').trigger('mouseover');
    cy.get('[data-testid="active"]').should('have.text', 'root');
    cy.get('[data-testid="path"]').should('have.text', 'root');
    cy.get('[data-testid="root"] > button')
      .should('have.attr', 'aria-expanded', 'true')
      .trigger('mouseout');
    cy.get('[data-testid="active"]').should('have.text', '');
  });
  it('uses isolated checkbox state, parent indeterminate state and selection locks', () => {
    cy.visit('/cascader-option.html?multiple');
    cy.get('[data-testid="one"] label').click();
    cy.get('[data-testid="value"]').should('have.text', '["one"]');
    cy.get('[data-testid="root"] input').should('have.prop', 'indeterminate', true);
    cy.get('[data-testid="unselectable"] input').should('be.disabled');
    cy.get('[data-testid="locked"] input').should('be.disabled');
    cy.get('[data-testid="one"] label').click();
    cy.get('[data-testid="value"]').should('have.text', '[]');
  });
  it('selects strict parents through radio without duplicate row selection', () => {
    cy.visit('/cascader-option.html?strict');
    cy.get('[data-testid="root"] label').click();
    cy.get('[data-testid="value"]').should('have.text', '"root"');
    cy.get('[data-testid="root"] input').should('be.checked');
  });
  it('renders path formatting ahead of custom options and omits search arrows', () => {
    cy.visit('/cascader-option.html?path&search');
    cy.get('[data-testid="one"]').should('contain.text', 'Root > One');
    cy.contains('button', 'Format').click();
    cy.contains('button', 'Custom').click();
    cy.get('[data-testid="one"]')
      .should('contain.text', 'Root / One')
      .and('not.contain.text', 'Custom');
    cy.get('[data-testid="root"] .sd-icon-right').should('not.exist');
  });
  it('switches ellipsis modes, custom rendering and loading indicators', () => {
    cy.visit('/cascader-option.html');
    cy.contains('button', /^Ellipsis$/).click();
    cy.get('[data-testid="one"] .sd-ellipsis').should('exist');
    cy.contains('button', 'Performant').click();
    cy.get('[data-testid="one"]').should('contain.text', 'One');
    cy.contains('button', 'Custom').click();
    cy.get('[data-testid="one"] strong').should('have.text', 'Custom One');
    cy.contains('button', 'Loading').click();
    cy.get('[data-testid="root"] .sd-icon-loading').should('exist');
  });
});
