describe('首页本地模型下载交互', () => {
  it('进入首页即开始下载，示例尚未滚入视口也显示迷你进度', () => {
    cy.viewport(1200, 700);
    cy.visit('/', {
      onBeforeLoad(win) {
        Object.defineProperty(win.navigator, 'gpu', {
          configurable: true,
          value: { requestAdapter: async () => ({ features: new Set(['shader-f16']) }) },
        });
        const worker = {
          onmessage: null as ((message: unknown) => void) | null,
          addEventListener() {},
          terminate() {},
          postMessage(message: { kind: string }) {
            if (message.kind === 'reload')
              queueMicrotask(() =>
                worker.onmessage?.({ kind: 'initProgressCallback', content: { progress: 0.5 } }),
              );
          },
        };
        cy.stub(win, 'Worker').callsFake(() => worker);
      },
    });
    cy.get('#ai-examples astro-island', { timeout: 60000 }).should('not.have.attr', 'ssr');
    cy.scrollTo('top');
    cy.get('#ai-examples').should(($example) => {
      expect($example[0].getBoundingClientRect().top).to.be.greaterThan(700);
    });
    cy.get('.home-input-example__progress.sd-progress-size-mini [role="progressbar"]').should(
      'have.attr',
      'aria-valuenow',
      '50',
    );
    cy.get('.home-input-example__heading').should('have.text', '组件助手');
    cy.get('.home-input-example [role="log"] li').should('have.length', 2);
    cy.get('#ai-examples').scrollIntoView();
    cy.get('.home-input-example [role="textbox"]').clear().type('Progress 有什么用？{enter}');
    cy.get('.home-input-example [role="log"] .user')
      .last()
      .should('contain.text', 'Progress 有什么用？');
    cy.get('.home-input-example .sd-rich-text-editor-placeholder').should('be.visible');
    cy.get('.home-input-example .sd-sender-actions-btn-loading-button').click();
    cy.get('.home-input-example [role="status"]').should('contain.text', '已停止回复');
  });
});
