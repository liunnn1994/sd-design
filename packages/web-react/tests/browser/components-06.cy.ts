describe('React Switch', () => {
  beforeEach(() => cy.visit('/'));

  it('opens, updates and closes imperative drawers with provider settings and cleanup', () => {
    cy.contains('button', '打开命令抽屉').click();
    cy.get('[aria-label="命令抽屉输入"]').should('be.focused');
    cy.get('.imperative-drawer .sd-drawer').should('have.css', 'left', '0px');
    cy.get('.imperative-drawer .sd-drawer').should('have.css', 'width', '280px');
    // The imperative drawer traps focus, so its public handle drives updates from the fixture.
    cy.contains('button', '更新命令抽屉').click({ force: true });
    cy.get('.imperative-drawer .sd-drawer').should('have.css', 'width', '410px');
    cy.get('.imperative-drawer .sd-drawer-mask').click('right');
    cy.get('.imperative-drawer .sd-drawer').should('be.visible');
    cy.get('.imperative-drawer .sd-drawer-footer').contains('button', '确定').click();
    cy.get('.imperative-drawer').should('not.exist');
    cy.get('[data-testid="drawer-events"]').should('contain.text', 'imperativeOk,imperativeClose');
    cy.contains('button', '打开命令抽屉').click();
    cy.get('.imperative-drawer .sd-drawer-footer').contains('button', '取消').click();
    cy.get('.imperative-drawer').should('not.exist');
    cy.get('[data-testid="drawer-events"]').should(
      'contain.text',
      'imperativeCancel,imperativeClose',
    );
    cy.contains('button', '打开命令抽屉').click();
    cy.contains('button', '关闭命令抽屉').click({ force: true });
    cy.get('.imperative-drawer').should('not.exist');
    cy.contains('button', '立即关闭命令抽屉').click();
    cy.contains('瞬时抽屉').should('not.exist');
    cy.get('[data-testid="drawer-events"]').should('contain.text', 'immediateClose');
  });

  it('recalculates breadcrumb collapse across fragments, max-count changes and route mode', () => {
    cy.get('[data-testid="dynamic-breadcrumb"] [role="listitem"]').should('have.length', 3);
    cy.get('[data-testid="dynamic-breadcrumb"] [aria-label="更多面包屑项"]').should(
      'have.text',
      '更多路径',
    );
    cy.contains('button', '切换面包屑限制').click();
    cy.get('[data-testid="dynamic-breadcrumb"] [role="listitem"]').should('have.length', 5);
    cy.contains('button', '切换面包屑限制').click();
    cy.contains('button', '切换面包屑来源').click();
    cy.get('[data-testid="dynamic-breadcrumb"] [role="listitem"]').should('have.length', 3);
    cy.get('[data-testid="dynamic-breadcrumb"] [aria-label="更多面包屑项"]').should('not.exist');
    cy.get('[data-testid="dynamic-breadcrumb"] a')
      .eq(1)
      .should('have.attr', 'href', '#/home/section');
    cy.get('[data-testid="dynamic-breadcrumb"] .sd-breadcrumb-item-separator').should(
      'have.length',
      2,
    );
  });

  it('updates breadcrumb dropdown content and separator precedence without retaining popup state', () => {
    cy.get('[data-testid="custom-breadcrumb"]').should('have.attr', 'aria-label', '面包屑');
    cy.get('[data-testid="custom-breadcrumb"] .sd-breadcrumb-item-separator')
      .should('have.text', '-')
      .and('have.attr', 'aria-hidden', 'true');
    cy.get('[data-testid="custom-breadcrumb"] .sd-breadcrumb-item-dropdown-icon').should(
      'not.exist',
    );
    cy.contains('button', '切换面包屑下拉').click();
    cy.contains('[role="listitem"]', '动态首页').click();
    cy.contains('[role="menuitem"]', '自定义路径').click();
    cy.get('[data-testid="breadcrumb-selected"]').should('have.text', 'custom');
    cy.contains('[role="listitem"]', '动态首页').click();
    cy.contains('[role="menuitem"]', '自定义路径').should('be.visible');
    cy.contains('button', '切换面包屑下拉').click();
    cy.get('[data-testid="custom-breadcrumb"] .sd-breadcrumb-item-dropdown-icon').should(
      'not.exist',
    );
    cy.contains('[role="menuitem"]', '自定义路径').should('not.exist');
    cy.contains('button', '切换面包屑下拉').click();
    cy.get('[data-testid="custom-breadcrumb"] .sd-breadcrumb-item-dropdown-icon-active').should(
      'not.exist',
    );
  });

  it('builds custom breadcrumb URLs and passes accumulated paths to item renderers', () => {
    cy.get('[data-testid="url-breadcrumb"] a')
      .eq(1)
      .should('have.attr', 'href', '/browse/home/section');
    cy.get('[data-testid="url-breadcrumb"] .sd-breadcrumb-item')
      .last()
      .find('a')
      .should('not.exist');
    cy.get('[data-testid="render-breadcrumb"] [data-paths]')
      .last()
      .should('have.attr', 'data-paths', 'home|section|detail')
      .and('have.text', '详情渲染');
    cy.get('[data-testid="url-breadcrumb"] .sd-breadcrumb-item-with-dropdown').click('right');
    cy.contains('[role="menuitem"]', '下拉路径').should('be.visible');
  });

  it('focuses dropdown options, skips disabled items and selects zero values by keyboard', () => {
    cy.contains('button', '打开菜单测试').click();
    cy.contains('[role="menuitem"]', '零值选项').should('be.focused').type('{downarrow}');
    cy.contains('[role="menuitem"]', '回退文本').should('be.focused').type('{home}');
    cy.contains('[role="menuitem"]', '零值选项').should('be.focused').type('{enter}');
    cy.get('[data-testid="dropdown-selected"]').should('have.text', '0');
    cy.get('.sd-dropdown').should('not.exist');
    cy.contains('button', '打开菜单测试').click();
    cy.contains('[role="menuitem"]', '回退文本').click();
    cy.get('[data-testid="dropdown-selected"]').should('have.text', '"回退文本"');
  });

  it('selects nested dropdown values without selecting the submenu trigger', () => {
    cy.contains('button', '打开菜单测试').click();
    cy.contains('[role="menuitem"]', '更多操作').click();
    cy.get('[data-testid="dropdown-selected"]').should('be.empty');
    cy.contains('[role="menuitem"]', '子菜单操作').should('be.focused').click();
    cy.get('[data-testid="dropdown-selected"]').should('have.text', '{"id":7}');
    cy.get('.sd-dropdown').should('not.exist');
  });

  it('preserves editable keyboard behavior and updates dropdown empty state without closing', () => {
    cy.contains('button', '保留菜单测试').click();
    cy.get('.sd-dropdown-list-wrapper').should('have.css', 'max-height', '100px');
    cy.get('[aria-label="列表内输入"]')
      .type('a b{home}{rightarrow}')
      .should('have.value', 'a b')
      .should('be.focused');
    cy.contains('[role="menuitem"]', '切换菜单空态').click();
    cy.get('.sd-dropdown-empty').should('be.visible');
    cy.get('.sd-dropdown-footer').should('not.exist');
    cy.contains('[role="menuitem"]', '切换菜单空态').click();
    cy.get('.sd-dropdown-empty').should('not.exist');
    cy.get('.sd-dropdown-footer').should('contain.text', '保留菜单尾');
  });

  it('waits for controlled dropdown writeback and keeps both split buttons disabled', () => {
    cy.contains('button', '拒绝菜单写回').click();
    cy.get('.sd-dropdown').should('not.exist');
    cy.get('[data-testid="dropdown-requests"]').should('have.text', '1');
    cy.contains('button', '外部切换菜单').click();
    cy.contains('[role="menuitem"]', '受控菜单内容').should('be.visible');
    cy.get('body').click(1, 1);
    cy.contains('[role="menuitem"]', '受控菜单内容').should('be.visible');
    cy.contains('button', '外部切换菜单').click();
    cy.get('[data-testid="split-dropdown"] button').each(
      ($button) => expect($button).to.be.disabled,
    );
    cy.get('[data-testid="split-root"]')
      .should('have.class', 'sd-btn-group')
      .and('have.class', 'split-custom');
    cy.contains('button', '切换分裂禁用').click();
    cy.contains('button', '主操作').click();
    cy.get('[data-testid="dropdown-selected"]').should('have.text', 'main');
    cy.contains('button', '打开分裂菜单').click();
    cy.contains('[role="menuitem"]', '分裂选项').click();
    cy.get('[data-testid="dropdown-selected"]').should('have.text', 'split');
  });

  it('registers wrapped siders with the nearest layout and removes them dynamically', () => {
    cy.get('[data-testid="outer-layout"]').should('not.have.class', 'sd-layout-has-sider');
    cy.get('[data-testid="inner-layout"]').should('have.class', 'sd-layout-has-sider');
    cy.contains('button', '切换包装侧栏').click();
    cy.get('[data-testid="inner-layout"]').should('not.have.class', 'sd-layout-has-sider');
    cy.contains('button', '切换包装侧栏').click();
    cy.get('[data-testid="inner-layout"]').should('have.class', 'sd-layout-has-sider');
  });

  it('updates responsive collapse, zero-width keyboard triggers and inherited theme', () => {
    cy.viewport(500, 700);
    cy.get('[data-testid="responsive-sider"]')
      .should('have.class', 'sd-layout-sider-below')
      .should('have.css', 'width', '0px');
    cy.get('[data-testid="responsive-sider"] [role="button"]').focus().type('{enter}');
    cy.get('[data-testid="responsive-sider"]').should('have.css', 'width', '200px');
    cy.get('[data-testid="layout-events"]').should('have.text', 'false:clickTrigger');
    cy.contains('button', '切换侧栏断点').click();
    cy.get('[data-testid="responsive-sider"]').should('not.have.class', 'sd-layout-sider-below');
    cy.get('[data-testid="responsive-sider"] [role="button"]').should('not.exist');
    cy.contains('button', '切换布局主题').click();
    cy.get('[data-testid="responsive-sider"]').should('have.class', 'sd-layout-sider-dark');
    cy.get('[data-testid="controlled-sider"] [role="button"]').click();
    cy.get('[data-testid="controlled-sider"]').should('have.css', 'width', '200px');
    cy.get('[data-testid="controlled-sider"] .sd-scrollbar').should('exist');
  });

  it('expands the rail overlay without shifting content and clears stale hover state', () => {
    cy.get('[data-testid="rail-content"]').then(($content) => {
      const left = $content[0].getBoundingClientRect().left;
      cy.get('[data-testid="rail-sider"]').trigger('mouseover');
      cy.get('.sd-layout-sider-rail-overlay').should('have.css', 'width', '240px');
      cy.get('[data-testid="rail-sider"]').should('have.css', 'width', '60px');
      cy.get('[data-testid="rail-content"]').should(($next) =>
        expect($next[0].getBoundingClientRect().left).to.eq(left),
      );
    });
    cy.contains('button', '切换窄轨悬停').click();
    cy.get('.sd-layout-sider-rail-overlay').should('have.css', 'width', '60px');
    cy.contains('button', '切换窄轨悬停').click();
    cy.get('.sd-layout-sider-rail-overlay').should('not.have.class', 'sd-layout-sider-rail-expand');
  });

  it('opens temporary siders as drawers and reports mask collapse', () => {
    cy.get('.sd-layout-sider-temporary-trigger').click();
    cy.get('[aria-label="临时侧栏输入"]').should('be.focused');
    cy.get('.sd-drawer-mask').filter(':visible').click('right');
    cy.get('[aria-label="临时侧栏输入"]').should('not.exist');
    cy.get('[data-testid="layout-events"]').should('have.text', 'true:mask');
  });

  it('traps drawer focus, closes only the top dialog with Escape and restores focus', () => {
    cy.contains('button', '打开抽屉测试').click();
    cy.get('[aria-label="抽屉输入"]').should('be.focused');
    cy.get('.sd-drawer').filter(':visible').should('have.css', 'width', '320px');
    cy.get('body').should('have.css', 'overflow', 'hidden');
    cy.contains('button', '打开内层抽屉').click();
    cy.get('[aria-label="内层输入"]').should('be.focused').type('{esc}');
    cy.contains('.sd-drawer-title', '内层抽屉').should('not.exist');
    cy.contains('button', '打开内层抽屉').should('be.focused');
    cy.get('body').should('have.css', 'overflow', 'hidden');
    cy.get('[aria-label="抽屉输入"]').type('{esc}');
    cy.contains('.sd-drawer-title', '抽屉测试').should('not.exist');
    cy.contains('button', '打开抽屉测试').should('be.focused');
    cy.get('body').should('not.have.css', 'overflow', 'hidden');
    cy.get('[data-testid="drawer-events"]').should('contain.text', 'beforeClose,close');
  });

  it('retains a vetoed drawer and completes async confirmation before unmounting', () => {
    cy.contains('button', '打开抽屉测试').click();
    cy.get('.sd-drawer-footer').filter(':visible').contains('button', '确定').click();
    cy.get('.sd-drawer-footer .sd-btn-loading').should('exist');
    cy.get('.sd-drawer-footer .sd-btn-loading').should('not.exist');
    cy.get('[aria-label="抽屉输入"]').should('be.visible');
    cy.contains('button', '允许抽屉确认').click();
    cy.get('.sd-drawer-footer').filter(':visible').contains('button', '确定').click();
    cy.get('[aria-label="抽屉输入"]').should('not.exist');
    cy.get('[data-testid="drawer-events"]').should('contain.text', 'ok,beforeClose,close');
  });

  it('renders a maskless bottom drawer inside its custom container', () => {
    cy.contains('button', '切换容器抽屉').click();
    cy.get('#drawer-container .sd-drawer')
      .should('be.visible')
      .should('have.css', 'height', '80px');
    cy.get('#drawer-container .sd-drawer-container').should('have.css', 'position', 'absolute');
    cy.get('#drawer-container .sd-drawer-mask').should('not.exist');
    cy.get('#drawer-container .sd-drawer').type('{esc}').should('be.visible');
  });

  it('handles responsive row gutters, zero spans, flex zero and dynamic div mode', () => {
    cy.viewport(1000, 800);
    cy.get('[data-testid="row"]')
      .should('have.class', 'sd-row-nowrap')
      .and('have.css', 'margin-left', '-8px');
    cy.get('[data-testid="col-zero"]')
      .should('be.visible')
      .and('have.class', 'sd-col-md-12')
      .and('have.css', 'padding-left', '8px');
    cy.get('[data-testid="col-flex"]')
      .should('have.css', 'flex-grow', '0')
      .and('not.have.class', 'sd-col-24');
    cy.get('[data-testid="col-fixed"]').should('have.css', 'flex-basis', '100px');
    cy.viewport(500, 700);
    cy.get('[data-testid="col-zero"]').should('not.exist');
    cy.get('[data-testid="row"]').should('have.css', 'margin-left', '0px');
    cy.contains('button', '切换栅格 div').click();
    cy.get('[data-testid="col-zero"]').should('exist').and('not.have.class', 'sd-col');
    cy.get('[data-testid="row"]').should('not.have.class', 'sd-row');
    cy.contains('button', '切换栅格 div').click();
    cy.get('[data-testid="col-zero"]').should('not.exist');
  });

  it('updates collapsed grid collection after keyed deletion, reordering and remounting', () => {
    cy.get('[data-testid="grid-A"]').should('be.visible');
    cy.get('[data-testid="grid-B"]').should('be.visible');
    cy.get('[data-testid="grid-C"]').should('not.be.visible');
    cy.get('[data-testid="grid-suffix"]').should('have.text', 'true');
    cy.contains('button', '删除网格 B').click();
    cy.get('[data-testid="grid-B"]').should('not.exist');
    cy.get('[data-testid="grid-C"]').should('be.visible');
    cy.get('[data-testid="grid-suffix"]').should('have.text', 'false');
    cy.contains('button', '重排网格').click();
    cy.get('[data-testid="grid-D"]').should('be.visible');
    cy.get('[data-testid="grid-A"]').should('not.be.visible');
    cy.get('[data-testid="grid-suffix"]').should('have.text', 'true');
    cy.contains('button', '挂载网格').click();
    cy.get('[data-testid="grid-collection"]').should('not.exist');
    cy.contains('button', '挂载网格').click();
    cy.get('[data-testid="grid-D"]').should('be.visible');
    cy.get('[data-testid="grid-A"]').should('not.be.visible');
  });

  it('preserves collapsed row geometry and responsive item offsets', () => {
    cy.get('[data-testid="grid-geometry"]').should('have.css', 'height', '50px');
    cy.get('[data-testid="geometry-2"]').should('not.be.visible');
    cy.contains('button', '切换网格折叠').click();
    cy.get('[data-testid="geometry-2"]').should('be.visible');
    cy.get('[data-testid="grid-geometry"]').should('have.css', 'height', '80px');
    cy.viewport(1000, 800);
    cy.get('[data-testid="grid-responsive"]').should('have.css', 'column-gap', '8px');
    cy.get('[data-testid="grid-offset"]').should('have.css', 'margin-left', '82px');
    cy.get('[data-testid="grid-span"]').should('be.visible');
    cy.viewport(500, 700);
    cy.get('[data-testid="grid-span"]').should('not.be.visible');
    cy.get('[data-testid="grid-offset"]').should('have.css', 'margin-left', '160px');
  });

  it('renders descriptions layouts with shared spans, alignment and provider size', () => {
    cy.viewport(1000, 800);
    cy.get('[data-testid="descriptions"]')
      .should('have.class', 'sd-descriptions-size-small')
      .and('have.class', 'sd-descriptions-border');
    cy.get('[data-testid="descriptions"] table').should('have.css', 'table-layout', 'fixed');
    cy.get('[data-testid="descriptions"] tr')
      .should('have.length', 2)
      .first()
      .find('td')
      .eq(3)
      .should('have.attr', 'colspan', '3');
    cy.get('[data-testid="descriptions"] .sd-descriptions-item-label')
      .first()
      .should('have.text', '0:A')
      .and('have.css', 'text-align', 'right')
      .and('have.css', 'color', 'rgb(255, 0, 0)');
    cy.get('[data-testid="descriptions"] .sd-descriptions-item-value')
      .first()
      .should('have.css', 'text-align', 'center')
      .find('b')
      .should('have.text', '第一项');
    cy.get('[aria-label="描述列表布局"]').select('vertical');
    cy.get('[data-testid="descriptions"] tr')
      .should('have.length', 4)
      .first()
      .find('td')
      .eq(1)
      .should('have.attr', 'colspan', '2');
    for (const layout of ['inline-horizontal', 'inline-vertical']) {
      cy.get('[aria-label="描述列表布局"]').select(layout);
      cy.get('[data-testid="descriptions"] tr')
        .should('have.length', 2)
        .first()
        .find('td')
        .should('have.length', 2);
      cy.get('[data-testid="descriptions"] .sd-descriptions-item-label-inline').should(
        'have.length',
        4,
      );
    }
  });

  it('reflows descriptions at breakpoints and refreshes columns when switching from numeric mode', () => {
    cy.viewport(500, 700);
    cy.get('[data-testid="descriptions"] tr').should('have.length', 4);
    cy.contains('button', '切换固定列数').click();
    cy.get('[data-testid="descriptions"] tr').should('have.length', 3);
    cy.viewport(1000, 800);
    cy.get('[data-testid="descriptions"] tr').should('have.length', 3);
    cy.contains('button', '切换固定列数').click();
    cy.get('[data-testid="descriptions"] tr').should('have.length', 2);
  });

  it('uses fragment description items in preference to the data and renderer props', () => {
    cy.viewport(1000, 800);
    cy.contains('button', '切换描述子项').click();
    cy.get('[data-testid="descriptions"] tr').should('have.length', 1);
    cy.get('[data-testid="descriptions"] .sd-descriptions-item-label em').should(
      'have.text',
      '子项标签',
    );
    cy.contains('[data-testid="descriptions"] button', '子项按钮').should('be.visible');
    cy.get('[data-testid="descriptions"]').should('not.contain.text', '第一项');
    cy.contains('button', '切换描述子项').click();
    cy.get('[data-testid="descriptions"]').should('contain.text', '第一项');
  });

  it('activates page header back with mouse and keyboard and uses provider labels', () => {
    cy.get('[data-testid="page-header"] [role="button"]')
      .should('have.attr', 'aria-label', 'Back')
      .click();
    cy.get('[data-testid="page-header-events"]').should('have.text', 'click,');
    cy.get('[data-testid="page-header"] [role="button"]')
      .focus()
      .trigger('keydown', { key: 'Enter' })
      .trigger('keydown', { key: ' ' })
      .trigger('keydown', { key: 'ArrowLeft' });
    cy.get('[data-testid="page-header-events"]').should('have.text', 'click,keydown,keydown,');
    cy.get('[data-testid="page-header-custom"] [role="button"]')
      .should('have.text', '← 返回')
      .click();
    cy.get('[data-testid="page-header-events"]').should('have.text', 'custom');
  });

  it('updates page header regions and shared layout classes', () => {
    cy.get('[data-testid="page-header"]')
      .should('have.class', 'sd-page-header-with-breadcrumb')
      .and('have.class', 'sd-page-header-with-content');
    cy.get('[data-testid="page-header"] .sd-page-header-header').should(
      'have.css',
      'display',
      'flex',
    );
    cy.get('[data-testid="page-header"] .sd-page-header-divider').should(
      'have.attr',
      'aria-hidden',
      'true',
    );
    cy.contains('button', '页头操作').click();
    cy.get('[data-testid="page-header-events"]').should('have.text', 'extra');
    cy.contains('button', '切换页头区域').click();
    cy.get('[data-testid="page-header"]')
      .should('not.have.class', 'sd-page-header-with-breadcrumb')
      .and('not.have.class', 'sd-page-header-with-content');
    for (const part of ['back-btn', 'subtitle', 'divider', 'breadcrumb', 'extra', 'content'])
      cy.get(`[data-testid="page-header"] .sd-page-header-${part}`).should('not.exist');
    cy.get('[data-testid="page-header"] .sd-page-header-title strong').should(
      'have.text',
      '页面标题',
    );
  });

  it('renders result status variants and supports custom and invalid status handling', () => {
    for (const [status, icon] of [
      ['info', 'info'],
      ['success', 'check'],
      ['warning', 'exclamation'],
      ['error', 'close'],
    ]) {
      cy.get('[aria-label="结果状态"]').select(status);
      cy.get(`[data-testid="result"] .sd-result-icon-${status}`)
        .should('have.attr', 'aria-hidden', 'true')
        .find(`svg.sd-icon-${icon}`)
        .should('exist');
    }
    cy.get('[aria-label="结果状态"]').select('custom');
    cy.get('[data-testid="result"] .sd-result-icon-custom')
      .should('have.text', '自定义结果')
      .find('svg')
      .should('not.exist');
    cy.get('[aria-label="结果状态"]').select('invalid');
    cy.get('[data-testid="result"] .sd-icon-info').should('exist');
    cy.contains('button', '重试结果 0').click();
    cy.contains('button', '重试结果 1').should('exist');
    cy.get('[data-testid="result"] .sd-result-content').should('have.text', '结果详情');
  });

  it('renders shared result illustrations with unique and resolvable SVG references', () => {
    for (const status of ['403', '404', '500']) {
      cy.get('[aria-label="结果状态"]').select(status);
      cy.get(`[data-testid="result"] .sd-result-icon-${status} svg`)
        .should('have.attr', 'viewBox', '0 0 213 213')
        .and('be.visible');
      cy.get('[data-testid^="result"] svg').should(($svgs) => {
        const ids = Array.from($svgs).flatMap((svg) =>
          Array.from(svg.querySelectorAll('[id]')).map((node) => node.id),
        );
        expect(new Set(ids).size).to.equal(ids.length);
        for (const svg of Array.from($svgs)) {
          for (const node of Array.from(svg.querySelectorAll('[href]'))) {
            const href = node.getAttribute('href')!;
            if (href.startsWith('#'))
              expect(
                Array.from(svg.querySelectorAll('[id]')).some(
                  (target) => target.id === href.slice(1),
                ),
              ).to.equal(true);
          }
        }
      });
    }
  });

  it('updates skeleton rows, dimensions, spacing, shape and animation', () => {
    cy.get('[data-testid="skeleton"]').should('have.attr', 'aria-busy', 'true');
    cy.get('[data-testid="skeleton"] .sd-skeleton-line-row')
      .should('have.length', 3)
      .first()
      .should('have.css', 'width', '120px')
      .and('have.css', 'animation-name', 'sd-skeleton-circle');
    cy.get('[data-testid="skeleton"] .sd-skeleton-line-row')
      .eq(1)
      .should('have.css', 'width', '160px')
      .and('have.css', 'margin-top', '15px');
    cy.get('[data-testid="skeleton"] .sd-skeleton-shape')
      .should('have.class', 'sd-skeleton-shape-large')
      .and('have.css', 'border-radius', '50%');
    cy.contains('button', '更新骨架样式').click();
    cy.get('[data-testid="skeleton"]').should('not.have.class', 'sd-skeleton-animation');
    cy.get('[data-testid="skeleton"] .sd-skeleton-line-row')
      .should('have.length', 2)
      .first()
      .should('have.css', 'width', '0px')
      .and('have.css', 'height', '10px')
      .and('have.css', 'animation-name', 'none');
    cy.get('[data-testid="skeleton"] .sd-skeleton-line-row')
      .eq(1)
      .should('have.css', 'width', '100px')
      .and('have.css', 'margin-top', '0px');
    cy.get('[data-testid="skeleton"] .sd-skeleton-shape')
      .should('have.class', 'sd-skeleton-shape-small')
      .and('have.class', 'sd-skeleton-shape-square');
  });

  it('switches between skeleton placeholders and content without retaining inactive elements', () => {
    cy.get('[data-testid="skeleton"] button').should('not.exist');
    cy.contains('button', '切换骨架加载').click();
    cy.get('[data-testid="skeleton"]').should('not.have.attr', 'aria-busy');
    cy.get('[data-testid="skeleton"] .sd-skeleton-line').should('not.exist');
    cy.get('[data-testid="skeleton"] button').should('have.text', '真实内容');
    cy.contains('button', '切换骨架加载').click();
    cy.get('[data-testid="skeleton"] .sd-skeleton-line').should('exist');
    cy.get('[data-testid="skeleton"] button').should('not.exist');
  });

  it('moves card actions with nested Meta lifecycle and updates dynamic action content', () => {
    cy.get('[data-testid="card-meta"] .sd-card-actions').should('have.length', 1);
    cy.get('[data-testid="card-meta"] .sd-card-meta-footer .sd-card-actions-item').should(
      'have.length',
      2,
    );
    cy.contains('button', '卡片操作 0').click();
    cy.contains('button', '卡片操作 1').should('exist');
    cy.contains('button', '切换卡片详情').click();
    cy.get('[data-testid="card-meta"] .sd-card-body > .sd-card-actions').should('exist');
    cy.contains('button', '切换卡片详情').click();
    cy.get('[data-testid="card-meta"] .sd-card-body > .sd-card-actions').should('not.exist');
    cy.contains('button', '切换卡片操作').click();
    cy.get('[data-testid="card-meta"] .sd-card-actions').should('not.exist');
    cy.contains('button', '切换卡片操作').click();
    cy.get('[data-testid="card-meta"] .sd-card-meta-footer .sd-card-actions').should('exist');
  });

  it('tracks grids until the final child unmounts and resolves provider size and header changes', () => {
    cy.get('[data-testid="card-meta"]')
      .should('have.class', 'sd-card-size-small')
      .and('have.class', 'sd-card-hoverable');
    cy.get('[data-testid="card-grid"]')
      .should('have.class', 'sd-card-size-medium')
      .and('not.have.class', 'sd-card-bordered');
    cy.contains('button', '移除卡片网格').click();
    cy.get('[data-testid="card-grid"]')
      .should('have.class', 'sd-card-contain-grid')
      .find('.sd-card-grid-hoverable')
      .should('have.length', 1);
    cy.contains('button', '移除卡片网格').click();
    cy.get('[data-testid="card-grid"]').should('not.have.class', 'sd-card-contain-grid');
    cy.contains('button', '切换卡片标题').click();
    cy.get('[data-testid="card-meta"] .sd-card-header')
      .should('have.class', 'sd-card-header-no-title')
      .and('have.css', 'color', 'rgb(255, 0, 0)');
  });

  it('replaces card content during loading and merges provider and local Spin options', () => {
    cy.get('[data-testid="card-local-spin"] .sd-spin-tip').should('have.text', '局部卡片加载');
    cy.contains('button', '切换卡片加载').click();
    cy.get('[data-testid="card-meta"] .sd-spin-tip').should('have.text', '全局卡片加载');
    cy.get('[data-testid="card-meta"] .sd-card-meta').should('not.exist');
    cy.get('[data-testid="card-meta"] .sd-card-body > .sd-card-actions').should('exist');
    cy.contains('button', '切换卡片加载').click();
    cy.get('[data-testid="card-meta"] .sd-card-meta').should('exist');
    cy.get('[data-testid="card-meta"] .sd-card-actions').should('have.length', 1);
  });

  it('scrolls full-height cards with custom and native viewports', () => {
    cy.get('[data-testid="card-scroll"]').should('have.css', 'height', '180px');
    cy.get('[data-testid="card-scroll"] .sd-card-body-scrollbar [data-overlayscrollbars-viewport]')
      .scrollTo('bottom')
      .should(($node) => expect($node[0].scrollTop).to.be.greaterThan(0));
    cy.contains('button', '切换卡片滚动').click();
    cy.get('[data-testid="card-scroll"] .sd-card-body-native')
      .should('have.css', 'overflow', 'auto')
      .scrollTo('bottom')
      .should(($node) => expect($node[0].scrollTop).to.be.greaterThan(0));
    cy.get('[data-testid="card-scroll"] .sd-card-body-scrollbar').should('not.exist');
  });

  it('renders alert variants and action content with shared styles', () => {
    cy.get('[data-testid="alert-basic"]')
      .should('have.class', 'sd-alert-with-title')
      .find('.sd-alert-icon svg')
      .should('exist');
    cy.get('[data-testid="alert-banner"]')
      .should('have.class', 'sd-alert-warning')
      .and('have.class', 'sd-alert-center')
      .and('have.css', 'border-radius', '0px');
    cy.get('[data-testid="alert-normal"] .sd-alert-icon').should('not.exist');
    cy.get('[data-testid="alert-no-icon"] .sd-alert-icon').should('not.exist');
    cy.get('[data-testid="alert-custom"] .sd-alert-icon').should('have.text', '自定义图标');
    cy.contains('button', '通知操作').click();
    cy.get('[data-testid="alert-events"]').should('have.text', 'action');
  });

  it('emits close before afterClose and removes the alert after its leave animation', () => {
    cy.get('[data-testid="alert-basic"] [role="button"]').click();
    cy.get('[data-testid="alert-events"]').should('have.text', 'click,');
    cy.get('[data-testid="alert-basic"]').should('have.class', 'zoom-in-top-leave-active');
    cy.get('[data-testid="alert-basic"]').should('not.exist');
    cy.get('[data-testid="alert-events"]').should('have.text', 'click,after,');
  });

  it('supports Enter and Space close activation with custom and localized labels', () => {
    cy.get('[data-testid="alert-custom"] [role="button"]')
      .should('have.text', '隐藏通知')
      .focus()
      .trigger('keydown', { key: 'Enter' });
    cy.get('[data-testid="alert-custom"]').should('not.exist');
    cy.get('[data-testid="alert-en"] [role="button"]')
      .should('have.attr', 'aria-label', 'Close')
      .focus()
      .trigger('keydown', { key: ' ' });
    cy.get('[data-testid="alert-en"]').should('not.exist');
  });

  it('cancels afterClose when the parent unmounts an alert during close', () => {
    cy.get('[data-testid="alert-unmount"] [role="button"]').click();
    cy.get('[data-testid="alert-unmount"]').should('not.exist');
    cy.get('[data-testid="alert-basic"] [role="button"]').click();
    cy.get('[data-testid="alert-events"]').should('have.text', 'click,after,');
  });

  it('invalidates pending confirmation when its component is unmounted', () => {
    cy.contains('button', '异步确认').click();
    cy.contains('.sd-popconfirm-footer button', '确定').click();
    cy.contains('.sd-popconfirm-footer button', '确定').should('have.class', 'sd-btn-loading');
    cy.contains('button', '卸载异步确认').click();
    cy.get('.sd-popconfirm').should('not.exist');
    cy.contains('button', '解决迟到结果').click();
    cy.get('[data-testid="confirm-ok"]').should('have.text', '0');
  });

  it('confirms and cancels popconfirm actions with localized labels and status icons', () => {
    cy.contains('button', '基本确认').click();
    cy.get('.sd-popconfirm[role="dialog"]').should('be.visible');
    cy.get('.sd-popconfirm .sd-icon-exclamation-circle-fill').should('exist');
    cy.contains('.sd-popconfirm-footer button', '取消').click();
    cy.get('[data-testid="confirm-cancel"]').should('have.text', '1');
    cy.get('.sd-popconfirm').should('not.exist');
    cy.contains('button', '基本确认').click();
    cy.contains('.sd-popconfirm-footer button', '确定').click();
    cy.get('[data-testid="confirm-ok"]').should('have.text', '1');
    cy.get('.sd-popconfirm').should('not.exist');
  });

  it('runs async confirmation once, recovers from rejection and closes after success', () => {
    cy.contains('button', '异步确认').click();
    cy.contains('.sd-popconfirm-footer button', '确定').then(($button) => {
      $button[0].click();
      $button[0].click();
    });
    cy.get('[data-testid="confirm-calls"]').should('have.text', '1');
    cy.contains('.sd-popconfirm-footer button', '确定').should('have.class', 'sd-btn-loading');
    cy.contains('button', '拒绝异步确认').click();
    cy.contains('.sd-popconfirm-footer button', '确定')
      .should('not.have.class', 'sd-btn-loading')
      .click();
    cy.get('[data-testid="confirm-calls"]').should('have.text', '2');
    cy.contains('button', '完成异步确认').click();
    cy.get('[data-testid="confirm-ok"]').should('have.text', '1');
    cy.get('.sd-popconfirm').should('not.exist');
  });

  it('discards late async confirmation after cancellation', () => {
    cy.contains('button', '异步确认').click();
    cy.contains('.sd-popconfirm-footer button', '确定').click();
    cy.contains('.sd-popconfirm-footer button', '确定').should('have.class', 'sd-btn-loading');
    cy.contains('.sd-popconfirm-footer button', '取消').click();
    cy.contains('button', '解决迟到结果').click();
    cy.get('[data-testid="confirm-ok"]').should('have.text', '0');
    cy.contains('button', '异步确认').click();
    cy.contains('.sd-popconfirm-footer button', '确定').should('not.have.class', 'sd-btn-loading');
  });

  it('honors confirmation vetoes and callback-style completion', () => {
    cy.contains('button', '拦截确认与取消').click();
    cy.contains('.sd-popconfirm-footer button', '确定').click();
    cy.get('.sd-popconfirm').should('be.visible');
    cy.contains('.sd-popconfirm-footer button', '取消').click();
    cy.get('.sd-popconfirm').should('be.visible');
    cy.document().trigger('keydown', { key: 'Escape' });
    cy.get('.sd-popconfirm').should('not.exist');
    cy.contains('button', '回调式确认').click();
    cy.contains('.sd-popconfirm-footer button', '确定').click();
    cy.contains('.sd-popconfirm-footer button', '确定').should('have.class', 'sd-btn-loading');
    cy.contains('button', '完成回调确认').click();
    cy.get('[data-testid="confirm-ok"]').should('have.text', '1');
    cy.get('.sd-popconfirm').should('not.exist');
  });

  it('keeps controlled confirmation visible until writeback and inherits provider language', () => {
    cy.contains('button', '挂载受控确认').click();
    cy.contains('.sd-popconfirm-footer button', 'Ok').click();
    cy.get('[data-testid="confirm-ok"]').should('have.text', '1');
    cy.get('[data-testid="confirm-requests"]').should('have.text', '1');
    cy.get('.sd-popconfirm').should('be.visible');
    cy.contains('.sd-popconfirm-footer button', 'Cancel').should('be.visible');
  });
});

export {};
