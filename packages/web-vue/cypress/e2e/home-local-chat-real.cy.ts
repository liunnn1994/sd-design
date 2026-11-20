describe('首页真实本地模型', () => {
  before(async function () {
    const adapter = await navigator.gpu?.requestAdapter({ powerPreference: 'high-performance' });
    if (!adapter || adapter.info.isFallbackAdapter) {
      // oxlint-disable-next-line no-console
      console.info('Skipping real WebLLM smoke test: no hardware WebGPU adapter.');
      this.skip();
    }
  });

  it('真实 WebLLM 根据 llms.txt 回答默认组件问题和追问', () => {
    const errors: string[] = [];
    const downloads: string[] = [];
    for (const host of ['modelscope.cn', 'cdn.jsdelivr.net']) {
      cy.intercept(`https://${host}/**`, (request) => {
        downloads.push(request.url);
        request.on('response', (response) => downloads.push(`HTTP ${response.statusCode}`));
      });
    }
    cy.viewport(1200, 1000);
    cy.visit('/', {
      onBeforeLoad(win) {
        const original = win.console.error.bind(win.console);
        win.console.error = (...args) => {
          if (args[0] === 'Local chat failed:') errors.push(args.map(String).join(' '));
          original(...args);
        };
        Object.defineProperty(win, 'LanguageModel', {
          configurable: true,
          get() {
            throw new Error('Must not use browser AI');
          },
        });
      },
    });
    cy.get('#ai-examples astro-island', { timeout: 60000 }).should('not.have.attr', 'ssr');
    cy.get('.home-input-example [role="log"] li').should('have.length', 2);
    cy.get('#ai-examples').scrollIntoView();
    cy.get('.home-input-example__heading').should('have.text', '组件助手');
    cy.get('.home-input-example [data-rich-text-component-key="topic"] input').should(
      'have.value',
      'Sender',
    );
    cy.get('.home-input-example .sd-sender-actions-btn').click();
    cy.get('.home-input-example .sd-sender-actions-btn-loading-button').should('exist');
    // 首次请求可能先等待预加载，再等待生成，各有独立的超时。
    cy.get('.home-input-example', { timeout: 250000 }).should(($example) => {
      const diagnostics = `下载记录：${downloads.join(', ')}`;
      expect(errors, `模型运行错误；${diagnostics}`).to.deep.equal([]);
      expect($example.find('.home-input-example__error'), diagnostics).to.have.length(0);
      expect($example.find('.sd-sender-actions-btn-loading-button'), diagnostics).to.have.length(0);
    });
    cy.get('.home-input-example__heading').should('have.text', '组件助手');
    cy.get('.home-input-example .assistant').should('have.length', 2);
    cy.get('.home-input-example .assistant')
      .last()
      .find('.sd-markdown-render')
      .should(($reply) => {
        expect($reply.text().trim().length).to.be.greaterThan(1);
        expect($reply.text()).not.to.contain('示例：');
        expect($reply.text()).to.match(/Sender|输入|chat|input/i);
      });
    cy.get('.home-input-example .sd-rich-text-editor-placeholder')
      .should('be.visible')
      .and('have.text', '输入组件问题，例如：如何使用 Sender？');
    cy.get('.home-input-example [role="textbox"]').type('MarkdownRender 有什么用？{enter}');
    cy.get('.home-input-example .sd-sender-actions-btn-loading-button', { timeout: 150000 }).should(
      'not.exist',
    );
    cy.get('.home-input-example .assistant').should('have.length', 3);
    cy.get('.home-input-example .assistant')
      .last()
      .find('.sd-markdown-render')
      .should(($reply) => {
        expect($reply.text()).to.match(/Markdown|渲染|render/i);
      });
    cy.get('.home-input-example__error').should('not.exist');
    cy.get('.home-input-example .assistant')
      .last()
      .invoke('text')
      .then((reply) =>
        cy.writeFile('cypress/screenshots/webllm-real-result.json', { reply, downloads }),
      );
    cy.get('#ai-examples').screenshot('chat-webllm-real');
  });
});
