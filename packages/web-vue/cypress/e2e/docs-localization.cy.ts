describe('文档站中文文案', () => {
  it('展示中文 API 章节并保留技术属性名', () => {
    cy.visit('/components/button/');
    cy.contains('h3', '<button> 属性').should('exist');
    cy.contains('h3', '<button> 事件').should('exist');
    cy.contains('td', 'html-type').should('exist');
  });

  it('卡片示例使用 SD Design 介绍和中文操作', () => {
    cy.visit('/components/card/');
    cy.contains('h3', '基本用法').scrollIntoView();
    cy.contains('h3', '基本用法')
      .closest('.sl-heading-wrapper')
      .nextAll('.demo-block')
      .first()
      .as('basicDemo');
    cy.get('@basicDemo').find('.sd-card', { timeout: 15000 }).as('card');
    cy.get('@card').should('contain.text', 'SD 卡片').and('contain.text', '面向数据工具与企业应用');
    cy.get('@card').contains('更多').should('be.visible');
    cy.get('@card')
      .invoke('text')
      .should('not.match', /bytedance|字节跳动/i);
  });

  it('列表示例使用中文企业数据', () => {
    cy.visit('/components/list/');
    cy.get('.demo-block .sd-list', { timeout: 15000 }).first().as('list');
    cy.get('@list').should('contain.text', '示例科技有限公司');
    cy.get('@list')
      .invoke('text')
      .should('not.match', /bytedance|toutiao|字节跳动/i);
  });

  it('提及示例可以选择中文团队', () => {
    cy.visit('/components/mention/');
    cy.get('.demo-block input[role="combobox"]', { timeout: 15000 })
      .first()
      .as('mention')
      .should('have.attr', 'placeholder', '请输入内容')
      .type('@');
    cy.contains('.sd-select-option:visible', '设计团队').click();
    cy.get('@mention').should('have.value', '@设计团队');
  });
});
