describe('PanelGroup documentation', () => {
  it('aligns the PanelGroup demo frame and restores its size after canceling a drag', () => {
    cy.visit('/components/panel-group/');
    cy.get('[data-example="panel-group/basic"]')
      .scrollIntoView()
      .find('.demo-block__preview-content > astro-island:not([ssr])', { timeout: 20000 })
      .find('.single-panel-demo')
      .should(($demo) => {
        const demo = $demo[0];
        const content = demo.querySelector('.single-panel-demo-content')!;
        const line = '.sd-resizebox-trigger-icon-wrapper';
        const rightGrip = demo.querySelector(`.sd-resizebox-trigger-vertical > ${line}`)!;
        const bottomGrip = demo.querySelector(`.sd-resizebox-trigger-horizontal > ${line}`)!;
        const bounds = content.getBoundingClientRect();
        expect(Cypress.$(content)).to.have.css('border-right-color', 'rgba(0, 0, 0, 0)');
        expect(Cypress.$(content)).to.have.css('border-bottom-color', 'rgba(0, 0, 0, 0)');
        expect(rightGrip.getBoundingClientRect().right).to.equal(bounds.right);
        expect(bottomGrip.getBoundingClientRect().bottom).to.equal(bounds.bottom);
      });
    cy.get('[data-example="panel-group/basic"] .single-panel-demo > .sd-panel-group > .sd-panel')
      .as('widthPanel')
      .should('have.css', 'width', '500px');
    cy.get('@widthPanel')
      .children('.sd-panel-separator-edge')
      .find('.sd-panel-separator-grip')
      .then(($grip) => {
        const rect = $grip[0].getBoundingClientRect();
        const point = {
          clientX: rect.left + rect.width / 2,
          clientY: rect.top + rect.height / 2,
          pointerId: 1,
          button: 0,
        };
        cy.wrap($grip).trigger('pointerdown', point);
        cy.wrap($grip).trigger('pointermove', { ...point, clientX: point.clientX - 60 });
        cy.get('@widthPanel').should('have.css', 'width', '440px');
        cy.wrap($grip).trigger('pointercancel', point);
      });
    cy.get('@widthPanel').should('have.css', 'width', '500px');
  });
});
