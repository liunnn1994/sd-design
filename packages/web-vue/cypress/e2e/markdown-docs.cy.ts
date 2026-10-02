describe('Markdown 文档实际页面', () => {
  it('长文档示例在真实页面上完成虚拟化且无嵌套渲染器', () => {
    cy.visit('/components/markdown-render/');
    // DemoBlock 是滚动可见才注水的：先滚到章节标题触发该区块加载，
    // 再按内容定位，避免用 .eq(n) 绑定示例顺序。
    cy.get('h3#长文档与虚拟化').scrollIntoView();
    cy.get('.demo-block:has(.long-doc-scroll)', { timeout: 20000 })
      .scrollIntoView()
      .within(() => {
        cy.get('.long-doc-scroll').should(($root) => {
          const root = $root[0];
          const slots = root.querySelectorAll('.node-slot').length;
          expect(slots, '挂载节点数').to.be.greaterThan(0);
          expect(slots, '挂载节点数应远小于文档规模').to.be.at.most(200);
          expect(
            root.querySelectorAll('.markdown-renderer .markdown-renderer').length,
            '嵌套渲染器',
          ).to.equal(0);
        });
        cy.contains('.long-doc-metrics', '文档节点总数');
        cy.contains('button', '跳到末尾').click();
        cy.get('.long-doc-scroll').should(($root) => {
          expect($root[0].scrollTop).to.be.greaterThan(0);
        });
      });
  });

  it('操作区留出间距，局部主题面板在文档明暗主题下保持独立背景', () => {
    cy.visit('/components/markdown-render/');
    cy.get('.demo-block')
      .eq(1)
      .scrollIntoView()
      .within(() => {
        cy.get('.demo-block__preview button', { timeout: 20000 }).should(($buttons) => {
          const first = $buttons[0].getBoundingClientRect();
          const second = $buttons[1].getBoundingClientRect();
          expect(second.left - first.right).to.be.at.least(8);
        });
      });
    cy.get('h3#覆盖节点与嵌入-sd-组件').scrollIntoView();
    cy.get('.demo-block:has(.markdown-custom-code)', { timeout: 20000 })
      .scrollIntoView()
      .within(() => {
        cy.get('.markdown-custom-code').should(($code) => {
          const button = $code[0].closest('.sd-space')!.querySelector('button')!;
          expect(
            button.getBoundingClientRect().top - $code[0].getBoundingClientRect().bottom,
          ).to.be.at.least(16);
        });
      });
    cy.get('h3#跟随主题').scrollIntoView();
    cy.get('.demo-block:has(.markdown-theme-panel)', { timeout: 20000 })
      .scrollIntoView()
      .within(() => {
        for (const documentTheme of ['light', 'dark']) {
          cy.document().then((doc) =>
            doc.documentElement.setAttribute('data-theme', documentTheme),
          );
          cy.get('.markdown-theme-panel').should(
            'have.css',
            'background-color',
            'rgb(255, 255, 255)',
          );
          cy.contains('.demo-block__preview button', '切换主题').click();
          cy.get('.markdown-theme-panel').should(($panel) => {
            const style = getComputedStyle($panel[0]);
            expect(style.backgroundColor).not.to.equal('rgb(255, 255, 255)');
            expect(style.backgroundColor).not.to.equal('rgba(0, 0, 0, 0)');
            expect(parseFloat(style.paddingTop)).to.be.at.least(16);
          });
          cy.get('.sd-markdown-render').should('have.class', 'dark');
          cy.contains('.demo-block__preview button', '切换主题').click();
        }
      });
  });
  it('DemoBlock 首次点击追加内容可见，链接首次 hover 显示 Tooltip', () => {
    cy.visit('/components/markdown-render/');
    cy.contains('h1', 'Markdown 渲染').should('be.visible');
    cy.get('.demo-block')
      .eq(0)
      .scrollIntoView()
      .within(() => {
        cy.get('.demo-block__preview .sd-link', { timeout: 20000 }).first().trigger('mouseenter');
      });
    cy.get('.sd-tooltip-content', { timeout: 10000 })
      .should('be.visible')
      .and('contain.text', '访问示例网站');
    cy.get('.demo-block')
      .eq(1)
      .scrollIntoView()
      .within(() => {
        cy.contains('.demo-block__preview button', '追加内容', { timeout: 20000 }).click();
        cy.get('.demo-block__preview .sd-markdown-render').should('contain.text', '浪花淘尽英雄');
        cy.contains('.demo-block__preview button', '重置').click();
        cy.get('.demo-block__preview .sd-markdown-render').should(
          'not.contain.text',
          '浪花淘尽英雄',
        );
      });
  });
  it('在线编辑器首次展开成功加载 Markdown 示例', () => {
    cy.visit('/components/markdown-render/');
    cy.get('.demo-block')
      .eq(0)
      .scrollIntoView()
      .within(() => {
        cy.contains('button', '在线编辑', { timeout: 20000 }).click();
        cy.get('iframe', { timeout: 30000 }).should(($frame) => {
          expect($frame[0].contentDocument?.body?.textContent ?? '').to.contain('Markdown 排版');
        });
      });
  });
  it('基础示例的实际预览保留标题层级和富节点样式', () => {
    cy.visit('/components/markdown-render/');
    cy.get('.demo-block')
      .first()
      .scrollIntoView()
      .within(() => {
        cy.get('.demo-block__preview h1.sd-typography', { timeout: 20000 })
          .should('have.css', 'font-size', '36px')
          .scrollIntoView();
        cy.get('.demo-block__preview h2.sd-typography')
          .first()
          .should('have.css', 'font-size', '32px');
        cy.get('.demo-block__preview blockquote.sd-typography')
          .first()
          .should(($node) =>
            expect(parseFloat(getComputedStyle($node[0]).borderLeftWidth)).to.be.greaterThan(0),
          );
        cy.get('.demo-block__preview table').scrollIntoView().should('be.visible');
        cy.get('.demo-block__preview .sd-image img').scrollIntoView().should('be.visible');
        cy.get('.demo-block__preview dl').should('contain.text', '轻量标记语言');
        cy.contains('.demo-block__preview .sd-btn', 'SD 内容按钮')
          .scrollIntoView()
          .should('be.visible');
      });
  });

  it('可选 peer 就绪时图表和数学真实渲染', () => {
    cy.visit('/components/markdown-render/');
    cy.get('h3#基本排版').scrollIntoView();
    cy.get('.demo-block', { timeout: 20000 }).first().scrollIntoView();
    // 文档站安装了 mermaid / katex / @terrastruct/d2 / @antv/infographic，组件库不引入
    // 这些可选依赖；这里验证的是消费方装齐、并为 infographic 提供 loader 后的真实结果。
    // 图表节点按可见性延迟渲染，必须把图本身滚进视口才会开始出图。
    for (const selector of [
      '.mermaid-block-container',
      '.d2-block-container',
      '.infographic-block-container',
    ]) {
      cy.get(`.demo-block__preview ${selector}`, { timeout: 20000 })
        .scrollIntoView()
        .should('be.visible');
      // 出图过程中容器会被整体替换，链式断言会失去 subject；SVG 出现本身就是
      // 渲染完成的证据，这里一律用重新查询而不是挂在链上。
      cy.get(`.demo-block__preview ${selector} svg`, { timeout: 40000 }).should('exist');
      cy.get(`.demo-block__preview ${selector}`).should(
        'not.have.attr',
        'data-markstream-mode',
        'pending',
      );
    }
    cy.get('.demo-block__preview .katex', { timeout: 20000 }).should('exist');
  });
});
