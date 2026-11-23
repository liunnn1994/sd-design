describe('React Layout', () => {
  beforeEach(() => cy.visit('/layout.html'));

  it('registers wrapped siders with the nearest layout and removes them dynamically', () => {
    cy.get('[data-testid="outer-layout"]').should('not.have.class', 'sd-layout-has-sider');
    cy.get('[data-testid="inner-layout"]').should('have.class', 'sd-layout-has-sider');
    cy.contains('button', '切换包装侧栏').click();
    cy.get('[data-testid="inner-layout"]').should('not.have.class', 'sd-layout-has-sider');
    cy.contains('button', '切换包装侧栏').click();
    cy.get('[data-testid="inner-layout"]').should('have.class', 'sd-layout-has-sider');
  });

  it('renders semantic regions and honors explicit hasSider, width and theme over context', () => {
    const layout = () => cy.get('[data-testid="override-layout"]');
    cy.get('[data-testid="outer-layout"]').children('header').should('have.text', '页头');
    cy.get('[data-testid="inner-layout"]').children('main').should('have.text', '内容');
    cy.get('[data-testid="outer-layout"]').children('footer').should('have.text', '页尾');
    layout().should('have.class', 'sd-layout-rtl').and('have.class', 'sd-layout-has-sider');
    cy.get('[data-testid="explicit-sider"]')
      .should('have.class', 'sd-layout-sider-light')
      .and('have.css', 'width', '150px');
    cy.contains('button', 'Cycle sider override').click();
    layout().should('not.have.class', 'sd-layout-has-sider');
    cy.get('[data-testid="explicit-sider"]').should('exist');
    cy.contains('button', 'Cycle sider override').click();
    layout().should('have.class', 'sd-layout-has-sider');
    cy.get('[data-testid="explicit-sider"]').should('not.exist');
  });

  it('retains the last accepted collapse state when the parent releases control', () => {
    const sider = () => cy.get('[data-testid="writeback-sider"]');
    const trigger = () => sider().find('[role="button"]');
    trigger().should('have.attr', 'aria-expanded', 'false');
    trigger().click();
    cy.get('[data-testid="layout-events"]').should('have.text', 'false:clickTrigger');
    sider().should('have.css', 'width', '32px');
    cy.contains('button', 'Accept collapse requests').click();
    trigger().click();
    sider().should('have.css', 'width', '200px');
    cy.contains('button', 'Release collapse control').click();
    trigger().should('have.attr', 'aria-expanded', 'true');
    trigger().focus().type('{enter}');
    sider().should('have.css', 'width', '32px');
    trigger().should('have.attr', 'aria-expanded', 'false');
  });

  it('renders a styled custom zero-width trigger and responds to hideTrigger', () => {
    const trigger = () => cy.get('[data-testid="custom-sider"] [role="button"]');
    trigger()
      .should('contain.text', 'Custom control')
      .and('have.css', 'background-color', 'rgb(24, 48, 72)');
    cy.contains('button', 'Toggle custom trigger').click();
    trigger().should('not.exist');
    cy.contains('button', 'Toggle custom trigger').click();
    trigger().should('have.attr', 'aria-expanded', 'false');
    trigger().focus().type('{enter}');
    trigger().should('have.attr', 'aria-expanded', 'true');
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
});
