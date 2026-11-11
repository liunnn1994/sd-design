describe('React JsonForm shared model and schema state', () => {
  it('mutates the supplied uncontrolled model and renders edits without publishing controlled events', () => {
    cy.visit('/json-form-state.html');
    cy.get('input').should('have.value', 'first').type('!');
    cy.get('[data-testid="model"]').should('contain.text', '"name":"first!"');
    cy.get('[data-testid="original"]').should('contain.text', '"name":"first!"');
    cy.get('[data-testid="events"]').should('have.text', '');
  });
  it('routes edits to replacement model and field without changing the old object', () => {
    cy.visit('/json-form-state.html');
    cy.contains('button', 'Replace model').click();
    cy.get('input').should('have.value', 'replacement').type('!');
    cy.get('[data-testid="original"]').should('contain.text', '"name":"first"');
    cy.contains('button', 'Change field').click();
    cy.get('input').should('have.value', 'new').type('!');
    cy.get('[data-testid="model"]')
      .should('contain.text', '"second":"new!"')
      .and('contain.text', '"name":"replacement!"');
  });
  it('publishes a new top-level object for controlled fields while preserving shared nested updates', () => {
    cy.visit('/json-form-state.html?controlled');
    cy.contains('button', 'Change field').click();
    cy.get('input').type('!');
    cy.get('[data-testid="events"]')
      .should('contain.text', 'true:')
      .and('contain.text', '"second":"two!"');
    cy.get('[data-testid="model"]').should('contain.text', '"second":"two!"');
  });
  it('translates A2UI using the current model and decodes escaped JSON pointer fields', () => {
    cy.visit('/json-form-state.html?a2ui');
    cy.get('[data-testid="schemas"]').should('contain.text', '"label":"Title"');
    cy.get('input').should('have.value', 'first');
    cy.contains('button', 'Change field').click();
    cy.get('input').should('have.value', 'slash').type('!');
    cy.get('[data-testid="model"]').should('contain.text', '"a/b":"slash!"');
    cy.contains('button', 'Replace model').click();
    cy.get('[data-testid="schemas"]').should('contain.text', '"label":"New title"');
    cy.get('input').should('have.value', 'new slash');
  });
  it('lets explicit adapter configuration override changes to the provider default', () => {
    cy.visit('/json-form-state.html?a2ui&local');
    cy.get('[data-testid="adapter"]').should('have.text', 'default');
    cy.get('[data-testid="schemas"]').should('contain.text', '"component":"TextField"');
    cy.contains('button', 'Global adapter').click();
    cy.get('[data-testid="adapter"]').should('have.text', 'default');
  });
  it('retains shared prototype-path isolation during field edits', () => {
    cy.visit('/json-form-state.html?unsafe');
    cy.get('input').type('x');
    cy.get('[data-testid="model"]').should('not.contain.text', '__jsonFormAuditValue__');
    cy.window().then((win) =>
      expect(Object.hasOwn(win.Object.prototype, '__jsonFormAuditValue__')).to.equal(false),
    );
  });
});
