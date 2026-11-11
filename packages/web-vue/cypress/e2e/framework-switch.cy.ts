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
});
