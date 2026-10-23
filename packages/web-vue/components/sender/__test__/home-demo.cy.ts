import HomeAIExamples from '../../../../sd-vue-docs/src/components/home/HomeAIExamples.vue';
import HomeFramework from '../../../../sd-vue-docs/src/components/home/HomeFramework.vue';
import HomeInputExample from '../../../../sd-vue-docs/src/components/home/HomeInputExample.vue';

describe('首页框架切换', () => {
  it('自动循环切换且没有启停按钮，两种状态颜色不同', () => {
    cy.mount(HomeFramework);
    cy.get('.home-framework button').should('not.exist');
    cy.get('.home-framework__window').should('contain.text', 'Vue');
    cy.get('.home-framework .sd-tag')
      .invoke('css', 'background-color')
      .then((vueColor) => {
        cy.get('.home-framework__window', { timeout: 6000 }).should('contain.text', 'React');
        cy.get('.home-framework .sd-tag')
          .should('contain.text', '即将到来')
          .and(($tag) => {
            expect($tag.css('background-color')).not.to.equal(vueColor);
          });
      });
    cy.get('.home-framework__window', { timeout: 6000 }).should('contain.text', 'Vue');
  });
});
import HomeAIWorkbench from '../../../../sd-vue-docs/src/components/home/HomeAIWorkbench.vue';

describe('首页 AI 词槽示例', () => {
  it('编辑词槽后发送结构化内容，切换场景重置输入', () => {
    cy.mount(HomeAIWorkbench);
    cy.get('.home-workbench')
      .should('not.contain.text', '可交互示例')
      .and('not.contain.text', '无需连接模型');
    cy.get('[data-rich-text-component-key="detail"] input').clear();
    cy.get('[data-rich-text-component-key="detail"] input').type('最近 7 天');
    cy.get('.sd-sender-actions-btn').click();
    cy.get('.home-workbench__result').should('contain.text', '最近 7 天');
    cy.get('.home-workbench__inspector').should('not.exist');
    cy.contains('button', '内容创作').click();
    cy.get('.sd-sender-skill-tag').should('contain.text', '写作助手');
    cy.get('[data-rich-text-component-key="detail"] input').should('have.value', '简洁、有感染力');
    cy.get('.home-workbench__result').should('not.exist');
    cy.contains('button', '界面搭建').click();
    cy.get('.sd-sender-skill-tag').should('contain.text', '界面助手');
    cy.get('.sd-sender-actions-btn').click();
    cy.get('.home-workbench__result').should('contain.text', 'AI 对话界面');
  });
});

describe('首页输入、呈现与反馈', () => {
  it('词槽可聊天滚动，时间线可操作，反馈可采用与重播', () => {
    cy.window().then((win) =>
      Object.defineProperty(win, 'LanguageModel', { configurable: true, value: undefined }),
    );
    cy.mount(HomeAIExamples);
    cy.get('.home-input-example [data-rich-text-component-key="topic"] input').clear();
    cy.get('.home-input-example [data-rich-text-component-key="topic"] input').type('迭代计划');
    cy.get('.home-input-example .sd-sender-actions-btn').click();
    cy.get('.home-input-example [role="log"] .user').last().should('contain.text', '迭代计划');
    cy.get('.home-input-example [role="log"] li').should('have.length', 4);
    cy.get('.home-input-example [role="textbox"]').should('have.text', '');
    cy.get('.home-input-example .sd-sender-actions-btn').should('be.disabled');
    cy.get('.home-input-example [role="textbox"]').type('补充发布渠道');
    cy.get('.home-input-example .sd-sender-actions-btn').click();
    cy.get('.home-input-example [role="log"] .user').last().should('contain.text', '补充发布渠道');
    cy.get('.home-input-example [role="textbox"]').should('have.text', '');
    cy.get('.home-input-example .sd-scrollbar').should('exist');
    cy.get('.home-content-example .sd-timeline-item').should('have.length', 3);
    cy.contains('.home-content-example button', '发布版本').click();
    cy.get('.home-content-example').should('contain.text', '版本已发布');
    cy.contains('.home-content-example button', '重新演示').click();
    cy.get('.home-content-example').should('contain.text', '发布新版本');
    cy.get('.home-feedback-example li').should('have.length', 3);
    cy.contains('.home-feedback-example button', '采用计划').click();
    cy.contains('.home-feedback-example button', '已采用').should(
      'have.attr',
      'aria-pressed',
      'true',
    );
    for (let replay = 0; replay < 2; replay++) {
      if (replay === 0) cy.get('.home-feedback-example [aria-label="刷新反馈示例"]').click();
      else cy.get('.home-feedback-example [aria-label="刷新反馈示例"]').focus().type('{enter}');
      cy.get('.home-feedback-example [data-state="drawing"]').should('exist');
      cy.get('.home-feedback-example .sd-skeleton-reveal').should(
        'have.attr',
        'data-state',
        'complete',
      );
    }
  });
});

