import { checkComponentDocs } from './docs-contract';

{
  const tourControl = (name = '') =>
    cy.get('[data-testid="tour-fixture"]').contains('button', name).click({ force: true });
  describe('React Tour', () => {
    beforeEach(() => cy.visit('/'));
    it('preserves done and destroy vetoes while unmount bypasses the exit hook', () => {
      tourControl('Tour veto');
      tourControl('Tour start');
      tourControl('Tour next');
      cy.get('.driver-popover-title').should('have.text', 'Second native');
      cy.get('.driver-popover-next-btn').click();
      cy.get('[data-testid="tour-events"]')
        .should('contain', 'done:veto')
        .and('not.contain', 'next:veto');
      cy.get('.driver-popover-close-btn').click();
      cy.get('[data-testid="tour-events"]').should('contain', 'destroy:veto');
      cy.get('.driver-popover').should('exist');
      tourControl('Tour mount');
      cy.get('.driver-popover, .driver-overlay').should('not.exist');
      cy.get('body').should('not.have.class', 'driver-active');
      cy.get('[data-testid="tour-events"]').should('contain', 'destroy:close');
    });
    it('delegates keyboard step navigation and escape cleanup to the native engine', () => {
      tourControl('Tour start');
      cy.get('[data-testid="tour-events"]').should('contain', 'highlight:0');
      cy.get('body').trigger('keyup', { force: true, key: 'ArrowRight', keyCode: 39 });
      cy.get('.driver-popover-title').should('have.text', 'Second native');
      cy.get('[data-testid="tour-events"]').should('contain', 'highlight:1');
      cy.get('body').trigger('keyup', { force: true, key: 'ArrowLeft', keyCode: 37 });
      cy.get('.driver-popover-title').should('have.text', 'First native');
      cy.get('body').trigger('keyup', { force: true, key: 'Escape', keyCode: 27 });
      cy.get('.driver-popover, .driver-overlay').should('not.exist');
      cy.get('[data-testid="tour-events"]').should('contain', 'destroy:escape');
    });

    it('switches custom regions while open and restores native content and buttons', () => {
      tourControl('Tour start');
      cy.get('.driver-popover-title').should('have.text', 'First native');
      tourControl('Tour custom');
      cy.get('.driver-popover-title').should('have.text', 'React title 0');
      cy.get('.driver-popover-description').should('not.contain', 'First description');
      tourControl('Tour footer');
      cy.get('.driver-popover-footer').should('contain', 'Custom next');
      cy.get('.driver-popover-footer .driver-popover-next-btn').should('not.exist');
      tourControl('Tour progress');
      tourControl('Tour footer');
      cy.get('[data-testid="tour-progress"]').should('have.text', 'Step 0');
      cy.get('.driver-popover-footer .driver-popover-next-btn').should('be.visible');
      tourControl('Tour progress');
      cy.get('.driver-popover-progress-text').should('not.be.visible');
      tourControl('Tour custom');
      cy.get('.driver-popover-title').should('have.text', 'First native');
      cy.get('.driver-popover-description').should('have.text', 'First description');
      cy.get('.driver-popover-next-btn').click();
      cy.get('.driver-popover-title').should('have.text', 'Second native');
      tourControl('Tour destroy');
    });

    it('preserves imperative steps through internal popover renders', () => {
      tourControl('Tour imperative');
      cy.get('.driver-popover-title').should('have.text', 'Imperative first');
      cy.get('.driver-popover-next-btn').click();
      cy.get('.driver-popover-title').should('have.text', 'Imperative second');
      cy.get('.driver-popover-close-btn').click();
    });
    it('exposes the native driver and preserves navigation, hooks and destroy reasons', () => {
      tourControl('Tour read');
      cy.get('[data-testid="tour-events"]').should(
        'contain',
        'state:false:undefined:true:function',
      );
      tourControl('Tour start');
      cy.get('.driver-popover-title').should('have.text', 'First native');
      cy.get('[data-testid="tour-events"]')
        .should('contain', 'step:render')
        .and('not.contain', 'global:render');
      cy.get('.driver-popover-next-btn').click();
      cy.get('.driver-popover-title').should('have.text', 'Second native');
      cy.get('[data-testid="tour-events"]').should('contain', 'global:render');
      cy.get('.driver-popover-prev-btn').click();
      cy.get('.driver-popover-title').should('have.text', 'First native');
      cy.get('.driver-popover-close-btn').click();
      cy.get('.driver-popover').should('not.exist');
      cy.get('[data-testid="tour-events"]').should('contain', 'destroy:close');
    });
    it('keeps portal child state, context and input content across step replacement', () => {
      tourControl('Tour custom');
      tourControl('Tour footer');
      tourControl('Tour start');
      cy.get('[data-testid="tour-title"]').should('have.text', 'React title 0');
      cy.get('[data-testid="tour-slot"] > span').should('have.text', 'parent:initial:0');
      cy.contains('.driver-popover button', 'Slot count').click();
      cy.get('input[aria-label="Tour note"]').type('preserved');
      cy.contains('.driver-popover button', 'Custom next').click();
      cy.get('[data-testid="tour-title"]').should('have.text', 'React title 1');
      cy.get('[data-testid="tour-slot"] > span').should('have.text', 'parent:initial:1');
      cy.get('input[aria-label="Tour note"]').should('have.value', 'preserved');
      tourControl('Tour text');
      cy.get('[data-testid="tour-slot"] > span').should('have.text', 'parent:updated:1');
      tourControl('Tour destroy');
      cy.get('.driver-popover, [data-testid="tour-slot"]').should('not.exist');
      tourControl('Tour highlight');
      cy.get('[data-testid="tour-title"]').should('have.text', 'React title undefined');
      cy.get('[data-testid="tour-slot"] > span').should('have.text', 'parent:updated:0');
      tourControl('Tour mount');
      cy.get('.driver-popover, .driver-overlay').should('not.exist');
      cy.get('body').should('not.have.class', 'driver-active');
    });
    it('uses progress content while preserving native hooks and explicit false config', () => {
      tourControl('Tour progress');
      tourControl('Tour allow close');
      tourControl('Tour veto');
      tourControl('Tour start');
      cy.get('[data-testid="tour-progress"]').should('be.visible').and('have.text', 'Step 0');
      cy.get('.driver-popover-next-btn').click();
      cy.get('[data-testid="tour-events"]').should('contain', 'next:veto');
      cy.get('.driver-popover-title').should('have.text', 'First native');
      cy.get('body').trigger('keyup', { force: true, key: 'Escape', keyCode: 27 });
      cy.get('.driver-popover').should('exist');
      tourControl('Tour button text');
      tourControl('Tour next');
      cy.get('[data-testid="tour-progress"]').should('have.text', 'Step 1');
      tourControl('Tour read');
      cy.get('[data-testid="tour-events"]').should('contain', 'state:true:1:false:function');
      tourControl('Tour destroy');
      cy.get('.driver-popover').should('not.exist');
    });
    it('renders portals within a modal dialog and cleans up on destroy', () => {
      tourControl('Tour custom');
      tourControl('Tour dialog');
      cy.get('dialog .driver-popover-title').should('contain', 'React title 0');
      cy.get('dialog [data-testid="tour-slot"]').should('exist');
      tourControl('Tour close dialog');
      cy.get('.driver-popover').should('not.exist');
      cy.get('dialog').should('not.have.attr', 'open');
    });
    it('remeasures popover placement after custom content changes height', () => {
      tourControl('Tour custom');
      tourControl('Tour highlight');
      cy.get('[data-testid="tour-slot"]').should('have.css', 'height', '70px');
      cy.get('.driver-popover').then(($popover) => {
        const top = $popover[0].getBoundingClientRect().top;
        tourControl('Tour height');
        cy.get('.driver-popover').should(($next) =>
          expect($next[0].getBoundingClientRect().top).to.be.lessThan(top - 20),
        );
      });
      tourControl('Tour mount');
      cy.get('.driver-popover, .driver-overlay').should('not.exist');
    });
  });
}

describe('React Tour documentation', () => {
  it('documents shared tour scenes and framework navigation', () => checkComponentDocs('tour'));
});
