describe('React card', () => {
  beforeEach(() => cy.visit('/card.html'));

  it('moves card actions with nested Meta lifecycle and updates dynamic action content', () => {
    cy.get('[data-testid="card-meta"] .sd-card-actions').should('have.length', 1);
    cy.get('[data-testid="card-meta"] .sd-card-meta-footer .sd-card-actions-item').should(
      'have.length',
      2,
    );
    cy.contains('button', '卡片操作 0').click();
    cy.contains('button', '卡片操作 1').should('exist');
    cy.contains('button', '切换卡片详情').click();
    cy.get('[data-testid="card-meta"] .sd-card-body > .sd-card-actions').should('exist');
    cy.contains('button', '切换卡片详情').click();
    cy.get('[data-testid="card-meta"] .sd-card-body > .sd-card-actions').should('not.exist');
    cy.contains('button', '切换卡片操作').click();
    cy.get('[data-testid="card-meta"] .sd-card-actions').should('not.exist');
    cy.contains('button', '切换卡片操作').click();
    cy.get('[data-testid="card-meta"] .sd-card-meta-footer .sd-card-actions').should('exist');
  });

  it('tracks grids until the final child unmounts and resolves provider size and header changes', () => {
    cy.get('[data-testid="card-meta"]')
      .should('have.class', 'sd-card-size-small')
      .and('have.class', 'sd-card-hoverable');
    cy.get('[data-testid="card-meta"] .sd-card-header-title').should('have.text', '卡片标题');
    cy.get('[data-testid="card-meta"] .sd-card-header-extra').should('have.text', '更多');
    cy.get('[data-testid="card-meta"] .sd-card-cover').should('have.text', '封面');
    cy.get('[data-testid="card-meta"] .sd-card-body-scrollbar').should('not.exist');
    cy.get('[data-testid="card-grid"]')
      .should('have.class', 'sd-card-size-medium')
      .and('not.have.class', 'sd-card-bordered');
    cy.contains('button', '移除卡片网格').click();
    cy.get('[data-testid="card-grid"]')
      .should('have.class', 'sd-card-contain-grid')
      .find('.sd-card-grid-hoverable')
      .should('have.length', 1);
    cy.contains('button', '移除卡片网格').click();
    cy.get('[data-testid="card-grid"]').should('not.have.class', 'sd-card-contain-grid');
    cy.contains('button', '切换卡片标题').click();
    cy.get('[data-testid="card-meta"] .sd-card-header')
      .should('have.class', 'sd-card-header-no-title')
      .and('have.css', 'color', 'rgb(255, 0, 0)');
  });

  it('updates Meta content and switches the footer to actions-only when the avatar is removed', () => {
    cy.get('[data-testid="card-meta"] .sd-card-meta-title').should('have.text', '嵌套详情');
    cy.get('[data-testid="card-meta"] .sd-card-meta-description').should('have.text', '描述');
    cy.get('[data-testid="card-meta"] .sd-card-meta-avatar').should('have.text', 'A');
    cy.get('[data-testid="card-meta"] .sd-card-meta-footer').should(
      'not.have.class',
      'sd-card-meta-footer-only-actions',
    );
    cy.contains('button', '切换详情内容').click();
    cy.get('[data-testid="card-meta"] .sd-card-meta-title strong').should(
      'have.text',
      '更新后的详情',
    );
    cy.get('[data-testid="card-meta"] .sd-card-meta-description').should('not.exist');
    cy.get('[data-testid="card-meta"] .sd-card-meta-avatar').should('not.exist');
    cy.get('[data-testid="card-meta"] .sd-card-meta-footer-only-actions .sd-card-actions').should(
      'exist',
    );
    cy.contains('button', '切换详情内容').click();
    cy.get('[data-testid="card-meta"] .sd-card-meta-footer').should(
      'not.have.class',
      'sd-card-meta-footer-only-actions',
    );
    cy.get('[data-testid="card-meta"] .sd-card-meta-avatar').should('have.text', 'A');
  });

  it('replaces card content during loading and merges provider and local Spin options', () => {
    cy.get('[data-testid="card-local-spin"] .sd-spin-tip').should('have.text', '局部卡片加载');
    cy.contains('button', '切换卡片加载').click();
    cy.get('[data-testid="card-meta"] .sd-spin-tip').should('have.text', '全局卡片加载');
    cy.get('[data-testid="card-meta"] .sd-card-meta').should('not.exist');
    cy.get('[data-testid="card-meta"] .sd-card-body > .sd-card-actions').should('exist');
    cy.contains('button', '切换卡片加载').click();
    cy.get('[data-testid="card-meta"] .sd-card-meta').should('exist');
    cy.get('[data-testid="card-meta"] .sd-card-actions').should('have.length', 1);
  });

  it('scrolls full-height cards with custom and native viewports', () => {
    cy.get('[data-testid="card-scroll"]').should('have.css', 'height', '180px');
    cy.get('[data-testid="card-scroll"] .sd-card-body-scrollbar [data-overlayscrollbars-viewport]')
      .scrollTo('bottom')
      .should(($node) => expect($node[0].scrollTop).to.be.greaterThan(0));
    cy.contains('button', '切换卡片滚动').click();
    cy.get('[data-testid="card-scroll"] .sd-card-body-native')
      .should('have.css', 'overflow', 'auto')
      .scrollTo('bottom')
      .should(($node) => expect($node[0].scrollTop).to.be.greaterThan(0));
    cy.get('[data-testid="card-scroll"] .sd-card-body-scrollbar').should('not.exist');
  });
});
