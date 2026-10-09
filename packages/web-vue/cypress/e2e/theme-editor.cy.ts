// Match the component harness: ignore only the browser's deferred resize
// notification diagnostic, while all other application exceptions fail the spec.
Cypress.on('uncaught:exception', (error) => {
  if (error.message.includes('ResizeObserver loop')) return false;
});
describe('文档站主题编辑器', () => {
  it('画布说明、微调输入和文件弹窗的自定义样式生效', () => {
    cy.viewport(1440, 1000);
    cy.visit('/guides/theme-editor/');
    cy.get('.canvas-help', { timeout: 60000 })
      .should('have.css', 'display', 'block')
      .and('have.css', 'padding', '12px')
      .and('have.css', 'font-size', '12px');
    cy.get('[data-testid="canvas-viewport"]')
      .invoke('attr', 'aria-describedby')
      .then((id) => {
        cy.get('.canvas-help').should('have.attr', 'id', id);
      });
    cy.get('.canvas-toolbar').should('have.css', 'padding', '12px');
    cy.get('.editor-steps').contains('.sd-steps-item', '调整品牌').click();
    cy.contains('.sd-collapse-item-header', '微调组件').click();
    cy.get('.token-value .value-input')
      .first()
      .should('have.css', 'flex-grow', '1')
      .and('have.css', 'min-width', '0px');
    cy.get('.token-value .value-input input')
      .first()
      .should('have.css', 'font-family', 'monospace');
    cy.contains('.sd-collapse-item-header', '导入与更多选项').click();
    cy.contains('button', '编辑主题文件').click();
    cy.get('.json-editor')
      .should('have.css', 'margin-top', '16px')
      .and('have.css', 'margin-bottom', '16px');
    cy.get('textarea[aria-label="主题文件内容"]')
      .should('have.css', 'font-family', 'monospace')
      .and('have.css', 'font-size', '13px');
    cy.get('.sd-modal:visible').contains('button', '取消').click();
    cy.viewport(390, 844);
    cy.get('.token-value .value-input input').first().should('have.css', 'font-size', '16px');
  });
  it('手机可按需查看帮助，接入说明移到主题文档', () => {
    cy.viewport(390, 844);
    cy.visit('/guides/theme-editor/');
    cy.get('.save-notice', { timeout: 60000 })
      .should('be.visible')
      .and('contain.text', '不会自动保存');
    cy.get('.sl-markdown-content > pre').should('not.exist');
    cy.get('.mobile-toolbar').contains('label', '预览').click();
    cy.get('[aria-label="预览帮助"]').click();
    cy.get('[role="tooltip"]:visible').should('contain.text', '按钮和表单可以操作');
    cy.get('[aria-label="预览帮助"]').blur();
    cy.get('.editor-steps').contains('.sd-steps-item', '确认效果').click();
    cy.get('[aria-label="主题文件帮助"]').click();
    cy.get('[role="tooltip"]:visible').should('contain.text', '导入这里继续调整');
    cy.get('[aria-label="主题文件帮助"]').blur();
    cy.contains('.sd-collapse-item-header', '导入与更多选项').click();
    cy.contains('a', '开发者接入说明').click();
    cy.location('pathname').should('equal', '/guides/theme/');
    cy.contains('h3', '主题文件接入').should('be.visible');
    cy.contains('h3', '编辑器字段与组件发现').should('exist');
  });
  it('页面深色模式的容器、表格和语义背景全部同步', () => {
    cy.viewport(1280, 1000);
    cy.visit('/guides/theme-editor/');
    cy.get('[data-testid="theme-editor"]', { timeout: 60000 }).should('be.visible');
    cy.get('.preview-toolbar').contains('页面预览').click();
    cy.get('[aria-label="预览明暗"]').contains('深色').click();
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
      cy.get('.editor-steps').contains('.sd-steps-item', '选择风格').click();
      cy.contains('.preset-option', preset).click();
      if (preset !== '暗色' && preset !== '赛博朋克')
        cy.get('[aria-label="预览明暗"]').contains('深色').click();
      assertDark();
      // 外层文档主题与预览主题相反时仍应保持独立。
      cy.document().then((document) => document.documentElement.setAttribute('data-theme', 'dark'));
      assertDark();
      cy.get('[aria-label="预览明暗"]').contains('浅色').click();
      cy.get('[data-testid="workspace-page"] .sd-card')
        .first()
        .should('have.css', 'background-color', 'rgb(255, 255, 255)');
      cy.document().then((document) =>
        document.documentElement.setAttribute('data-theme', 'light'),
      );
    }
    cy.get('[aria-label="预览明暗"]').contains('深色').click();
    cy.get('[data-testid="preview-canvas"]').screenshot('dark-theme-surfaces');
  });
  it('业务页面语义色、独立深色主题与画布交互', () => {
    cy.viewport(1600, 1000);
    cy.visit('/guides/theme-editor/');
    cy.get('.editor-steps', { timeout: 60000 }).contains('.sd-steps-item', '调整品牌').click();
    cy.contains('.sd-collapse-item-header', '状态颜色与精确数值').click();
    cy.get('[data-testid="seed-warning"] input').clear().type('#9933cc').blur();
    cy.get('.preview-toolbar').contains('页面预览').click();
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
    cy.get('[aria-label="预览明暗"]').contains('深色').click();
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
    cy.get('[role="option"]:visible').contains('周宁').click();
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
    cy.get('.mobile-toolbar').contains('label', '预览').click();
    cy.get('[data-testid="workspace-page"]')
      .should('be.visible')
      .and('have.class', 'mobile-layout');
    cy.get('[data-testid="canvas-viewport"]').should('not.exist');
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
    cy.get('.editor-steps').contains('.sd-steps-item', '调整品牌').focus().type('{enter}');
    cy.get('.preview-toolbar').contains('组件示例').click();
    cy.get('[data-testid="seed-primary"] .sd-color-picker-preview').click();
    cy.get('.sd-color-picker-panel').should('be.visible');
    cy.get('.editor-title').click();
    cy.contains('.sd-collapse-item-header', '状态颜色与精确数值').click();
    cy.get('#seed-radius').clear().type('12').blur();
    cy.get('[data-testid="theme-demo"] .sd-btn-primary')
      .first()
      .should('have.css', 'border-radius', '12px');
    cy.get('#seed-radius').clear().blur();
    cy.get('[data-testid="theme-demo"] .sd-btn-primary')
      .first()
      .should('have.css', 'border-radius', '4px');
    cy.get('.editor-steps').contains('.sd-steps-item', '选择风格').click();
    cy.contains('.preset-option', '暗色').click();
    cy.get('.editor-steps').contains('.sd-steps-item', '调整品牌').click();
    cy.get('[data-testid="theme-demo"]')
      .closest('.sd-theme-provider')
      .should('have.attr', 'sd-theme', 'dark');
    cy.get('.zoom-select').click();
    cy.get('[role="option"]:visible').contains('75%').click();
    cy.get('[data-testid="theme-demo"]').should('have.css', 'zoom', '0.75');
    cy.contains('.sd-collapse-item-header', '微调组件').click();
    cy.get('.category-select').click();
    cy.get('[role="option"]:visible').contains('尺寸').click();
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
    cy.get('.editor-steps').contains('.sd-steps-item', '调整品牌').click();
    cy.get('.preview-toolbar').contains('组件示例').click();
    cy.get('[data-testid="theme-demo"] .sd-btn-primary', { timeout: 30000 })
      .first()
      .should('be.visible');
    cy.get('[data-testid="seed-primary"] input').clear().type('#cc0033').blur();
    cy.get('[data-testid="theme-demo"] .sd-btn-primary')
      .first()
      .should('have.css', 'background-color', 'rgb(204, 0, 51)');
    cy.contains('.sd-collapse-item-header', '微调组件').click();
    cy.get('[aria-label="微调对象"]').click();
    cy.get('[role="option"]:visible').contains('按钮').click();
    cy.get('input[aria-label="搜索 token"]').type('btn-border-radius');
    cy.get('input[aria-label="btn-border-radius"]').type('22px').blur();
    cy.get('[data-testid="theme-demo"] .sd-btn-primary')
      .first()
      .should('have.css', 'border-radius', '22px');
    cy.get('[data-testid="theme-editor"]').scrollIntoView({ offset: { top: -100, left: 0 } });
    cy.screenshot('theme-editor-desktop', { capture: 'viewport' });
    cy.get('.editor-steps').contains('.sd-steps-item', '确认效果').click();
    cy.contains('button', '下载主题文件').click();
    cy.contains('button', '继续调整').click();
    cy.contains('.sd-collapse-item-header', '导入与更多选项').click();
    cy.readFile('cypress/downloads/sd-theme.json')
      .should((config) => expect(config.components?.button?.['btn-border-radius']).to.equal('22px'))
      .then((config) => {
        cy.get('[data-testid="theme-editor"]').contains('button', '恢复默认主题').click();
        cy.get('[data-testid="theme-import"] input[type="file"]').selectFile(
          { contents: Cypress.Buffer.from(JSON.stringify(config)), fileName: 'round-trip.json' },
          { force: true },
        );
      });
    cy.get('[data-testid="theme-demo"] .sd-btn-primary')
      .first()
      .should('have.css', 'border-radius', '22px');
    cy.get('input[aria-label="搜索组件"]').type('input');
    cy.get('[aria-label="微调对象"]').click();
    cy.get('[role="option"]:visible').contains('输入框 Input').click();
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

  it('手机能完成调整、预览交互和下载，切换工作区保留设置', () => {
    cy.viewport(390, 844);
    cy.visit('/guides/theme-editor/');
    cy.get('.mobile-toolbar', { timeout: 60000 }).contains('button', '调整品牌').click();
    cy.get('.editor-preview').should('not.be.visible');
    cy.get('[aria-label="常用品牌色"]').contains('button', '紫色').click();
    cy.contains('.radius-choice', '圆润').click();
    cy.get('.step-actions').scrollIntoView({ offset: { top: -200, left: 0 } });
    cy.get('.mobile-toolbar').should(($toolbar) => {
      const bounds = $toolbar[0].getBoundingClientRect();
      const navHeight = parseFloat(getComputedStyle($toolbar[0]).top);
      expect(bounds.top).to.be.closeTo(navHeight, 2);
      expect(bounds.bottom).to.be.lessThan(844);
    });
    cy.get('.mobile-toolbar').contains('label', '预览').click();
    cy.get('.editor-controls').should('not.be.visible');
    cy.get('[data-testid="workspace-page"]')
      .should('be.visible')
      .and('have.class', 'mobile-layout');
    cy.get('[data-testid="canvas-viewport"]').should('not.exist');
    cy.get('[data-testid="workspace-page"]')
      .contains('button', '新建任务')
      .should('have.css', 'background-color', 'rgb(139, 92, 246)')
      .and('have.css', 'border-radius', '12px')
      .click();
    cy.get('.sd-modal:visible').should(($modal) => {
      const bounds = $modal[0].getBoundingClientRect();
      expect(bounds.left).to.be.at.least(0);
      expect(bounds.right).to.be.at.most(390);
    });
    cy.get('input[aria-label="任务名称"]').type('手机预览任务');
    cy.get('.sd-modal:visible').contains('button', '创建任务').click();
    cy.get('input[aria-label="搜索交付任务"]').type('手机预览任务');
    cy.get('[data-testid="workspace-page"] .sd-table').should('contain.text', '手机预览任务');
    cy.get('.mobile-toolbar').contains('label', '调整').click();
    cy.get('.panel-heading').should(($heading) => {
      expect($heading[0].getBoundingClientRect().top).to.be.lessThan(844 / 3);
    });
    cy.get('[aria-label="常用品牌色"]')
      .contains('button', '紫色')
      .should('have.attr', 'aria-pressed', 'true');
    cy.get('.radius-choice input[value="12"]').should('be.checked');
    cy.screenshot('mobile-settings', { capture: 'viewport' });
    cy.get('.mobile-toolbar').contains('label', '预览').click();
    cy.get('input[aria-label="搜索交付任务"]').should('have.value', '手机预览任务');
    cy.get('[aria-label="预览明暗"]').contains('深色').click();
    cy.screenshot('mobile-preview', { capture: 'viewport' });
    for (const width of [320, 768]) {
      cy.viewport(width, 844);
      cy.document().should((document) =>
        expect(document.documentElement.scrollWidth).to.be.at.most(width),
      );
      cy.get('[data-testid="workspace-page"]').should('be.visible');
      cy.get('.editor-steps .sd-steps-item-title').each(($title) => {
        const bounds = $title[0].getBoundingClientRect();
        expect(bounds.left).to.be.at.least(0);
        expect(bounds.right).to.be.at.most(width);
      });
    }
    cy.viewport(390, 844);
    cy.get('.mobile-toolbar').contains('button', '确认主题').click();
    cy.get('input[aria-label="主题名称"]').clear().type('手机品牌主题');
    cy.get('.mobile-toolbar').contains('label', '调整').click();
    cy.screenshot('mobile-confirm', { capture: 'viewport' });
    cy.get('.mobile-toolbar').contains('button', '下载主题').click();
    cy.readFile('cypress/downloads/sd-theme.json').should((config) => {
      expect(config.meta.name).to.equal('手机品牌主题');
      expect(config.seed.primary).to.equal('#8b5cf6');
      expect(config.seed.radius).to.equal(12);
      expect(config.algorithm).to.include('dark');
    });
  });
});
