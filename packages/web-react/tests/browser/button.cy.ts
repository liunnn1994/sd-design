describe('React button text controls', () => {
  beforeEach(() => cy.visit('/text-controls.html'));

  it('forwards button focus to ellipsis and preserves explicit tooltip precedence', () => {
    cy.get('[data-testid="ellipsis-button"]').focus();
    cy.get('[role="tooltip"]')
      .should('be.visible')
      .and('contain.text', '按钮长文本在键盘聚焦时显示省略提示');
    cy.get('[data-testid="ellipsis-button"]').should('have.focus').blur();
    cy.get('[data-testid="override-button"]').focus();
    cy.get('[role="tooltip"]')
      .should('have.length', 1)
      .and('contain.text', '完整按钮提示')
      .and('not.contain.text', '不应出现的省略提示');
  });

  it('preserves Chinese spacing after activating the button measurement', () => {
    cy.get('[data-testid="spaced-button"]').focus();
    cy.get('[data-testid="spaced-button"] [data-ellipsis-measure]').should('exist');
    cy.get('[data-testid="normal-link"]').click();
    cy.get('[data-testid="spaced-button"]').should('have.class', 'sd-btn-two-chinese-chars');
  });
});

describe('React button', () => {
  beforeEach(() => cy.visit('/button.html'));

  it('adds icon spacing only when the ellipsis has content', () => {
    const button = 'button[aria-label="Optional label"]';
    const icon = `${button} .sd-btn-icon`;
    cy.get(`${button} .sd-btn-content`).should('exist');
    cy.get(icon).should('have.css', 'margin-right', '0px');
    cy.get(button).focus();
    cy.get(`${button} [data-ellipsis-measure]`).should('exist');
    cy.get(icon).should('have.css', 'margin-right', '0px');
    cy.contains('button', 'Ready').click();
    cy.get(icon).should('have.css', 'margin-right', '8px');
  });

  it('supports button tooltips and gives custom tooltip content precedence', () => {
    cy.contains('button', '带提示按钮').focus();
    cy.get('[role="tooltip"]').should('be.visible').and('contain.text', '按钮提示内容');
    cy.contains('button', '带提示按钮').blur();
    cy.contains('button', '自定义提示按钮').focus();
    cy.get('[role="tooltip"]')
      .should('contain.text', '覆盖提示内容')
      .and('not.contain.text', '原始提示');
  });

  it('button blocks loading clicks and link navigation and inherits group disabling', () => {
    cy.contains('button', '普通按钮').click();
    cy.contains('button', '加载按钮').click();
    cy.contains('a', '加载链接').should('not.have.attr', 'href');
    cy.contains('a', '加载链接').click();
    cy.contains('button', '组内禁用').should('be.disabled');
    cy.get('[data-testid="clicks"]').should('have.text', '1');
    cy.location('hash').should('eq', '');
  });

  it('updates Chinese spacing from configuration and forwards the native button ref', () => {
    cy.get('[data-testid="chinese-button"]').should('have.class', 'sd-btn-two-chinese-chars');
    cy.contains('button', '切换字间距').click();
    cy.get('[data-testid="chinese-button"]').should('not.have.class', 'sd-btn-two-chinese-chars');
    cy.contains('button', '聚焦保存').click();
    cy.get('[data-testid="chinese-button"]').should('be.focused');
  });
});

describe('React Button lifecycle and native attributes', () => {
  beforeEach(() => cy.visit('/button.html'));

  it('updates dynamic tooltip content and removes it from the DOM', () => {
    cy.contains('button', 'Toggle help').click();
    cy.get('#action').focus();
    cy.contains('[role="tooltip"]', 'Dynamic help').should('be.visible');
    cy.contains('button', 'Toggle help').click();
    cy.contains('[role="tooltip"]', 'Dynamic help').should('not.exist');
    cy.get('#action').should('have.prop', 'tagName', 'BUTTON');
  });

  it('suppresses native form submission and replaces the icon while loading', () => {
    cy.contains('button', 'Submit')
      .should('have.attr', 'type', 'submit')
      .and('have.class', 'sd-btn-loading-fixed-width')
      .find('.sd-icon-loading')
      .should('have.class', 'sd-icon-spin');
    cy.contains('button', 'Submit').find('.sd-icon-plus').should('not.exist');
    cy.contains('button', 'Submit').click();
    cy.get('form output').should('have.text', '0');
    cy.contains('button', 'Ready').click();
    cy.contains('button', 'Submit').find('.sd-icon-plus').should('exist');
    cy.contains('button', 'Submit').click();
    cy.get('form output').should('have.text', '1');
  });

  it('merges group styling, preserves icon-only geometry and forwards native attributes', () => {
    cy.contains('button', 'Add')
      .should('have.class', 'sd-btn-only-icon')
      .and('have.class', 'sd-btn-primary')
      .and('have.class', 'sd-btn-status-danger')
      .and('have.class', 'sd-btn-shape-round')
      .and('have.class', 'sd-btn-size-small')
      .and('have.css', 'width', '28px');
    cy.contains('button', 'Override')
      .should('have.class', 'sd-btn-dashed')
      .and('have.class', 'sd-btn-status-warning')
      .and('have.class', 'sd-btn-shape-circle')
      .and('have.class', 'sd-btn-size-large');
    cy.get('button[aria-label="Full width action"]')
      .should('have.class', 'custom-action')
      .and('have.class', 'sd-btn-long')
      .and('have.attr', 'type', 'button');
    cy.get('.custom-action').should('have.css', 'width', '300px');
  });

  it('tracks group disabling and restores native activation for a button and a link', () => {
    const toggle = () => cy.contains('button', 'Toggle button group disabled').click();
    const add = () => cy.contains('button', 'Add');
    const link = () => cy.contains('a', 'Group link with a long title');
    const clicks = () => cy.get('[data-testid="group-clicks"]');
    link().should('have.attr', 'href', '#button-destination');
    toggle();
    add().should('be.disabled').click({ force: true });
    link().should('not.have.attr', 'href');
    link().click();
    clicks().should('have.text', '0');
    cy.location('hash').should('eq', '');
    toggle();
    add().should('be.enabled').click();
    clicks().should('have.text', '1');
    link().should('have.attr', 'href', '#button-destination');
    link().click();
    clicks().should('have.text', '2');
    cy.location('hash').should('eq', '#button-destination');
  });

  it('shows and clears the ellipsis description on native link focus and blur', () => {
    const link = () => cy.contains('a', 'Group link with a long title');
    const name = 'Group link with a long title';
    link().focus();
    cy.contains('[role="tooltip"]', name).should('be.visible');
    link().should('be.focused').blur();
    cy.contains('[role="tooltip"]', name).should('not.exist');
  });
});
