describe('液态玻璃标志文档预览', () => {
  it('调参示例将现代 CSS 颜色正确传入玻璃着色器', () => {
    cy.viewport(1440, 1000);
    cy.visit('/components/liquid-glass-logo/');
    cy.get('.demo-block').eq(5).scrollIntoView();
    cy.get('.liquid-glass-playground .sd-liquid-glass-logo', { timeout: 60000 }).should(
      'have.attr',
      'data-liquid-glass-ready',
    );
    cy.get('.liquid-glass-playground canvas').then(($canvas) => {
      const gl = ($canvas[0] as HTMLCanvasElement).getContext('webgl2')!;
      const useProgram = cy.spy(gl, 'useProgram');
      cy.contains('summary', '颜色').scrollIntoView().click();
      for (const [label, color] of [
        ['底板颜色', 'color(srgb 1 0 0)'],
        ['背景颜色', 'oklch(0.95 0 0)'],
      ]) {
        cy.contains('.sd-form-item', label)
          .find('input')
          .scrollIntoView()
          .clear()
          .type(color)
          .blur();
      }
      cy.wrap(null).should(() => {
        const program = useProgram
          .getCalls()
          .find((call) => gl.getUniformLocation(call.args[0]!, 'uTile'))?.args[0];
        expect(program).to.not.equal(undefined);
        const tile = gl.getUniform(program!, gl.getUniformLocation(program!, 'uTile'));
        expect(Array.from(tile)).to.deep.equal([1, 0, 0]);
        expect(gl.getUniform(program!, gl.getUniformLocation(program!, 'uPageLight'))).to.equal(1);
      });
    });
  });

  it('默认跟随文档主题切换，显式浅色示例保持浅色', () => {
    cy.viewport(1440, 1000);
    cy.visit('/components/liquid-glass-logo/');
    cy.get('starlight-theme-select select:visible').select('light');
    cy.get('.demo-block').eq(0).scrollIntoView();
    cy.get('.sd-page-header-title .sd-liquid-glass-logo', { timeout: 60000 }).should(
      'have.attr',
      'data-liquid-glass-theme',
      'light',
    );
    cy.get('starlight-theme-select select:visible').select('dark');
    cy.get('.sd-page-header-title .sd-liquid-glass-logo').should(
      'have.attr',
      'data-liquid-glass-theme',
      'dark',
    );
    cy.get('.demo-block').eq(1).scrollIntoView();
    cy.get('.demo-block')
      .eq(1)
      .find('.sd-liquid-glass-logo', { timeout: 60000 })
      .should('have.attr', 'data-liquid-glass-theme', 'light');
    cy.get('.demo-block').eq(5).scrollIntoView();
    cy.get('.liquid-glass-playground .sd-liquid-glass-logo', { timeout: 60000 }).should(
      'have.attr',
      'data-liquid-glass-theme',
      'dark',
    );
    cy.get('starlight-theme-select select:visible').select('light');
    cy.get('.liquid-glass-playground .sd-liquid-glass-logo')
      .should('have.attr', 'data-liquid-glass-theme', 'light')
      .and('have.css', 'background-color', 'rgb(226, 226, 229)');
    cy.get('.type-reference-token').first().scrollIntoView().trigger('mouseenter');
    cy.get('.type-reference-token__popup pre.shiki').should('have.class', 'github-light');
    cy.get('starlight-theme-select select:visible').select('dark');
    cy.get('.type-reference-token__popup pre.shiki').should('have.class', 'github-dark');
  });
  it('DemoBlock 首次进入可见、播放控制与主题配色可用', () => {
    cy.viewport(1440, 1000);
    cy.visit('/components/liquid-glass-logo/');
    cy.get('.demo-block').should('have.length', 6);
    cy.get('.demo-block').eq(0).scrollIntoView();
    cy.get('.sd-page-header-title .sd-liquid-glass-logo').should(
      'have.attr',
      'data-liquid-glass-ready',
    );
    cy.get('.sd-page-header-title .sd-liquid-glass-logo').should(($logo) => {
      expect($logo[0].getBoundingClientRect().width).to.be.within(80, 140);
    });
    cy.get('.sd-page-header-title').should(($title) => {
      expect($title.text().trim()).to.equal('');
    });
    cy.get('.sd-page-header-title canvas').then(($canvas) => {
      const gl = ($canvas[0] as HTMLCanvasElement).getContext('webgl2')!;
      const program = gl.getParameter(gl.CURRENT_PROGRAM) as WebGLProgram;
      const time = gl.getUniformLocation(program, 'uTime');
      const started = Number(gl.getUniform(program, time));
      cy.wrap(null).should(() => {
        expect(Number(gl.getUniform(program, time))).to.be.greaterThan(started + 0.05);
      });
    });
    cy.get('.demo-block').each(($demo, index) => {
      cy.wrap($demo).scrollIntoView();
      cy.wrap($demo)
        .find('.sd-liquid-glass-logo', { timeout: 60000 })
        .should('have.attr', 'data-liquid-glass-ready');
      cy.wrap($demo).find('canvas').should('be.visible');
      cy.wrap($demo)
        .contains('button', index === 5 ? '重播预览' : '重新播放')
        .should('have.class', 'sd-btn-primary')
        .click();
    });
    cy.get('.demo-block').eq(0).find('.sd-liquid-glass-logo').should('have.css', 'height', '32px');
    cy.get('.sd-page-header-title .sd-liquid-glass-logo').should('exist');
    cy.get('.demo-block')
      .eq(0)
      .scrollIntoView({ offset: { top: -100, left: 0 } });
    cy.get('.sd-page-header-title canvas').then(($canvas) => {
      const gl = ($canvas[0] as HTMLCanvasElement).getContext('webgl2')!;
      const program = gl.getParameter(gl.CURRENT_PROGRAM) as WebGLProgram;
      const time = gl.getUniformLocation(program, 'uTime');
      cy.wrap(null, { timeout: 10000 }).should(() => {
        expect(Number(gl.getUniform(program, time))).to.be.at.least(3.3);
      });
    });
    cy.screenshot('liquid-glass-page-header', { capture: 'viewport' });
    cy.get('.demo-block').eq(4).find('.sd-liquid-glass-logo').should('have.css', 'height', '256px');
    cy.get('.demo-block')
      .eq(1)
      .find('.sd-liquid-glass-logo')
      .should('have.css', 'background-color', 'rgb(226, 226, 229)');
    cy.get('.demo-block')
      .eq(2)
      .scrollIntoView()
      .within(() => {
        cy.get('.liquid-glass-interactive').should(($demo) => {
          const toolbar = $demo[0].querySelector('.sd-space')!;
          const preview = $demo[0].querySelector('.sd-liquid-glass-logo')!;
          expect(
            preview.getBoundingClientRect().top - toolbar.getBoundingClientRect().bottom,
          ).to.be.at.least(16);
        });
        cy.contains('button', '暂停播放').should('have.class', 'sd-btn-status-warning').click();
        cy.contains('button', '继续播放').should('have.class', 'sd-btn-status-success').click();
        cy.contains('button', '重新播放').click();
        cy.contains('button', '查看最终字标').click();
        cy.get('.sd-liquid-glass-logo').should('have.attr', 'data-liquid-glass-ready');
        cy.get('.sd-liquid-glass-logo').should(($glass) => {
          expect($glass.attr('aria-label')?.trim()).to.equal('Design');
        });
        cy.screenshot('liquid-glass-logo-docs-preview', { capture: 'viewport' });
      });
  });

  it('调参预览支持本地 Logo、范围限制、重置和窄屏布局', () => {
    cy.viewport(1440, 1000);
    cy.visit('/components/liquid-glass-logo/');
    cy.get('.demo-block').eq(5).scrollIntoView();
    cy.get('.liquid-glass-playground', { timeout: 60000 }).scrollIntoView();
    cy.get('.liquid-glass-playground .sd-liquid-glass-logo').should(
      'have.attr',
      'data-liquid-glass-ready',
    );
    cy.get('.liquid-glass-playground').within(() => {
      cy.contains('summary', '玻璃光学').scrollIntoView().click();
      cy.contains('.sd-form-item', '光学深度')
        .find('input')
        .scrollIntoView()
        .clear()
        .type('999')
        .blur()
        .should('have.value', '6');
      cy.get('input[type=file]').selectFile(
        {
          contents: Cypress.Buffer.from(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="blue"/></svg>',
          ),
          fileName: 'my-logo.svg',
          mimeType: 'image/svg+xml',
        },
        { force: true },
      );
      cy.contains('my-logo.svg').should('be.visible');
      cy.contains('button', '恢复默认值').click();
      cy.contains('SD Design 官方 Logo').should('be.visible');
      cy.contains('.sd-form-item', '光学深度').find('input').should('have.value', '1.2');
      cy.contains('summary', '尺寸与字标').scrollIntoView().click();
      cy.contains('.sd-form-item', '容器高度')
        .find('input')
        .scrollIntoView()
        .clear()
        .type('32')
        .blur();
      cy.contains('.sd-form-item', '自动宽度').find('[role="switch"]').scrollIntoView().click();
      cy.get('.sd-liquid-glass-logo').should(($logo) => {
        expect($logo[0].getBoundingClientRect().width).to.be.within(20, 100);
        expect($logo[0].getBoundingClientRect().height).to.equal(32);
      });
      cy.contains('button', '恢复默认值').click();
      cy.get('.sd-liquid-glass-logo').should('have.css', 'height', '320px');
    });
    cy.get('.liquid-glass-playground').scrollIntoView({ offset: { top: -100, left: 0 } });
    cy.screenshot('liquid-glass-playground-desktop', { capture: 'viewport' });
    cy.viewport(390, 844);
    cy.get('.liquid-glass-playground')
      .scrollIntoView()
      .should(($demo) => {
        expect($demo[0].scrollWidth).to.be.at.most($demo[0].clientWidth);
        const preview = $demo[0].querySelector('.liquid-glass-playground-preview')!;
        const controls = $demo[0].querySelector('.liquid-glass-playground-controls')!;
        expect(controls.getBoundingClientRect().top).to.be.at.least(
          preview.getBoundingClientRect().bottom,
        );
      });
    cy.screenshot('liquid-glass-playground-mobile', { capture: 'viewport' });
  });
});
