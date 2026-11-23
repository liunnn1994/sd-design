describe('React switch', () => {
  beforeEach(() => cy.visit('/switch.html'));

  it('keeps defaultChecked after mount and changes on click', () => {
    cy.get('[aria-label="默认开启"]')
      .should('have.attr', 'aria-checked', 'true')
      .click()
      .should('have.attr', 'aria-checked', 'false');
  });

  it('keeps numeric zero text in the styled slots when switching states', () => {
    cy.visit('/switch.html?zero-switch-text');
    const root = () => cy.get('[aria-label="默认开启"]');
    root().find('.sd-switch-text').should('have.text', '0');
    root().find('.sd-switch-text-holder').should('have.text', '0');
    root().click().should('have.attr', 'aria-checked', 'false');
    root().find('.sd-switch-text').should('have.text', '0');
    root().find('.sd-switch-text-holder').should('have.text', '0');
  });

  it('commits controlled changes only when the parent writes back', () => {
    cy.get('[aria-label="受控"]').click();
    cy.get('[aria-label="受控"]').should('have.attr', 'aria-checked', 'true');
    cy.get('[aria-label="锁定受控"]').click();
    cy.get('[aria-label="锁定受控"]').should('have.attr', 'aria-checked', 'false');
    cy.get('[data-testid="changes"]').should('have.text', '1');
  });

  it('shows pending validation and commits exactly once', () => {
    cy.get('[aria-label="异步校验"]').click().should('have.attr', 'aria-busy', 'true');
    cy.get('[aria-label="异步校验"]')
      .should('have.attr', 'aria-checked', 'true')
      .should('not.have.attr', 'aria-busy');
    cy.get('[data-testid="changes"]').should('have.text', '1');
  });

  it('blocks vetoed and disabled transitions', () => {
    cy.get('[aria-label="拒绝切换"]').click().should('have.attr', 'aria-checked', 'false');
    cy.get('[aria-label="禁用"]')
      .should('be.disabled')
      .should('have.attr', 'aria-checked', 'false');
  });

  it('keeps the controlled value while auto loading and clears loading after writeback', () => {
    cy.get('[aria-label="自动加载"]')
      .click()
      .should('have.attr', 'aria-busy', 'true')
      .should('have.attr', 'aria-checked', 'false');
    cy.get('[aria-label="自动加载"]')
      .should('have.attr', 'aria-checked', 'true')
      .should('not.have.attr', 'aria-busy');
  });

  it('blocks repeated synchronous clicks during validation and handles rejected promises', () => {
    cy.get('[aria-label="异步校验"]').then(($button) => {
      $button[0].click();
      $button[0].click();
    });
    cy.get('[aria-label="异步校验"]').should('have.attr', 'aria-checked', 'true');
    cy.get('[data-testid="changes"]').should('have.text', '1');
    cy.get('[aria-label="拒绝异步"]')
      .click()
      .should('have.attr', 'aria-checked', 'false')
      .should('not.have.attr', 'aria-busy');
  });

  it('publishes typed values and updates the line colors on keyboard activation', () => {
    const control = () => cy.get('[role="switch"][aria-label="Typed value"]');
    control().should('have.attr', 'aria-checked', 'false');
    control().should('have.css', '--custom-color', '#0000ff');
    control().should('have.class', 'sd-switch-custom-color').focus();
    control().should('be.focused');
    cy.press(Cypress.Keyboard.Keys.SPACE);
    control().should('have.attr', 'aria-checked', 'true');
    control().should('have.css', '--custom-color', '#ff0000');
    cy.get('[data-testid="typed-value"]').should('have.text', '0');
    cy.press(Cypress.Keyboard.Keys.SPACE);
    control().should('have.attr', 'aria-checked', 'false');
    cy.get('[data-testid="typed-value"]').should('have.text', '"off"');
  });

  it('switches between explicit and automatic loading ownership', () => {
    const control = () => cy.get('[role="switch"][aria-label="Loading ownership"]');
    control().click().should('not.have.attr', 'aria-busy');
    cy.contains('button', 'Toggle explicit loading').click();
    control().click().should('have.attr', 'aria-busy', 'true');
    control().should('have.attr', 'aria-checked', 'false');
    cy.contains('button', 'Toggle explicit loading').click();
    control().should('not.have.attr', 'aria-busy');
  });

  for (const action of ['disabled', 'mount']) {
    it(`ignores the pending switch result when ${action} changes and accepts a fresh request`, () => {
      const control = () => cy.get('[role="switch"][aria-label="Deferred switch"]');
      const toggle = () => cy.contains('button', `Toggle deferred ${action}`).click();
      const resolve = () => cy.contains('button', 'Resolve deferred switch').click();
      const changes = () => cy.get('[data-testid="changes"]');
      control().click().should('have.attr', 'aria-busy', 'true');
      toggle();
      resolve();
      if (action === 'disabled') {
        control().should('be.disabled').and('have.attr', 'aria-checked', 'false');
        control().should('not.have.attr', 'aria-busy');
      } else {
        control().should('not.exist');
      }
      changes().should('have.text', '0');

      toggle();
      control().should('have.attr', 'aria-checked', 'false').click();
      control().should('have.attr', 'aria-busy', 'true');
      resolve();
      control().should('have.attr', 'aria-checked', 'true');
      control().should('not.have.attr', 'aria-busy');
      changes().should('have.text', '1');
    });
  }
});
