describe('React virtual-list', () => {
  beforeEach(() => cy.visit('/virtual-list.html'));

  it('measures dynamic virtual rows and resolves function keys after changing size mode', () => {
    cy.contains('button', 'Virtual dynamic').click();
    cy.get('[data-testid="virtual-list-fixture"] li.virtual-row')
      .first()
      .should('have.css', 'height', '50px');
    cy.contains('button', 'Virtual jump key').click();
    cy.get('[data-virtual-index="90"]').should('be.visible').should('have.text', 'Row 90');
    cy.contains('button', 'Virtual inspect').click();
    cy.get('[data-testid="virtual-report"]')
      .invoke('text')
      .then((text) => {
        const report = JSON.parse(text);
        expect(report.size).to.equal(50);
        expect(report.dynamic).to.equal(50);
        expect(report.cache).to.equal(true);
      });
    cy.contains('button', 'Virtual dynamic').click();
    cy.contains('button', 'Virtual jump key').click();
    cy.get('[data-testid="virtual-list-fixture"] .sd-virtual-list-scroller').should(($el) =>
      expect($el[0].scrollTop).to.equal(2700),
    );
  });

  it('keeps clamp measurement stable beside synchronous virtualizer updates', () => {
    cy.visit('/virtual-list.html', {
      onBeforeLoad(win) {
        cy.stub(win.console, 'error').as('virtualConsoleErrors');
      },
    });
    cy.get('[data-testid="wrap"]').should('have.css', 'height', '48px');
    cy.contains('button', 'Virtual axis').click();
    cy.contains('button', '改变项目数量').click();
    cy.get('[data-testid="wrap"] [data-part="item"]').should('have.length', 2);
    cy.contains('button', 'Virtual axis').click();
    cy.contains('button', '改变项目数量').click();
    cy.get('[data-testid="wrap"]').should('have.css', 'height', '48px');
    cy.contains('button', 'Virtual jump key').click();
    cy.get('[data-virtual-index="90"]').should('be.visible');
    cy.get('@virtualConsoleErrors').should('not.have.been.called');
  });

  it('virtualizes selection rows and forwards live-key positioning and measurement commands', () => {
    const viewport = '[data-testid="virtual-list-fixture"] .sd-virtual-list-scroller';
    cy.get('[data-testid="virtual-list-fixture"] li.virtual-row').should(
      'have.length.lessThan',
      200,
    );
    cy.contains('button', 'Virtual jump key').click();
    cy.get(viewport).should(($el) => expect($el[0].scrollTop).to.equal(2700));
    cy.get('[data-virtual-index="90"]').should('be.visible').should('have.text', 'Row 90');
    cy.contains('button', 'Virtual inspect').click();
    cy.get('[data-testid="virtual-report"]').should(
      'have.text',
      '{"cache":true,"restored":false,"index":90,"offset":2700,"size":30,"dynamic":30}',
    );
    cy.contains('button', 'Virtual reverse').click();
    cy.contains('button', 'Virtual jump key').click();
    cy.get(viewport).should(($el) => expect($el[0].scrollTop).to.equal(3270));
    cy.get('[data-virtual-index="109"]').should('have.text', 'Row 90').should('be.visible');
  });

  it('rebuilds virtual rows on axis changes and updates scrollbar and container styles', () => {
    const viewport = '[data-testid="virtual-list-fixture"] .sd-virtual-list-scroller';
    cy.contains('button', 'Virtual pixels').click();
    cy.get(viewport).should(($el) => expect($el[0].scrollTop).to.equal(180));
    cy.contains('button', 'Virtual axis').click();
    cy.get(viewport).should(($el) => expect($el[0].scrollWidth).to.be.greaterThan(180));
    cy.contains('button', 'Virtual pixels').click();
    cy.get(viewport).should(($el) => expect($el[0].scrollLeft).to.equal(180));
    cy.get('[data-testid="virtual-list-fixture"] li.virtual-row')
      .first()
      .should('have.css', 'width', '30px')
      .should('have.css', 'min-width', '20px');
    cy.contains('button', 'Virtual track').click();
    cy.get('[data-testid="virtual-list-fixture"] .sd-scrollbar-type-track ul.track-list').should(
      'have.attr',
      'aria-label',
      'Virtual rows',
    );
    cy.get('[data-testid="virtual-list-fixture"] .os-scrollbar').should(
      'have.class',
      'sd-scrollbar-theme-track',
    );
  });

  it('reports virtual scrolling boundaries, replaces empty rows and releases unmounted listeners', () => {
    cy.contains('button', 'Virtual pixels').click();
    cy.get('[data-testid="virtual-events"]')
      .should('contain.text', 'end')
      .should('not.contain.text', 'bottom');
    cy.contains('button', 'Virtual bottom').click();
    cy.get('[data-testid="virtual-events"]').should('contain.text', 'bottom');
    cy.contains('button', 'Virtual empty').click();
    cy.get('[data-testid="virtual-list-fixture"] ul').should('not.exist');
    cy.contains('[data-testid="virtual-list-fixture"]', 'No virtual items').should('be.visible');
    cy.contains('button', 'Virtual empty').click();
    cy.get('[data-testid="virtual-list-fixture"] ul').should('exist');
    cy.get('[data-testid="virtual-list-fixture"] .sd-virtual-list-scroller').then(($el) => {
      const node = $el[0];
      cy.contains('button', 'Virtual mount').click();
      cy.get('[data-testid="virtual-events"]')
        .invoke('text')
        .then((before) => {
          node.dispatchEvent(new Event('scroll'));
          cy.get('[data-testid="virtual-events"]').should('have.text', before);
        });
    });
    cy.get('[data-testid="virtual-list-fixture"] .os-scrollbar').should('not.exist');
    cy.contains('button', 'Virtual mount').click();
    cy.contains('button', 'Virtual jump key').click();
    cy.get('[data-virtual-index="90"]').should('be.visible');
  });
});
