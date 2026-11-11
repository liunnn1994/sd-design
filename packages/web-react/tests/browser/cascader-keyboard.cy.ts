describe('React Cascader shared keyboard integration', () => {
  it('opens and closes with Enter and Escape without selecting on opening', () => {
    cy.visit('/cascader-keyboard.html');
    cy.get('input').type('{enter}');
    cy.get('[data-testid="visible"]').should('have.text', 'true');
    cy.get('[data-testid="value"]').should('have.text', '[]');
    cy.get('input').type('{esc}');
    cy.get('[data-testid="visible"]').should('have.text', 'false');
  });
  it('skips disabled siblings, wraps and moves between parent and child columns', () => {
    cy.visit('/cascader-keyboard.html');
    cy.get('input').type('{enter}{downarrow}');
    cy.get('[data-testid="active"]').should('have.text', 'root');
    cy.get('[data-testid="prevented"]').should('have.text', 'true');
    cy.get('input').type('{uparrow}');
    cy.get('[data-testid="active"]').should('have.text', 'last');
    cy.get('input').type('{downarrow}{rightarrow}');
    cy.get('[data-testid="active"]').should('have.text', 'root-one');
    cy.get('[data-testid="columns"]').should('have.text', '2');
    cy.get('input').type('{uparrow}');
    cy.get('[data-testid="active"]').should('have.text', 'root-two');
    cy.get('input').type('{leftarrow}');
    cy.get('[data-testid="active"]').should('have.text', 'root');
  });
  it('toggles all enabled descendants on Enter and honors strict parent selection', () => {
    cy.visit('/cascader-keyboard.html');
    cy.get('input').type('{enter}{downarrow}{enter}');
    cy.get('[data-testid="value"]').should('have.text', '["one","two"]');
    cy.get('input').type('{enter}');
    cy.get('[data-testid="value"]').should('have.text', '[]');
    cy.contains('button', 'Strict').click();
    cy.get('[data-testid="active"]').should('have.text', '');
    cy.get('input').type('{downarrow}{enter}');
    cy.get('[data-testid="value"]').should('have.text', '["root"]');
  });
  it('navigates search leaves without consuming horizontal arrows', () => {
    cy.visit('/cascader-keyboard.html');
    cy.contains('button', 'Search').click();
    cy.get('input').type('{enter}{downarrow}');
    cy.get('[data-testid="active"]').should('have.text', 'root-one');
    cy.get('input').type('{rightarrow}{leftarrow}');
    cy.get('[data-testid="active"]').should('have.text', 'root-one');
    cy.get('[data-testid="prevented"]').should('have.text', 'false');
    cy.get('input').type('{enter}');
    cy.get('[data-testid="value"]').should('have.text', '["one"]');
  });
  it('does not select or expand a disabled active option', () => {
    cy.visit('/cascader-keyboard.html');
    cy.get('input').type('{enter}');
    cy.contains('button', 'Locked').click();
    cy.get('input').type('{enter}{rightarrow}');
    cy.get('[data-testid="active"]').should('have.text', 'locked');
    cy.get('[data-testid="value"]').should('have.text', '[]');
    cy.get('[data-testid="columns"]').should('have.text', '1');
  });
});
