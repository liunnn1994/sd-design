Cypress.on('uncaught:exception', (error) => {
  if (error.message.includes('ResizeObserver loop')) return false;
});

const heroScreenshot = {
  onBeforeScreenshot(element: JQuery<HTMLElement>) {
    const header = element[0].ownerDocument.querySelector<HTMLElement>('header.header');
    if (header) header.style.visibility = 'hidden';
  },
  onAfterScreenshot(element: JQuery<HTMLElement>) {
    const header = element[0].ownerDocument.querySelector<HTMLElement>('header.header');
    if (header) header.style.visibility = '';
  },
};

describe('首页与线框入场', () => {
  beforeEach(() => {
    cy.on('window:before:load', (win) => {
      Object.defineProperty(win.navigator, 'gpu', { configurable: true, value: undefined });
    });
  });

  it('中央输入面板可以输入、发送并操作上下文和 Agent 菜单', () => {
    cy.viewport(1440, 1000);
    cy.visit('/');
    cy.get('#home-title').should('contain.text', '到好用的界面');
    cy.get('.site-title span').should('have.class', 'sr-only');
    cy.get('.site-title img, .home-hero__signature img')
      .should('have.length', 2)
      .each(($logo) => {
        expect($logo[0].getAttribute('src')).to.contain('logo-icon');
        expect(($logo[0] as HTMLImageElement).naturalWidth).to.be.greaterThan(0);
      });
    cy.get('.home-landing').should(($landing) => {
      const rect = $landing[0].getBoundingClientRect();
      expect(
        Math.abs(
          rect.left + rect.width / 2 - $landing[0].ownerDocument.documentElement.clientWidth / 2,
        ),
      ).to.be.lessThan(2);
    });
    cy.get('a[href*="/design/"]').should('not.exist');
    cy.get('.home-workbench .sd-skeleton-reveal', { timeout: 60000 }).should('exist');
    cy.get('.home-hero__workbench astro-island', { timeout: 60000 }).should('not.have.attr', 'ssr');
    cy.get('.home-workbench [aria-label="重播入场"]').click();
    cy.get('.home-workbench [data-state="drawing"]').should('exist');
    cy.get('.home-workbench [data-reveal-draw]').should('have.length.at.most', 24);
    cy.get('.home-workbench [data-rich-text-component-key="detail"] input')
      .should('have.attr', 'placeholder', '补充要求')
      .type('构建一个 AI 对话界面');
    cy.get('.home-workbench .sd-skeleton-reveal-overlay').should('not.exist');
    cy.get('.home-workbench [aria-label="发送需求"]').click();
    cy.get('.home-workbench__result').should('not.exist');
    cy.get('.home-workbench [aria-label="添加内容"]').click();
    cy.contains('[role="menuitem"]', '添加技能').should('not.exist');
    cy.contains('[role="menuitem"]', '添加组件库').click();
    cy.get('.home-workbench .sd-sender').should('contain.text', 'SD Design');
    cy.get('.home-workbench [aria-label="选择工作方式"]').click();
    cy.contains('[role="menuitem"]', '提问').click();
    cy.get('.home-workbench [aria-label="选择工作方式"]').should('contain.text', '提问');
    cy.get('.home-workbench__suggestions').should('not.exist');
    cy.get('.home-workbench [contenteditable="true"]').should(
      'contain.text',
      'android-chrome-192x192.png',
    );
    cy.get('.home-workbench__result').should('not.exist');
  });

  it('明暗主题、真实组件和手机布局', () => {
    cy.viewport(1440, 1000);
    cy.visit('/');
    cy.get('#components').scrollIntoView();
    cy.get('#components astro-island', { timeout: 60000 }).should('not.have.attr', 'ssr');
    cy.contains('.home-previews button', '开始创作', { timeout: 60000 }).click();
    cy.contains('.home-previews button', '已点击 1 次').should('be.visible');
    cy.get('.home-previews .sd-switch').click();
    cy.get('.home-previews').should('contain.text', '通知已关闭');
    cy.contains('.home-previews .sd-tabs-tab', '动态').click();
    cy.get('.home-previews').should('contain.text', '新的想法');
    cy.scrollTo('top');
    cy.get('starlight-theme-select select:visible').select('dark');
    cy.get('html').should('have.attr', 'data-sd-theme', 'dark');
    cy.get('.home-workbench [data-state]').should('have.attr', 'data-state', 'complete');
    cy.get('.home-hero').screenshot('home-dark', heroScreenshot);
    cy.get('starlight-theme-select select:visible').select('light');
    cy.get('.home-hero').screenshot('home-light', heroScreenshot);
    cy.viewport(390, 844);
    cy.document().should((doc) => expect(doc.documentElement.scrollWidth).to.be.at.most(390));
    cy.get('.home-workbench').scrollIntoView();
    cy.get('.home-workbench .sd-sender').should('be.visible');
    cy.document().should((doc) => expect(doc.documentElement.scrollWidth).to.be.at.most(390));
    cy.screenshot('home-mobile', { capture: 'viewport' });
    cy.get('#components').scrollIntoView();
    cy.get('.home-previews article').should('have.length', 6);
    cy.get('.home-previews').should(($grid) =>
      expect($grid[0].scrollWidth).to.be.at.most($grid[0].clientWidth),
    );
  });

  it('动画结束后没有残留的运行实例，采集实际帧间隔', () => {
    cy.viewport(1440, 1000);
    cy.visit('/');
    cy.get('.home-workbench .sd-skeleton-reveal', { timeout: 60000 }).should('exist');
    cy.get('.home-hero__workbench astro-island', { timeout: 60000 }).should('not.have.attr', 'ssr');
    cy.get('.home-workbench [aria-label="重播入场"]').click();
    cy.window()
      .then(
        (win) =>
          new Promise<{ frames: number; p95: number; max: number }>((resolve) => {
            const times: number[] = [];
            let last = 0;
            const start = win.performance.now();
            function frame(now: number) {
              if (last) times.push(now - last);
              last = now;
              if (now - start < 1900) win.requestAnimationFrame(frame);
              else {
                const sorted = times.toSorted((a, b) => a - b);
                resolve({
                  frames: times.length,
                  p95: sorted[Math.floor(sorted.length * 0.95)] ?? 0,
                  max: sorted.at(-1) ?? 0,
                });
              }
            }
            win.requestAnimationFrame(frame);
          }),
      )
      .then((metrics) => cy.writeFile('cypress/screenshots/home-motion-performance.json', metrics));
    cy.get('.home-workbench [data-state]').should('have.attr', 'data-state', 'complete');
    cy.get('.home-workbench .sd-skeleton-reveal-overlay').should('not.exist');
    cy.get('.home-workbench').should(($finder) =>
      expect(
        $finder[0]
          .getAnimations({ subtree: true })
          .filter((animation) => animation.playState === 'running'),
      ).to.have.length(0),
    );
  });

  it('减少动态效果时内容直接可用', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        const original = win.matchMedia.bind(win);
        cy.stub(win, 'matchMedia').callsFake((query: string) => {
          const result = original(query);
          if (query === '(prefers-reduced-motion: reduce)')
            Object.defineProperty(result, 'matches', { value: true });
          return result;
        });
      },
    });
    cy.get('.home-workbench .sd-sender', { timeout: 60000 }).should('be.visible');
    cy.get('.home-hero__workbench astro-island', { timeout: 60000 }).should('not.have.attr', 'ssr');
    cy.get('.home-workbench [aria-label="重播入场"]').click();
    cy.get('.home-workbench .sd-skeleton-reveal-overlay').should('not.exist');
    cy.get('.home-framework button').should('not.exist');
    cy.get('.home-framework__window').should('contain.text', 'Vue');
    cy.get('.home-workbench [data-rich-text-component-key="detail"] input').type(
      '今天整理界面需求',
    );
    cy.get('.home-workbench [aria-label="发送需求"]').click();
    cy.get('.home-workbench__result').should('not.exist');
  });

  it('框架文字自动循环切换，标签颜色区分状态', () => {
    cy.viewport(1440, 1000);
    cy.visit('/');
    cy.get('.home-framework__window', { timeout: 60000 }).should('contain.text', 'Vue');
    cy.get('.home-framework__window', { timeout: 6000 })
      .should('contain.text', 'React')
      .and('contain.text', '即将到来');
    cy.get('.home-framework button').should('not.exist');
    cy.get('.home-framework .sd-tag')
      .invoke('css', 'background-color')
      .then((reactColor) => {
        cy.get('.home-framework__window', { timeout: 6000 }).should('contain.text', 'Vue');
        cy.get('.home-framework .sd-tag')
          .should('contain.text', '现在可用')
          .and(($tag) => {
            expect($tag.css('background-color')).not.to.equal(reactColor);
          });
      });
    cy.get('#components').scrollIntoView();
    cy.wait(3600);
    cy.get('.home-framework__window').should('contain.text', 'Vue');
  });

  it('输入、呈现和反馈为真实组件，手机布局不溢出', () => {
    cy.viewport(1440, 1000);
    cy.visit('/', {
      onBeforeLoad(win) {
        Object.defineProperty(win.navigator, 'gpu', { configurable: true, value: undefined });
      },
    });
    cy.get('#ai-examples').scrollIntoView();
    cy.get('#ai-examples astro-island', { timeout: 60000 }).should('not.have.attr', 'ssr');
    cy.get('.home-ai-examples article').should('have.length', 3);
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
    cy.get('.home-feedback-example').should('not.contain.text', '重播入场');
    cy.get('.home-feedback-example [aria-label="刷新反馈示例"]').click();
    cy.get('.home-feedback-example [data-state="drawing"]').should('exist');
    cy.get('.home-feedback-example .sd-skeleton-reveal').should(
      'have.attr',
      'data-state',
      'complete',
    );
    cy.get('#ai-examples').screenshot('home-ai-examples', heroScreenshot);
    cy.viewport(390, 844);
    cy.get('#ai-examples').scrollIntoView();
    cy.document().should((doc) => expect(doc.documentElement.scrollWidth).to.be.at.most(390));
    cy.get('.home-content-example').should('contain.text', '发布进度');
  });

  it('组合内容示例无需刷新即可连续重播', () => {
    cy.visit('/components/skeleton-reveal/');
    cy.contains('h3', '组合内容').scrollIntoView();
    cy.get('.skeleton-reveal-composition', { timeout: 60000 }).scrollIntoView();
    cy.get('.skeleton-reveal-composition').closest('astro-island').should('not.have.attr', 'ssr');
    cy.get('.skeleton-reveal-composition .sd-skeleton-reveal').should(
      'have.attr',
      'data-state',
      'complete',
    );
    for (let replay = 0; replay < 2; replay++) {
      cy.contains('.skeleton-reveal-composition button', '重播组合内容').click();
      cy.get('.skeleton-reveal-composition .sd-skeleton-reveal').should(
        'have.attr',
        'data-state',
        'drawing',
      );
      cy.get('.skeleton-reveal-composition .sd-skeleton-reveal').should(
        'have.attr',
        'data-state',
        'complete',
      );
      cy.get('.skeleton-reveal-composition .sd-skeleton-reveal-overlay').should('not.exist');
    }
  });

  it('设计页面已移除，主题和组件入口仍保留', () => {
    cy.request({ url: '/design/values/', failOnStatusCode: false })
      .its('status')
      .should('equal', 404);
    cy.request({ url: '/design/guidelines/', failOnStatusCode: false })
      .its('status')
      .should('equal', 404);
    cy.visit('/components/skeleton-reveal/');
    cy.get('h1').should('contain.text', 'SkeletonReveal');
    cy.get('.site-title img')
      .should('be.visible')
      .and(($logo) => {
        expect(($logo[0] as HTMLImageElement).naturalWidth).to.be.greaterThan(0);
      });
    cy.get('.sidebar-content')
      .should('not.contain.text', '设计价值观')
      .and('not.contain.text', '设计指引');
    cy.get('.demo-block').first().scrollIntoView();
    cy.get('.demo-block .sd-skeleton-reveal', { timeout: 60000 }).first().should('exist');
  });
});