describe('首页浏览器 AI 聊天', () => {
  it('首次准备模型展示下载进度，支持停止', () => {
    cy.window().then((win) =>
      Object.defineProperty(win, 'LanguageModel', {
        configurable: true,
        value: {
          availability: async () => 'downloadable',
          create: ({
            signal,
            monitor,
          }: {
            signal: AbortSignal;
            monitor: (target: EventTarget) => void;
          }) => {
            const target = new EventTarget();
            monitor(target);
            target.dispatchEvent(new ProgressEvent('downloadprogress', { loaded: 0.5, total: 1 }));
            return new Promise((_resolve, reject) =>
              signal.addEventListener('abort', () =>
                reject(new DOMException('Aborted', 'AbortError')),
              ),
            );
          },
        },
      }),
    );
    cy.mount(HomeInputExample);
    cy.get('.home-input-example__heading').should('contain.text', '模型待准备');
    cy.get('.sd-sender-actions-btn').click();
    cy.get('.home-input-example__heading').should('contain.text', '下载模型 50%');
    cy.get('.sd-sender-actions-btn-loading-button').click();
    cy.get('[role="status"]').should('contain.text', '已停止回复');
  });

  it('调用本地会话、复用上下文，并通过 Scrollbar 跟随新回复', () => {
    const prompt = cy
      .stub()
      .resolves(`**发布摘要**\n\n- 更新亮点\n- 发布渠道\n- 用户反馈\n\n${'详情。'.repeat(100)}`);
    const destroy = cy.stub();
    const create = cy.stub().resolves({ prompt, destroy });
    cy.window().then((win) =>
      Object.defineProperty(win, 'LanguageModel', {
        configurable: true,
        value: { availability: async () => 'available', create },
      }),
    );
    cy.mount(HomeInputExample);
    cy.get('.home-input-example__heading').should('contain.text', '浏览器 AI');
    for (let turn = 0; turn < 2; turn++) {
      if (turn > 0) cy.get('.home-input-example [role="textbox"]').type('继续说明');
      cy.get('.sd-sender-actions-btn').click();
      cy.get('[role="log"] .assistant')
        .last()
        .find('.sd-markdown-render strong')
        .should('contain.text', '发布摘要');
      cy.get('[role="log"] .assistant').last().find('li').should('have.length', 3);
      cy.get('.home-input-example [role="textbox"]').should('have.text', '');
      cy.get('[data-overlayscrollbars-viewport]').should(($viewport) => {
        const viewport = $viewport[0];
        expect(viewport.scrollHeight).to.be.greaterThan(viewport.clientHeight);
        expect(viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop).to.be.lessThan(
          3,
        );
      });
    }
    cy.then(() => {
      expect(create.callCount).to.equal(1);
      expect(prompt.callCount).to.equal(2);
    });
    cy.get('@vue').then(({ wrapper }) => wrapper.unmount());
    cy.then(() => expect(destroy).to.have.been.calledOnce);
  });

  it('生成失败不伪造回复，可重试并停止生成', () => {
    const prompt = cy.stub().rejects(new Error('model unavailable'));
    const destroy = cy.stub();
    cy.window().then((win) =>
      Object.defineProperty(win, 'LanguageModel', {
        configurable: true,
        value: { availability: async () => 'available', create: async () => ({ prompt, destroy }) },
      }),
    );
    cy.mount(HomeInputExample);
    cy.get('.home-input-example__heading').should('contain.text', '浏览器 AI');
    cy.get('.sd-sender-actions-btn').click();
    cy.get('[role="status"]').should('contain.text', '暂时无法回复');
    cy.get('[role="log"] .assistant').should('have.length', 1);
    cy.then(() =>
      prompt.callsFake(
        (_value: string, { signal }: { signal: AbortSignal }) =>
          new Promise((_resolve, reject) => {
            signal.addEventListener('abort', () =>
              reject(new DOMException('Aborted', 'AbortError')),
            );
          }),
      ),
    );
    cy.get('.home-input-example [role="textbox"]').type('再试一次');
    cy.get('.sd-sender-actions-btn').click();
    cy.get('.sd-sender-actions-btn-loading-button').click();
    cy.get('[role="status"]').should('contain.text', '已停止回复');
    cy.get('.sd-sender-actions-btn-loading-button').should('not.exist');
  });
});
