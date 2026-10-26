describe('文档站与 SD Design 样式一致性', () => {
  for (const route of ['/guides/theme-editor/', '/components/layout/']) {
    it(`${route} 示例样式不会覆盖文档页头`, () => {
      cy.viewport(1440, 1000);
      cy.visit(route);
      cy.get('starlight-theme-select select:visible').select('light');
      const assertHeader = () => {
        cy.get('header.header')
          .should('have.css', 'position', 'fixed')
          .and('have.css', 'background-color', 'rgb(255, 255, 255)');
        cy.get('header.header > .header').should('have.css', 'display', 'grid');
      };
      if (route.includes('theme-editor')) {
        cy.get('[data-testid=theme-editor]', { timeout: 60000 }).should('be.visible');
      } else {
        cy.get('.demo-block').first().scrollIntoView();
        cy.get('.layout-basic-item', { timeout: 60000 }).should('exist');
        cy.scrollTo('top');
      }
      assertHeader();
      if (route.includes('layout')) {
        cy.contains('h3', '窄轨（Rail）').scrollIntoView();
        cy.get('.layout-rail-demo', { timeout: 60000 }).should('be.visible');
        cy.scrollTo('top');
        assertHeader();
        cy.contains('h3', '固定布局').scrollIntoView();
        cy.get('.layout-fixed-demo .header', { timeout: 60000 }).should(
          'have.css',
          'position',
          'sticky',
        );
        cy.scrollTo('top');
        assertHeader();
      }
    });
  }
  for (const mode of ['light', 'dark']) {
    it(`${mode} 模式统一文档外壳和真实组件示例`, () => {
      cy.viewport(1440, 1000);
      cy.visit('/components/button/');
      cy.get('starlight-theme-select select:visible').select(mode);
      cy.get('html')
        .should('have.attr', 'data-sd-theme', mode)
        .and('have.css', 'scrollbar-width', 'thin');
      cy.get('body').should(($body) => {
        const style = getComputedStyle($body[0]);
        expect(style.backgroundImage).to.equal('none');
        expect(style.getPropertyValue('--sl-color-bg').trim()).to.equal(
          style.getPropertyValue('--sd-color-bg-2').trim(),
        );
      });
      cy.get('.sidebar-content a[aria-current="page"]').should(($link) => {
        const style = getComputedStyle($link[0]);
        expect(style.color).to.equal(
          `rgb(${style
            .getPropertyValue('--sd-primary-7')
            .trim()
            .split(/\s*,\s*|\s+/)
            .join(', ')})`,
        );
      });
      cy.get('.sidebar-pane').should(($sidebar) => {
        const sidebar = $sidebar[0];
        const style = getComputedStyle(sidebar);
        expect(style.backgroundColor).to.equal(
          getComputedStyle(sidebar.ownerDocument.body).backgroundColor,
        );
        expect(style.scrollbarWidth).to.equal('thin');
        expect(style.scrollbarColor).not.to.equal('auto');
        expect(style.scrollbarColor).to.include('rgba(0, 0, 0, 0)');
      });
      cy.get('body').then(($body) => {
        $body[0].style.setProperty('--sd-scrollbar-thumb-color', 'rgb(90, 100, 110)');
      });
      cy.get('.sidebar-pane').should(
        'have.css',
        'scrollbar-color',
        'rgb(90, 100, 110) rgba(0, 0, 0, 0)',
      );
      cy.get('body').then(($body) => $body[0].style.removeProperty('--sd-scrollbar-thumb-color'));
      cy.get('.sidebar-pane')
        .scrollTo('bottom')
        .should(($sidebar) => {
          expect($sidebar[0].scrollTop).to.be.greaterThan(0);
        });
      cy.get('.sidebar-pane').scrollTo('top');
      cy.get('.demo-block')
        .first()
        .scrollIntoView()
        .within(() => {
          cy.get('.sd-btn-primary', { timeout: 60000 }).should('be.visible');
          cy.root()
            .should('have.css', 'border-radius', '8px')
            .and('have.css', 'box-shadow', 'none');
          cy.get('.demo-editor__button').should('have.css', 'min-height', '32px').click();
          cy.get('.demo-editor__panel').should('be.visible');
          cy.get('.demo-editor__button').click();
          cy.get('.demo-editor__panel').should('not.exist');
        });
      cy.scrollTo('top');
      cy.screenshot(`docs-style-${mode}`, { capture: 'viewport' });
    });
  }

  it('手机端保持正文可读，导航可打开', () => {
    cy.viewport(390, 844);
    cy.visit('/guides/start/');
    cy.get('h1').should('be.visible').and('have.css', 'font-size', '28px');
    cy.document().should((doc) => {
      expect(doc.documentElement.scrollWidth).to.be.at.most(390);
    });
    cy.get('.sl-menu-button').click();
    cy.get('.sidebar-content').should('be.visible');
    cy.contains('.sidebar-content a', '定制主题').click();
    cy.location('pathname').should('equal', '/guides/theme/');
    cy.screenshot('docs-style-mobile', { capture: 'viewport' });
  });
});
