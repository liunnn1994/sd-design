describe('React tag', () => {
  beforeEach(() => cy.visit('/tag.html'));

  it('supports tag custom tooltips with and without ellipsis and expands multiline text', () => {
    cy.get('[data-testid="custom-tag"] .sd-tag-text').trigger('mouseover');
    cy.get('[role="tooltip"]').should('be.visible').and('contain.text', '标签自定义提示');
    cy.get('[data-testid="custom-tag"] .sd-tag-text').trigger('mouseout');
    cy.get('[data-testid="plain-tag"] .sd-tag-text').trigger('mouseover');
    cy.get('[role="tooltip"]').should('contain.text', '无省略提示');
    cy.get('[data-testid="plain-tag"] .sd-tag-text').trigger('mouseout');
    cy.get('[data-testid="disabled-tooltip-tag"] .sd-tag-text').trigger('mouseover');
    cy.get('[role="tooltip"]').should('not.exist');
    cy.get('[data-testid="multiline-tag"]').should('have.class', 'sd-tag-ellipsis-line-clamp');
    cy.get('[data-testid="multiline-tag"] .sd-ellipsis').click();
    cy.get('[data-testid="multiline-tag"] .sd-ellipsis').should(
      'have.attr',
      'aria-expanded',
      'true',
    );
  });

  it('tag supports check and close keyboard actions without changing controlled values', () => {
    cy.get('[data-testid="check-tag"]').click().should('have.attr', 'aria-pressed', 'true');
    cy.get('[data-testid="check-tag"]')
      .trigger('keydown', { key: ' ' })
      .should('have.attr', 'aria-pressed', 'false');
    cy.get('[data-testid="controlled-tag"]').click().should('have.attr', 'aria-pressed', 'false');
    cy.get('[data-testid="close-tag"] .sd-tag-close-btn').trigger('keydown', { key: 'Enter' });
    cy.get('[data-testid="close-tag"]').should('not.exist');
    cy.get('[data-testid="fixed-tag"] .sd-tag-close-btn').click();
    cy.get('[data-testid="fixed-tag"]').should('exist');
  });

  it('updates tooltip content on mounted tags in both ellipsis modes', () => {
    const label = () => cy.get('[data-testid="dynamic-tooltip-tag"] .sd-tag-text');
    const toggle = () => cy.contains('button', 'Toggle tag tip').click();
    const tooltip = () => cy.get('[role="tooltip"]');
    for (const performant of [false, true]) {
      if (performant) cy.contains('button', 'Toggle performant tag').click();
      toggle();
      label().trigger('mouseover');
      tooltip().should('be.visible').and('contain.text', 'Added tag tip');
      label().trigger('mouseout');
      toggle();
      label().trigger('mouseover');
      tooltip().should('not.exist');
      label().trigger('mouseout');
    }
  });

  it('retains requested values when controlled bindings are released and isolates close events', () => {
    const tag = () => cy.get('[data-testid="released-tag"]');
    tag().find('.sd-tag-close-btn').should('have.attr', 'role', 'button').focus();
    cy.press(Cypress.Keyboard.Keys.TAB);
    cy.contains('button', 'Release checked').should('be.focused');
    cy.get('[data-testid="tag-events"]').should('be.empty');
    tag().trigger('keydown', { key: 'Enter' }).should('have.attr', 'aria-pressed', 'false');
    cy.contains('button', 'Release checked').click();
    tag()
      .should('have.attr', 'aria-pressed', 'true')
      .trigger('keydown', { key: ' ' })
      .should('have.attr', 'aria-pressed', 'false');
    tag().find('.sd-tag-close-btn').click();
    tag().should('exist');
    cy.get('[data-testid="tag-events"]').should(
      'have.text',
      'checked:true|check:true:keydown|checked:false|check:false:keydown|visible:false|close:click',
    );
    cy.contains('button', 'Release visible').click();
    tag().should('not.exist');
  });

  it('recalculates custom alpha, removes stale colors and resolves gradients after prop changes', () => {
    const tag = () => cy.get('[data-testid="color-tag"]');
    const change = () => cy.contains('button', 'Change tag color').click();
    tag().should('have.css', 'background-color', 'rgba(10, 20, 30, 0.25)');
    change();
    tag().should('have.css', 'background-color', 'rgba(10, 20, 30, 0)');
    change();
    tag()
      .should('have.class', 'sd-tag-red')
      .should(([$tag]) => {
        expect($tag.style.getPropertyValue('--sd-tag-bg-color')).to.equal('');
      });
    change();
    tag().should('have.css', 'background-color', 'rgb(128, 128, 128)');
  });
});
