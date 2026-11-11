describe('React Switch', () => {
  beforeEach(() => cy.visit('/'));

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

  it('scales avatar text and recovers a failed image when its URL changes', () => {
    cy.get('[data-testid="text-avatar"]').should('have.css', 'width', '32px');
    cy.get('[data-testid="text-avatar"] .sd-avatar-text').should(($text) => {
      expect($text[0].style.transform).to.contain('scale(');
    });
    cy.get('[data-testid="image-avatar"]').should('contain.text', '头像失败');
    cy.contains('button', '重试头像').click();
    cy.get('[data-testid="image-avatar"] img').should(($img) => {
      expect(($img[0] as HTMLImageElement).naturalWidth).to.eq(10);
    });
    cy.get('[data-testid="image-avatar"]').should('not.contain.text', '头像失败');
    cy.get('[data-testid="avatar-loads"]').should('have.text', '1');
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

  it('delays the loading mask, cancels short requests and keeps standalone indicators visible', () => {
    cy.clock();
    cy.get('[data-testid="standalone-spin"]').should('have.attr', 'aria-busy', 'true');
    cy.get('[data-testid="standalone-spin"] .sd-dot-loading-item').should('have.length', 5);
    cy.contains('button', '切换加载').click();
    cy.tick(399);
    cy.get('[data-testid="delayed-spin"] .sd-spin-mask').should('not.exist');
    cy.tick(1);
    cy.get('[data-testid="delayed-spin"] .sd-spin-mask').should('be.visible');
    cy.contains('button', '切换加载').click();
    cy.get('[data-testid="delayed-spin"] .sd-spin-mask').should('not.exist');
    cy.contains('button', '切换加载').click();
    cy.tick(100);
    cy.contains('button', '切换加载').click();
    cy.tick(400);
    cy.get('[data-testid="delayed-spin"]').should('not.have.attr', 'aria-busy');
    cy.get('[data-testid="delayed-spin"]').should('contain.text', '保留内容');
  });

  it('updates global locale without overriding an explicit provider locale', () => {
    cy.get('[data-testid="global-empty"]').should('not.contain.text', 'No Data');
    cy.contains('button', '切换全局英文').click();
    cy.get('[data-testid="global-empty"]').should('contain.text', 'No Data');
    cy.get('[data-testid="localized-empty"]').should('not.contain.text', 'No Data');
    cy.contains('button', '切换局部语言').click();
    cy.get('[data-testid="localized-empty"]').should('contain.text', 'No Data');
  });

  it('keeps defaultChecked after mount and changes on click', () => {
    cy.get('[aria-label="默认开启"]')
      .should('have.attr', 'aria-checked', 'true')
      .click()
      .should('have.attr', 'aria-checked', 'false');
  });

  it('keeps numeric zero text in the styled slots when switching states', () => {
    cy.visit('/?zero-switch-text');
    const root = () => cy.get('[aria-label="默认开启"]');
    root().find('.sd-switch-text').should('have.text', '0');
    root().find('.sd-switch-text-holder').should('have.text', '0');
    root().click().should('have.attr', 'aria-checked', 'false');
    root().find('.sd-switch-text').should('have.text', '0');
    root().find('.sd-switch-text-holder').should('have.text', '0');
  });

  it('commits controlled changes only when the parent writes back', () => {
    cy.get('[aria-label="受控"]').click();
    cy.get('[aria-label="受控"]').should('have.attr', 'aria-checked', 'true');
    cy.get('[aria-label="锁定受控"]').click();
    cy.get('[aria-label="锁定受控"]').should('have.attr', 'aria-checked', 'false');
    cy.get('[data-testid="changes"]').should('have.text', '1');
  });

  it('shows pending validation and commits exactly once', () => {
    cy.get('[aria-label="异步校验"]').click().should('have.attr', 'aria-busy', 'true');
    cy.get('[aria-label="异步校验"]')
      .should('have.attr', 'aria-checked', 'true')
      .should('not.have.attr', 'aria-busy');
    cy.get('[data-testid="changes"]').should('have.text', '1');
  });

  it('blocks vetoed and disabled transitions', () => {
    cy.get('[aria-label="拒绝切换"]').click().should('have.attr', 'aria-checked', 'false');
    cy.get('[aria-label="禁用"]')
      .should('be.disabled')
      .should('have.attr', 'aria-checked', 'false');
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

  it('updates local theme and removes the popup theme container on unmount', () => {
    cy.get('[data-testid="local-theme"] .sd-theme-provider').should(
      'have.attr',
      'sd-theme',
      'light',
    );
    cy.get('.sd-theme-popup-container').then(($containers) => {
      const count = $containers.length;
      const targets = $containers
        .toArray()
        .filter((element) => element.style.getPropertyValue('--color-primary-6') === '#123456');
      expect(targets, 'owned local theme popup containers').to.have.length(1);
      const target = targets[0];
      cy.wrap(target).should('have.attr', 'sd-theme', 'light');
      cy.contains('button', '切换局部主题').click();
      cy.get('[data-testid="local-theme"] .sd-theme-provider').should(
        'have.attr',
        'sd-theme',
        'dark',
      );
      cy.wrap(target).should('have.attr', 'sd-theme', 'dark');
      cy.contains('button', '卸载局部主题').click();
      cy.wrap({ target }).should(({ target }) => expect(target.isConnected).to.equal(false));
      cy.get('.sd-theme-popup-container').should('have.length', count - 1);
    });
  });

  it('observes ambient theme after StrictMode replay and restores global mode on unmount', () => {
    cy.get('[data-testid="inherited-theme"] .sd-theme-provider').should(
      'have.attr',
      'data-sd-theme',
      'light',
    );
    cy.document().then((document) => document.body.setAttribute('sd-theme', 'dark'));
    cy.get('[data-testid="inherited-theme"] .sd-theme-provider').should(
      'have.attr',
      'data-sd-theme',
      'dark',
    );
    cy.document().then((document) => document.body.removeAttribute('sd-theme'));
    cy.get('[data-testid="inherited-theme"] .sd-theme-provider').should(
      'have.attr',
      'data-sd-theme',
      'light',
    );
    cy.contains('button', '切换全局主题').click();
    cy.get('body').should('have.attr', 'sd-theme', 'dark');
    cy.contains('button', '切换全局主题').click();
    cy.get('body').should('not.have.attr', 'sd-theme');
  });

  it('keeps the controlled value while auto loading and clears loading after writeback', () => {
    cy.get('[aria-label="自动加载"]')
      .click()
      .should('have.attr', 'aria-busy', 'true')
      .should('have.attr', 'aria-checked', 'false');
    cy.get('[aria-label="自动加载"]')
      .should('have.attr', 'aria-checked', 'true')
      .should('not.have.attr', 'aria-busy');
  });

  it('blocks repeated synchronous clicks during validation and handles rejected promises', () => {
    cy.get('[aria-label="异步校验"]').then(($button) => {
      $button[0].click();
      $button[0].click();
    });
    cy.get('[aria-label="异步校验"]').should('have.attr', 'aria-checked', 'true');
    cy.get('[data-testid="changes"]').should('have.text', '1');
    cy.get('[aria-label="拒绝异步"]')
      .click()
      .should('have.attr', 'aria-checked', 'false')
      .should('not.have.attr', 'aria-busy');
  });
});

export {};
