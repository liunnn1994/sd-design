describe('React alert', () => {
  beforeEach(() => cy.visit('/alert.html'));

  it('renders alert variants and action content with shared styles', () => {
    cy.get('[data-testid="alert-basic"]').should('have.attr', 'role', 'alert');
    cy.get('[data-testid="alert-basic"] .sd-alert-icon').should('have.attr', 'aria-hidden', 'true');
    cy.get('[data-testid="alert-basic"] .sd-alert-title').should('have.text', '通知标题');
    cy.get('[data-testid="alert-basic"] .sd-alert-content').should('have.text', '通知内容');
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
    cy.get(
      '[data-testid="alert-normal"] .sd-alert-action, [data-testid="alert-normal"] .sd-alert-close-btn',
    ).should('not.exist');
    cy.contains('.sd-alert-action button', '通知操作').click();
    cy.get('[data-testid="alert-events"]').should('have.text', 'action');
  });

  it('updates presentation and close controls while preserving the alert element', () => {
    cy.get('[data-testid="alert-basic"]').then(($alert) => {
      cy.get('[data-testid="alert-basic"] [role="button"]').should('have.attr', 'tabindex', '0');
      cy.get('[data-testid="alert-basic"] [role="button"]')
        .focus()
        .trigger('keydown', { key: 'Escape' });
      cy.get('[data-testid="alert-events"]').should('be.empty');
      cy.contains('button', '切换通知布局').click();
      cy.get('[data-testid="alert-basic"]').should(($node) => {
        expect($node[0]).to.equal($alert[0]);
        expect($node).to.have.class('sd-alert-normal');
        expect($node).not.to.have.class('sd-alert-with-title');
      });
      cy.get(
        '[data-testid="alert-basic"] .sd-alert-title, [data-testid="alert-basic"] .sd-alert-icon, [data-testid="alert-basic"] [role="button"]',
      ).should('not.exist');
      cy.get('[data-testid="alert-banner"]')
        .should('have.class', 'sd-alert-success')
        .and('not.have.class', 'sd-alert-banner')
        .and('not.have.class', 'sd-alert-center');
      cy.contains('button', '切换通知布局').click();
      cy.get('[data-testid="alert-basic"] .sd-alert-title').should('have.text', '通知标题');
      cy.get('[data-testid="alert-basic"] [role="button"]').should('be.visible');
    });
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
});
