describe('React Cascader documentation demo preview', () => {
  beforeEach(() => cy.visit('/cascader-docs-preview.html'));
  it('selects a searched team and focuses the default example by ref', () => {
    cy.get('[data-testid="cascader-demo"] input').type('视觉');
    cy.get('.sd-cascader-search-option button[title="视觉设计"]').click();
    cy.get('[data-testid="cascader-demo"] output').should('contain.text', '"visual"');
    cy.contains('button', '聚焦级联选择').click();
    cy.get('[data-testid="cascader-demo"] input').should('be.focused');
  });
  it('adds a multi-selection without losing the initial selected team', () => {
    cy.get('[data-testid="cascader-multiple-demo"] input').type('交互');
    cy.get('.sd-cascader-search-option label').click();
    cy.get('[data-testid="cascader-multiple-demo"] output').should(
      'contain.text',
      '["frontend","interaction"]',
    );
  });
  it('retains the full path and changes selection after hover expansion', () => {
    cy.get('[data-testid="cascader-path-demo"] output').should(
      'contain.text',
      '["design","visual"]',
    );
    cy.get('[data-testid="cascader-path-demo"] .sd-cascader').click();
    cy.get('.sd-cascader-dropdown-panel button[title="研发"]').trigger('mouseover');
    cy.get('.sd-cascader-dropdown-panel button[title="后端"]').click();
    cy.get('[data-testid="cascader-path-demo"] output').should(
      'contain.text',
      '["engineering","backend"]',
    );
  });
  it('loads and selects an asynchronous region', () => {
    cy.get('[data-testid="cascader-lazy-demo"] input').click();
    cy.get('.sd-cascader-dropdown-panel button[title="区域"]').click();
    cy.get('.sd-cascader-dropdown-panel button[title="华东"]').click();
    cy.get('[data-testid="cascader-lazy-demo"] output').should('contain.text', '"east"');
  });
  it('selects a strict parent in the independent panel', () => {
    cy.get('[data-testid="cascader-panel-demo"] button[title="设计"] label').click();
    cy.get('[data-testid="cascader-panel-demo"] output').should('contain.text', '"design"');
  });
  it('updates custom trigger text and expanded state after selection', () => {
    cy.get('[data-testid="cascader-custom-demo"] button')
      .click()
      .should('have.attr', 'aria-expanded', 'true');
    cy.get('.sd-cascader-dropdown-panel button[title="设计"]').click();
    cy.get('.sd-cascader-dropdown-panel button[title="视觉设计"]').click();
    cy.get('[data-testid="cascader-custom-demo"] button')
      .should('contain.text', '设计 / 视觉设计')
      .and('have.attr', 'aria-expanded', 'false');
  });
});
