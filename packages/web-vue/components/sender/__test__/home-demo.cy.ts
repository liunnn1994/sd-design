import HomeAIExamples from '../../../../sd-vue-docs/src/components/home/HomeAIExamples.vue';
import HomeFramework from '../../../../sd-vue-docs/src/components/home/HomeFramework.vue';
import HomeInputExample from '../../../../sd-vue-docs/src/components/home/HomeInputExample.vue';

function mockLocalWorker(
  mode: 'reply' | 'loading' | 'failure' | 'generating' = 'reply',
  loadProgress = 0.5,
) {
  const requests: { kind: string; content: unknown }[] = [];
  const terminate = cy.stub();
  let reloadUuid = '';
  const worker = {
    onmessage: null as ((message: unknown) => void) | null,
    addEventListener() {},
    terminate,
    postMessage(message: { kind: string; uuid: string; content: unknown }) {
      requests.push(message);
      queueMicrotask(() => {
        if (message.kind === 'reload') {
          worker.onmessage?.({ kind: 'initProgressCallback', content: { progress: loadProgress } });
          if (mode === 'loading') {
            reloadUuid = message.uuid;
            return;
          }
          worker.onmessage?.({
            kind: mode === 'failure' ? 'throw' : 'return',
            uuid: message.uuid,
            content: mode === 'failure' ? 'Model missing' : null,
          });
        } else if (message.kind === 'chatCompletionNonStreaming') {
          if (mode === 'generating') return;
          worker.onmessage?.({
            kind: 'return',
            uuid: message.uuid,
            content: {
              choices: [
                {
                  message: {
                    content: `**组件介绍**\n\n- Sender 输入问题\n- MarkdownRender 呈现回答\n- Progress 显示进度\n\n${'详情。'.repeat(100)}`,
                  },
                },
              ],
            },
          });
        }
      });
    },
  };
  cy.window().then((win) => {
    Object.defineProperty(win.navigator, 'gpu', { configurable: true, value: {} });
    Object.defineProperty(win, 'LanguageModel', {
      configurable: true,
      get() {
        throw new Error('Must not use browser AI');
      },
    });
    cy.stub(win, 'Worker')
      .callsFake(() => worker)
      .as('worker');
  });
  return {
    requests,
    terminate,
    retrySuccessfully: () => {
      mode = 'reply';
    },
    finishLoading: () => {
      mode = 'reply';
      worker.onmessage?.({ kind: 'return', uuid: reloadUuid, content: null });
    },
  };
}

