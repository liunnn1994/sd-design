describe('React ConfigProvider', () => {
  it('forwards ConfigProvider native attributes and events through local theme updates', () => {
    cy.visit('/?provider-attrs');
    cy.get('#provider-attrs')
      .should('have.class', 'provider-light')
      .and('have.attr', 'aria-label', 'Provider attributes')
      .and('have.attr', 'data-provider', 'light')
      .and('have.css', 'padding', '4px');
    cy.get('#provider-attrs').should('not.have.attr', 'themeMode');
    cy.get('#provider-attrs').contains('button', '主题按钮').click();
    cy.get('[data-testid="clicks"]').should('have.text', '1');
    cy.contains('button', '切换局部主题').click();
    cy.get('#provider-attrs')
      .should('have.class', 'provider-dark')
      .and('not.have.class', 'provider-light')
      .and('have.attr', 'data-provider', 'dark')
      .and('have.css', 'padding', '8px');
    cy.contains('button', '卸载局部主题').click();
    cy.get('#provider-attrs').should('not.exist');
  });

  it('updates inherited defaults without replacing explicit inner configuration', () => {
    cy.visit('/config-provider.html');
    cy.get('[data-testid="outer-button"]').should('have.class', 'sd-btn-size-medium');
    cy.get('[data-testid="inner-button"]').should('have.class', 'sd-btn-size-large');
    cy.get('[data-testid="outer-input"] .sd-input-clear-btn').should('not.exist');
    cy.contains('button', 'Toggle inherited defaults').click();
    cy.get('[data-testid="outer-button"]').should('have.class', 'sd-btn-size-mini');
    cy.get('[data-testid="inner-button"]').should('have.class', 'sd-btn-size-large');
    cy.get('[data-testid="outer-input"] .sd-input-clear-btn').should('exist');
    cy.get('[data-testid="inner-input"] .sd-input-clear-btn').should('not.exist');
    cy.get('[data-testid="outer-input"] input').should('have.value', 'Same value');
  });

  it('updates localized and custom fallbacks in mounted List and Spin consumers', () => {
    cy.visit('/config-provider.html');
    cy.get('[data-testid="provider-list"]').as('list', { type: 'static' });
    cy.get('[data-testid="provider-spin"]').as('spin', { type: 'static' });
    cy.get('@list').should('contain.text', '暂无数据');
    cy.get('@spin').find('.sd-icon-loading').should('exist');
    cy.contains('button', 'Toggle provider locale').click();
    cy.get('@list').should('contain.text', 'No Data');
    cy.contains('button', 'Toggle fallback content').click();
    cy.get('@list').should('contain.text', 'Empty list');
    cy.get('@spin').should('contain.text', 'Custom loading');
    cy.get('@spin').find('.sd-icon-loading').should('not.exist');
    cy.contains('button', 'Toggle fallback content').click();
    cy.get('@list').should('contain.text', 'No Data');
    cy.get('@spin').find('.sd-icon-loading').should('exist');
  });

  it('updates inherited picker search while preserving Select defaults and explicit overrides', () => {
    cy.visit('/config-provider.html');
    const input = (name: string) => cy.get(`[data-testid="provider-${name}"] input`);
    const pickers = ['cascader', 'tree-select'];
    for (const name of pickers) input(name).should('have.prop', 'readOnly', true);
    input('select').should('have.prop', 'readOnly', false);
    cy.contains('button', 'Toggle inherited search').click();
    for (const name of pickers) input(name).should('have.prop', 'readOnly', false);
    input('no-search').should('have.prop', 'readOnly', true);
    input('select').type('Shang');
    cy.contains('.sd-select-dropdown:visible [role="option"]', 'Shanghai').should('be.visible');
    cy.contains('.sd-select-dropdown:visible [role="option"]', 'Beijing').should('not.exist');
    cy.contains('button', 'Toggle inherited search').click();
    for (const name of pickers) input(name).should('have.prop', 'readOnly', true);
    input('select').should('have.prop', 'readOnly', false);
  });

  it('updates descendant prefixes, Chinese button spacing and RTL classes', () => {
    cy.visit('/config-provider.html');
    const button = () => cy.get('[data-testid="provider-spaced-button"]');
    const tag = () => cy.get('[data-testid="provider-direction-tag"]');
    button().should('have.class', 'sd-btn').and('not.have.class', 'sd-btn-two-chinese-chars');
    tag().should('have.class', 'sd-tag').and('not.have.class', 'sd-tag-rtl');
    cy.contains('button', 'Toggle provider presentation').click();
    button().should('have.class', 'custom-btn-two-chinese-chars').and('not.have.class', 'sd-btn');
    tag().should('have.class', 'custom-tag-rtl').and('not.have.class', 'sd-tag');
    cy.get('[data-testid="outer-button"]').should('have.class', 'sd-btn');
    cy.contains('button', 'Toggle provider presentation').click();
    button().should('have.class', 'sd-btn').and('not.have.class', 'custom-btn-two-chinese-chars');
    tag().should('have.class', 'sd-tag').and('not.have.class', 'custom-tag-rtl');
  });

  it('applies the shared control heights and prioritizes the size-specific radius token', () => {
    cy.visit('/config-provider.html');
    const sizes = { mini: 24, small: 28, medium: 32, large: 40 };
    for (const [size, height] of Object.entries(sizes)) {
      cy.get(`[data-testid="size-${size}"]`).within(() => {
        cy.get('.sd-btn').should('have.css', 'border-radius', '20px');
        cy.get('.sd-btn').should('have.css', 'height', `${height}px`);
        cy.get('.sd-input-wrapper').should('have.css', 'height', `${height}px`);
      });
    }
    cy.contains('button', 'Toggle mini radius').click();
    cy.get('[data-testid="size-mini"] .sd-btn').should('have.css', 'border-radius', '4px');
    cy.get('[data-testid="size-small"] .sd-btn').should('have.css', 'border-radius', '20px');
  });
});
