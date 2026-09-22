describe('文档站主题编辑器', () => {
  it('页面深色模式的容器、表格和语义背景全部同步', () => {
    cy.viewport(1280, 1000);
    cy.visit('/guides/theme-editor/');
    cy.get('[data-testid="theme-editor"]', { timeout: 60000 }).should('be.visible');
    cy.get('.preview-toolbar .preview-select').first().click();
    cy.get('[role="option"]').contains('页面示例').click();
    cy.get('.editor-settings [aria-label="暗色"]').click();
    const assertDark = () => {
      for (const selector of [
        '.workspace-header',
        '.workspace-sidebar',
        '.sd-card',
        '.sd-table-th',
        '.sd-table-td',
        '.sd-alert-success',
        '.sd-alert-error',
        '.sd-alert-info',
      ]) {
        cy.get(`[data-testid="workspace-page"] ${selector}`).should(($elements) => {
          for (const element of $elements.toArray()) {
            const style = getComputedStyle(element);
            const channels = style.backgroundColor.match(/[\d.]+/g)!.map(Number);
            expect(
              Math.max(...channels.slice(0, 3)) * (channels[3] ?? 1),
              `${selector}: ${style.backgroundColor}; bg2=${style.getPropertyValue('--sd-color-bg-2')}`,
            ).to.be.lessThan(150);
          }
        });
      }
    };
    assertDark();
    for (const preset of ['默认', '品牌色', '紧凑', '暗色', '赛博朋克']) {
      cy.get('.preset-select').click();
      cy.get('[role="option"]').contains(preset).click();
      if (preset !== '暗色' && preset !== '赛博朋克')
        cy.get('.editor-settings [aria-label="暗色"]').click();
      assertDark();
      // 外层文档主题与预览主题相反时仍应保持独立。
      cy.document().then((document) => document.documentElement.setAttribute('data-theme', 'dark'));
      assertDark();
      cy.get('.editor-settings [aria-label="暗色"]').click();
      cy.get('[data-testid="workspace-page"] .sd-card')
        .first()
        .should('have.css', 'background-color', 'rgb(255, 255, 255)');
      cy.document().then((document) =>
        document.documentElement.setAttribute('data-theme', 'light'),
      );
    }
    cy.get('.editor-settings [aria-label="暗色"]').click();
    cy.get('[data-testid="preview-canvas"]').screenshot('dark-theme-surfaces');
  });
  it('业务页面语义色、独立深色主题与画布交互', () => {
    cy.viewport(1600, 1000);
    cy.visit('/guides/theme-editor/');
    cy.get('[data-testid="seed-warning"] input', { timeout: 60000 }).clear().type('#9933cc').blur();
    cy.get('.preview-toolbar .preview-select').first().click();
    cy.get('[role="option"]').contains('页面示例').click();
    cy.get('[data-testid="workspace-warning"] .sd-alert-icon svg').should(
      'have.css',
      'color',
      'rgb(153, 51, 204)',
    );
    cy.get('[data-testid="workspace-page"] .sd-alert-error').should('exist');
    cy.get('[data-testid="workspace-page"] .sd-alert-success').should('exist');
    cy.get('[data-testid="workspace-page"] .sd-alert-info').should('exist');
    cy.get('[data-testid="workspace-page"]').should('have.css', 'flex-direction', 'column');
    cy.document().should((document) =>
      expect(document.documentElement.scrollWidth).to.be.at.most(1600),
    );
    cy.get('.editor-settings [aria-label="暗色"]').click();
    cy.document().then((document) =>
      document.documentElement.style.setProperty('--sl-color-bg-nav', 'rgb(255, 0, 255)'),
    );
    cy.get('[data-testid="workspace-header"]').should(
      'have.css',
      'background-color',
      'rgb(35, 35, 36)',
    );
    cy.get('[data-testid="workspace-page"]').contains('button', '新建任务').click();
    cy.get('.sd-modal:visible').should('have.css', 'background-color', 'rgb(42, 42, 43)');
    cy.get('.sd-modal:visible').contains('button', '创建任务').click();
    cy.get('.sd-modal:visible').should('contain.text', '请输入任务名称');
    cy.get('input[aria-label="任务名称"]').type('画布内交付任务');
    cy.get('.sd-modal:visible .sd-select').click();
    cy.get('[role="option"]').contains('周宁').click();
    cy.get('.sd-modal:visible').contains('button', '创建任务').click();
    cy.get('input[aria-label="搜索交付任务"]').type('画布内交付任务');
    cy.get('[data-testid="workspace-page"] .sd-table')
      .should('contain.text', '画布内交付任务')
      .and('not.contain.text', '支付网关升级');
    cy.get('[data-testid="canvas-transform"]')
      .invoke('attr', 'transform')
      .then((before) => {
        cy.get('input[aria-label="搜索交付任务"]').type(' {leftarrow}');
        cy.get('[data-testid="canvas-transform"]').should('have.attr', 'transform', before);
      });
    cy.get('input[aria-label="搜索交付任务"]').clear();
    cy.get('[data-testid="workspace-header"]').contains('button', '消息').click();
    cy.get('.sd-drawer:visible')
      .should('contain.text', '交付检查详情')
      .and('have.css', 'background-color', 'rgb(42, 42, 43)');
    cy.get('.sd-drawer:visible .sd-drawer-close-btn').click();
    cy.get('[data-testid="canvas-transform"]')
      .invoke('attr', 'transform')
      .then((before) => {
        cy.get('[data-testid="canvas-viewport"]')
          .focus()
          .should('be.focused')
          .then(($svg) => {
            $svg[0].dispatchEvent(
              new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
            );
          });
        cy.get('[data-testid="canvas-transform"]').should('not.have.attr', 'transform', before);
      });
    cy.get('[data-testid="canvas-viewport"]').then(($svg) => {
      $svg[0].dispatchEvent(new KeyboardEvent('keydown', { key: '0', bubbles: true }));
    });
    cy.get('[data-testid="canvas-transform"]')
      .invoke('attr', 'transform')
      .then((before) => {
        cy.get('[data-testid="canvas-viewport"]').trigger('wheel', {
          ctrlKey: true,
          deltaY: -100,
          clientX: 1000,
          clientY: 500,
        });
        cy.get('[data-testid="canvas-transform"]').should('not.have.attr', 'transform', before);
      });
    cy.get('[data-testid="preview-canvas"]').contains('button', '适应宽度').click();
    cy.get('[data-testid="canvas-transform"]')
      .invoke('attr', 'transform')
      .then((before) => {
        cy.get('[data-testid="canvas-viewport"]').trigger('pointerdown', 'topLeft', {
          eventConstructor: 'PointerEvent',
          pointerId: 1,
          button: 0,
          clientX: 1000,
          clientY: 500,
        });
        cy.window().trigger('pointermove', {
          eventConstructor: 'PointerEvent',
          pointerId: 1,
          clientX: 1040,
          clientY: 530,
        });
        cy.window().trigger('pointerup', { eventConstructor: 'PointerEvent', pointerId: 1 });
        cy.get('[data-testid="canvas-transform"]').should('not.have.attr', 'transform', before);
      });
    cy.get('[data-testid="preview-canvas"]').contains('button', '适应宽度').click();
    cy.document().then((document) =>
      document.documentElement.style.removeProperty('--sl-color-bg-nav'),
    );
    cy.get('[data-testid="preview-canvas"]').scrollIntoView({ offset: { top: -80, left: 0 } });
    cy.screenshot('theme-workspace-dark', { capture: 'viewport' });
    cy.viewport(390, 844);
    cy.get('[data-testid="canvas-viewport"]').should('be.visible');
    cy.document().should((document) =>
      expect(document.documentElement.scrollWidth).to.be.at.most(390),
    );
  });
  it('组件库控件交互与宽屏布局', () => {
    cy.viewport(1920, 1080);
    cy.visit('/guides/theme-editor/');
    cy.get('[data-testid="theme-editor"]', { timeout: 60000 }).should(($editor) => {
      const pane = $editor[0].closest('.main-pane')!.getBoundingClientRect();
      expect($editor[0].getBoundingClientRect().width / pane.width).to.be.closeTo(0.9, 0.01);
    });
    cy.get('[data-testid="seed-primary"] .sd-color-picker-preview').click();
    cy.get('.sd-color-picker-panel').should('be.visible');
    cy.get('.editor-title').click();
    cy.get('#seed-radius').clear().type('12').blur();
    cy.get('[data-testid="theme-demo"] .sd-btn-primary')
      .first()
      .should('have.css', 'border-radius', '12px');
    cy.get('#seed-radius').clear().blur();
    cy.get('[data-testid="theme-demo"] .sd-btn-primary')
      .first()
      .should('have.css', 'border-radius', '4px');
    cy.get('.preset-select').click();
    cy.get('[role="option"]').contains('暗色').click();
    cy.get('[data-testid="theme-demo"]')
      .closest('.sd-theme-provider')
      .should('have.attr', 'sd-theme', 'dark');
    cy.get('.zoom-select').click();
    cy.get('[role="option"]').contains('75%').click();
    cy.get('[data-testid="theme-demo"]').should('have.css', 'zoom', '0.75');
    cy.get('[data-testid="theme-editor"]').contains('button', '高级').click();
    cy.get('.category-select').click();
    cy.get('[role="option"]').contains('尺寸').click();
    cy.get('.token-row').first().should('contain.text', '尺寸');
    cy.get('.token-filters').contains('仅已修改').click();
    cy.get('.token-row').should('have.length.greaterThan', 0);
    cy.get('.token-row').each(($row) => expect($row).to.have.class('modified'));
  });
  it('真实路由加载、动态预览、导入导出和移动端布局', () => {
    cy.viewport(1280, 900);
    cy.visit('/guides/theme-editor/');
    cy.get('[data-testid="theme-editor"]', { timeout: 60000 }).should('be.visible');
    cy.document().should((document) => {
      expect(document.documentElement.scrollWidth).to.be.at.most(1280);
    });
    cy.get('[data-testid="theme-editor"]').should(($editor) => {
      const editor = $editor[0].getBoundingClientRect();
      const pane = $editor[0].closest('.main-pane')!.getBoundingClientRect();
      expect(editor.width / pane.width).to.be.closeTo(0.9, 0.01);
      expect(editor.left - pane.left).to.be.closeTo(pane.width * 0.05, 2);
    });
    cy.get('[data-testid="theme-demo"] .sd-btn-primary', { timeout: 30000 })
      .first()
      .should('be.visible');
    cy.get('[data-testid="seed-primary"] input').clear().type('#cc0033').blur();
    cy.get('[data-testid="theme-demo"] .sd-btn-primary')
      .first()
      .should('have.css', 'background-color', 'rgb(204, 0, 51)');
    cy.get('[data-testid="theme-editor"]').contains('button', '高级').click();
    cy.get('[aria-label="主题范围"]').contains('button', '组件').click();
    cy.get('input[aria-label="搜索 token"]').type('btn-border-radius');
    cy.get('input[aria-label="btn-border-radius"]').type('22px').blur();
    cy.get('[data-testid="theme-demo"] .sd-btn-primary')
      .first()
      .should('have.css', 'border-radius', '22px');
    cy.get('[data-testid="theme-editor"]').scrollIntoView({ offset: { top: -100, left: 0 } });
    cy.screenshot('theme-editor-desktop', { capture: 'viewport' });
    cy.get('[data-testid="theme-editor"]').contains('button', '导出').click();
    cy.readFile('cypress/downloads/sd-theme.json').then((config) => {
      expect(config.components.button['btn-border-radius']).to.equal('22px');
      cy.get('[data-testid="theme-editor"]').contains('button', '重置全部').click();
      cy.get('[data-testid="theme-import"] input[type="file"]').selectFile(
        { contents: Cypress.Buffer.from(JSON.stringify(config)), fileName: 'round-trip.json' },
        { force: true },
      );
    });
    cy.get('[data-testid="theme-demo"] .sd-btn-primary')
      .first()
      .should('have.css', 'border-radius', '22px');
    cy.get('input[aria-label="搜索组件"]').type('input');
    cy.get('[aria-label="组件主题"] button')
      .contains('span', /^input$/)
      .click();
    cy.get('[data-testid="theme-demo"] .sd-input-wrapper').should('be.visible');
    cy.viewport(390, 844);
    cy.get('[data-testid="theme-editor"]').should(($editor) => {
      const editor = $editor[0].getBoundingClientRect();
      const pane = $editor[0].closest('.main-pane')!.getBoundingClientRect();
      expect(editor.width / pane.width).to.be.closeTo(1, 0.01);
      expect(editor.left).to.be.closeTo(pane.left, 1);
    });
    cy.document().should((document) => {
      expect(document.documentElement.scrollWidth).to.be.at.most(390);
    });
    cy.get('[data-testid="theme-editor"]').scrollIntoView({ offset: { top: -80, left: 0 } });
    cy.screenshot('theme-editor-mobile', { capture: 'viewport' });
  });
});
