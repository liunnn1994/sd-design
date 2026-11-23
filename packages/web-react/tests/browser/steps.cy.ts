describe('React steps', () => {
  beforeEach(() => cy.visit('/steps.html'));

  it('keeps controlled steps unchanged until writeback and ignores disabled activation', () => {
    cy.contains('[role="listitem"]', '受控第一步').should('have.attr', 'aria-current', 'step');
    cy.contains('[role="listitem"]', '受控第二步').focus().type('{enter}');
    cy.get('[data-testid="step-requests"]').should('have.text', '1');
    cy.contains('[role="listitem"]', '受控第一步').should('have.attr', 'aria-current', 'step');
    cy.contains('[role="listitem"]', '禁用步骤')
      .should('have.attr', 'aria-disabled', 'true')
      .should('not.have.attr', 'tabindex');
    cy.contains('[role="listitem"]', '禁用步骤').click();
    cy.contains('[role="listitem"]', '禁用步骤').trigger('keydown', { key: ' ' });
    cy.get('[data-testid="step-requests"]').should('have.text', '1');
    cy.contains('button', '外部切换步骤').click();
    cy.contains('[role="listitem"]', '受控第二步').should('have.attr', 'aria-current', 'step');
  });

  it('activates an uncontrolled step with Space and keeps non-changeable steps outside tab order', () => {
    cy.get('[data-testid="dynamic-steps"]').should('have.attr', 'role', 'list');
    cy.get('[data-testid="dynamic-steps"] [role="listitem"]')
      .eq(1)
      .should('have.attr', 'aria-current', 'step');
    cy.get('[data-testid="dynamic-steps"] [role="listitem"]')
      .eq(0)
      .should('have.attr', 'tabindex', '0');
    cy.get('[data-testid="dynamic-steps"] [role="listitem"]')
      .eq(0)
      .focus()
      .type(' ')
      .should('have.attr', 'aria-current', 'step');
    cy.contains('[data-testid="custom-steps"] [role="listitem"]', '自定义图标').as('staticStep');
    cy.get('@staticStep').should('not.have.attr', 'tabindex');
    cy.get('@staticStep').click();
    cy.get('@staticStep').should('not.have.attr', 'aria-current');
  });

  it('updates step indexes and error connections after reorder, removal and nested registration', () => {
    cy.get('[data-testid="dynamic-steps"] > div > .sd-steps-item')
      .eq(0)
      .should('have.class', 'sd-steps-item-next-error');
    cy.contains('button', '切换步骤错误').click();
    cy.get('[data-testid="dynamic-steps"] > div > .sd-steps-item')
      .eq(0)
      .should('not.have.class', 'sd-steps-item-next-error');
    cy.contains('button', '切换步骤错误').click();
    cy.contains('button', '重排步骤').click();
    cy.get('[data-testid="dynamic-steps"] > div > .sd-steps-item').should('have.length', 3);
    cy.get('[data-testid="dynamic-steps"] > div')
      .first()
      .find('.sd-steps-item')
      .first()
      .should('contain.text', 'C')
      .should('not.have.class', 'sd-steps-item-next-error')
      .click();
    cy.get('[data-testid="dynamic-steps"] > div')
      .first()
      .find('.sd-steps-item')
      .first()
      .should('have.attr', 'aria-current', 'step');
    cy.get('[data-testid="nested-steps"] .sd-steps-icon').should('have.text', '1');
  });

  it('applies steps direction rules and custom node renderers', () => {
    cy.get('[data-testid="dynamic-steps"]')
      .should('have.class', 'sd-steps-vertical')
      .and('have.class', 'sd-steps-size-small');
    cy.contains('button', '切换步骤类型').click();
    cy.get('[data-testid="dynamic-steps"]')
      .should('have.class', 'sd-steps-mode-dot')
      .and('have.class', 'sd-steps-label-horizontal')
      .and('not.have.class', 'sd-steps-size-small');
    cy.contains('button', '切换步骤连接线').click();
    cy.get('[data-testid="dynamic-steps"] > div')
      .first()
      .find('.sd-steps-item-tail')
      .should('not.exist');
    cy.contains('button', '切换步骤类型').click();
    cy.get('[data-testid="dynamic-steps"]')
      .should('have.class', 'sd-steps-horizontal')
      .and('have.class', 'sd-steps-mode-arrow');
    cy.get('[data-testid="dynamic-steps"] > div')
      .first()
      .find('.sd-steps-item-node')
      .should('not.exist');
    cy.contains('button', '切换步骤类型').click();
    cy.get('[data-testid="dynamic-steps"]')
      .should('have.class', 'sd-steps-mode-navigation')
      .and('have.class', 'sd-steps-label-horizontal');
    cy.get('[data-testid="custom-steps"] b').should('have.text', '1:process');
    cy.get('[data-testid="custom-steps"] i').should('have.text', '图标 2');
    cy.get('[data-testid="custom-steps"]')
      .should('contain.text', '自定义标题')
      .and('not.contain.text', '被覆盖标题');
  });
});