describe('首页 WebLLM 本地聊天', () => {
  beforeEach(() => {
    cy.intercept('GET', '/llms/llms.txt', {
      body: '# SD Design\n- [SD Design](https://sd-design.js.org/): 为 AI 而生的组件库。\n- [对话输入框 Sender](https://sd-design.js.org/llms/components/sender.md): 来自测试文档的 Sender 描述：聊天输入、提交、取消和结构化词槽。\n- [MarkdownRender](https://sd-design.js.org/llms/components/markdown-render.md): 呈现 Markdown 回答。',
    });
  });

  it('不支持 WebGPU 时说明原因并保持示例输入可用', () => {
    cy.window().then((win) =>
      Object.defineProperty(win.navigator, 'gpu', { configurable: true, value: undefined }),
    );
    cy.mount(HomeInputExample);
    cy.get('.home-input-example__heading').should('have.text', '组件助手');
    cy.get('[role="status"]').should('contain.text', '不支持 WebGPU');
    cy.get('.sd-sender-actions-btn').should('not.be.disabled').click();
    cy.get('[role="log"] .assistant').last().should('contain.text', '示例：');
  });

  it('挂载即加载 CDN 资源，不增加消息，复用模型并保留对话上下文', () => {
    const { requests, terminate } = mockLocalWorker();
    cy.mount(HomeInputExample);
    cy.get('@worker').should('have.been.calledOnce');
    cy.get('.sd-sender-actions-btn-loading-button').should('not.exist');
    cy.get('[role="log"] li').should('have.length', 2);
    cy.get('.home-input-example__heading').should('have.text', '组件助手');
    for (let turn = 0; turn < 2; turn++) {
      if (turn) cy.get('[role="textbox"]').type('继续说明');
      cy.get('.sd-sender-actions-btn').click();
      cy.get('[role="log"] .assistant').last().find('strong').should('have.text', '组件介绍');
      cy.get('[role="log"] .assistant').last().find('li').should('have.length', 3);
      cy.get('[data-overlayscrollbars-viewport]').should(($viewport) => {
        const viewport = $viewport[0];
        expect(viewport.scrollHeight).to.be.greaterThan(viewport.clientHeight);
        expect(viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop).to.be.lessThan(
          3,
        );
      });
      cy.get('[role="textbox"]').should('have.text', '');
      cy.get('.home-input-example__progress').should('not.exist');
    }
    cy.then(() => {
      expect(requests.filter(({ kind }) => kind === 'reload')).to.have.length(1);
      const config = requests.find(({ kind }) => kind === 'setAppConfig')!.content as {
        model_list: { model: string; model_lib: string }[];
      };
      expect(new URL(config.model_list[0].model).hostname).to.equal('modelscope.cn');
      expect(new URL(config.model_list[0].model_lib).hostname).to.equal('cdn.jsdelivr.net');
      const turns = requests.filter(({ kind }) => kind === 'chatCompletionNonStreaming');
      const last = turns[1].content as {
        request: { messages: { role: string; content: string }[] };
      };
      expect(last.request.messages).to.have.length(6);
      expect(last.request.messages[0].role).to.equal('system');
      expect(last.request.messages[0].content).to.include('来自测试文档的 Sender 描述');
      expect(last.request.messages[0].content).to.include('/llms/components/sender.md');
      expect(last.request.messages[1].content).to.equal('做 AI 聊天界面可以用哪些组件？');
      expect(last.request.messages[2].content).to.include('用 MarkdownRender 呈现回答');
    });
    cy.get('@vue').then(({ wrapper }) => wrapper.unmount());
    cy.then(() => expect(terminate).to.have.been.calledOnce);
  });

  it('高精度下载进度四舍五入，不产生数值越界警告', () => {
    mockLocalWorker('loading', 0.4406542411563332);
    cy.window().then((win) => cy.spy(win.console, 'warn').as('warn'));
    cy.mount(HomeInputExample);
    cy.get('[role="progressbar"]').should('have.attr', 'aria-valuenow', '44.07');
    cy.get('@warn').should('not.have.been.called');
  });

  it('显示加载进度，停止后终止 Worker 并恢复输入', () => {
    const { terminate } = mockLocalWorker('loading');
    cy.mount(HomeInputExample);
    cy.get('.home-input-example__progress.sd-progress-size-mini [role="progressbar"]').should(
      'have.attr',
      'aria-valuenow',
      '50',
    );
    cy.get('.home-input-example__heading').should('have.text', '组件助手');
    cy.get('.sd-sender-actions-btn').should('not.be.disabled').click();
    cy.get('.sd-sender-actions-btn-loading-button').click();
    cy.get('[role="status"]').should('contain.text', '已停止回复');
    cy.get('[role="textbox"]').type('重试');
    cy.get('.sd-sender-actions-btn').should('not.be.disabled');
    cy.then(() => expect(terminate).to.have.been.calledOnce);
  });

  it('自动下载期间可提交输入，模型就绪后只发送一次', () => {
    const { requests, finishLoading } = mockLocalWorker('loading');
    cy.mount(HomeInputExample);
    cy.get('.home-input-example__progress [role="progressbar"]').should(
      'have.attr',
      'aria-valuenow',
      '50',
    );
    cy.get('[data-rich-text-component-key="topic"] input').clear().type('Progress');
    cy.get('.sd-sender-actions-btn').should('not.be.disabled').click();
    cy.get('[role="log"] .user').last().should('contain.text', '介绍一下 Progress 的用途。');
    cy.get('[role="textbox"]').should('have.text', '');
    cy.then(() =>
      expect(requests.filter(({ kind }) => kind === 'chatCompletionNonStreaming')).to.have.length(
        0,
      ),
    );
    cy.then(finishLoading);
    cy.get('[role="log"] .assistant').last().find('strong').should('have.text', '组件介绍');
    cy.then(() => {
      const turns = requests.filter(({ kind }) => kind === 'chatCompletionNonStreaming');
      expect(turns).to.have.length(1);
      const request = turns[0].content as { request: { messages: { content: string }[] } };
      expect(request.request.messages.at(-1)?.content).to.equal('介绍一下 Progress 的用途。');
    });
  });

  it('清空后显示 placeholder，重新输入可点击发送和按 Enter 提交', () => {
    cy.window().then((win) =>
      Object.defineProperty(win.navigator, 'gpu', { configurable: true, value: undefined }),
    );
    cy.mount(HomeInputExample);
    cy.get('.sd-sender-actions-btn').click();
    cy.get('.sd-rich-text-editor-placeholder')
      .should('be.visible')
      .and('have.text', '输入组件问题，例如：如何使用 Sender？');
    cy.get('[role="textbox"]').type('介绍 Progress');
    cy.get('.sd-sender-actions-btn').should('not.be.disabled').click();
    cy.get('[role="log"] .user')
      .last()
      .find('.home-input-example__bubble')
      .should('have.text', '介绍 Progress');
    cy.get('.sd-rich-text-editor-placeholder').should('be.visible');
    cy.get('[role="textbox"]').type('介绍 MarkdownRender{enter}');
    cy.get('[role="log"] .user').last().should('contain.text', '介绍 MarkdownRender');
    cy.get('[role="textbox"]').should('have.text', '');
  });

  it('加载失败不伪造回复，可再次发送', () => {
    const { retrySuccessfully } = mockLocalWorker('failure');
    cy.mount(HomeInputExample);
    cy.get('[role="status"]').should('contain.text', '加载或运行失败');
    cy.get('[role="log"] .assistant').should('have.length', 1);
    cy.get('[role="textbox"]').type('再试一次');
    cy.then(retrySuccessfully);
    cy.get('.sd-sender-actions-btn').should('not.be.disabled').click();
    cy.get('[role="log"] .assistant').should('have.length', 2);
    cy.get('.home-input-example__progress').should('not.exist');
  });

  it('生成期间停止会终止 Worker，不追加半截回复', () => {
    const { terminate } = mockLocalWorker('generating');
    cy.mount(HomeInputExample);
    cy.get('@worker').should('have.been.calledOnce');
    cy.get('.sd-sender-actions-btn-loading-button').should('not.exist');
    cy.get('.sd-sender-actions-btn').click();
    cy.get('[role="log"] .assistant').last().should('contain.text', '正在回复');
    cy.get('.sd-sender-actions-btn-loading-button').click();
    cy.get('[role="status"]').should('contain.text', '已停止回复');
    cy.get('[role="log"] .assistant').should('have.length', 1);
    cy.then(() => expect(terminate).to.have.been.calledOnce);
  });

  it('模型加载无响应时超时退出并终止 Worker', () => {
    const { terminate } = mockLocalWorker('loading');
    cy.clock();
    cy.mount(HomeInputExample);
    cy.get('.home-input-example__progress.sd-progress-size-mini [role="progressbar"]').should(
      'have.attr',
      'aria-valuenow',
      '50',
    );
    cy.get('.home-input-example__heading').should('have.text', '组件助手');
    cy.tick(120_000);
    cy.get('[role="status"]').should('contain.text', '响应超时');
    cy.get('[role="log"] .assistant').should('have.length', 1);
    cy.then(() => expect(terminate).to.have.been.calledOnce);
  });
});

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
      Object.defineProperty(win.navigator, 'gpu', { configurable: true, value: undefined }),
    );
    cy.mount(HomeAIExamples);
    cy.get('.home-input-example [data-rich-text-component-key="topic"] input').clear();
    cy.get('.home-input-example [data-rich-text-component-key="topic"] input').type(
      'MarkdownRender',
    );
    cy.get('.home-input-example .sd-sender-actions-btn').click();
    cy.get('.home-input-example [role="log"] .user')
      .last()
      .should('contain.text', 'MarkdownRender');
    cy.get('.home-input-example [role="log"] li').should('have.length', 4);
    cy.get('.home-input-example [role="textbox"]').should('have.text', '');
    cy.get('.home-input-example .sd-sender-actions-btn').should('be.disabled');
    cy.get('.home-input-example [role="textbox"]').type('MarkdownRender 有什么用？');
    cy.get('.home-input-example .sd-sender-actions-btn').click();
    cy.get('.home-input-example [role="log"] .user')
      .last()
      .should('contain.text', 'MarkdownRender 有什么用？');
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
