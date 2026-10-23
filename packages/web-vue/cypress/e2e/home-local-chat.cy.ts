describe('首页真实本地模型', () => {
  it('进入首页即开始下载，示例尚未滚入视口也显示迷你进度', () => {
    cy.viewport(1200, 700);
    cy.visit('/', {
      onBeforeLoad(win) {
        Object.defineProperty(win.navigator, 'gpu', { configurable: true, value: {} });
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
    cy.get('.home-input-example .sd-sender-actions-btn-loading-button', { timeout: 150000 }).should(
      'not.exist',
    );
    cy.then(() =>
      expect(errors, `模型运行错误；下载记录：${downloads.join(', ')}`).to.deep.equal([]),
    );
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
