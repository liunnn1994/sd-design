describe('文档框架切换', () => {
  function waitForSwitch() {
    cy.get('astro-island:has(.framework-switch)').should('not.have.attr', 'ssr');
    cy.get('.framework-switch')
      .should('have.attr', 'role', 'radiogroup')
      .and('have.attr', 'aria-label', '文档框架')
      .and('have.class', 'sd-radio-group-button');
  }

  it('使用按钮式单选框双向切换，保留当前组件及最新锚点', () => {
    cy.visit('/components/divider/#api');
    waitForSwitch();
    cy.get('.framework-switch input[value="vue"]').should('be.checked');
    cy.contains('.framework-switch .sd-radio-button', 'React').click();
    cy.location('pathname').should('equal', '/react/components/divider/');
    cy.location('hash').should('equal', '#api');

    waitForSwitch();
    cy.get('.framework-switch input[value="react"]').should('be.checked');
    cy.window().then((win) => {
      win.location.hash = 'divider-属性';
    });
    cy.contains('.framework-switch .sd-radio-button', 'Vue').click();
    cy.location('pathname').should('equal', '/components/divider/');
    cy.location('hash').should('equal', `#${encodeURIComponent('divider-属性')}`);
    waitForSwitch();
    cy.get('.framework-switch input[value="vue"]').should('be.checked');
  });

  it('支持原生单选组方向键切换框架', () => {
    cy.visit('/components/divider/#api');
    waitForSwitch();
    cy.get('.framework-switch input[value="vue"]').focus();
    cy.press(Cypress.Keyboard.Keys.RIGHT);
    cy.location('pathname').should('equal', '/react/components/divider/');
    cy.location('hash').should('equal', '#api');
    waitForSwitch();
    cy.get('.framework-switch input[value="react"]').should('be.checked');
  });

  it('在缺少原生 Popover API 时可以开关窄屏侧栏', () => {
    cy.viewport(390, 844);
    cy.visit('/components/divider/', {
      onBeforeLoad(win) {
        for (const name of ['popover', 'showPopover', 'hidePopover', 'togglePopover']) {
          Reflect.deleteProperty(win.HTMLElement.prototype, name);
        }
      },
    });
    cy.window().its('HTMLElement.prototype.showPopover').should('be.a', 'function');
    cy.get('.sl-menu-button').click().should('have.attr', 'aria-expanded', 'true');
    cy.get('#starlight__sidebar').should('be.visible');
    cy.get('body').should('have.attr', 'data-sd-sidebar-open');
    cy.get('.sl-menu-button').click().should('have.attr', 'aria-expanded', 'false');
    cy.get('body').should('not.have.attr', 'data-sd-sidebar-open');
  });
});
