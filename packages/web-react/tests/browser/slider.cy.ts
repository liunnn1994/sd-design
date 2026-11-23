describe('React slider', () => {
  beforeEach(() => cy.visit('/form-controls.html'));

  it('steps Slider from displayed values, preserves decimal bounds and validates changes', () => {
    cy.get('[data-testid="single-slider"] [role="slider"]').trigger('keydown', { key: 'Home' });
    cy.get('[data-testid="slider-value"]').should('have.text', '0');
    cy.contains('Amount too low').should('be.visible');
    cy.get('[data-testid="single-slider"] [role="slider"]').trigger('keydown', { key: 'End' });
    cy.get('[data-testid="slider-value"]').should('have.text', '95');
    cy.contains('Amount too low').should('not.exist');
    cy.get('[data-testid="locked-slider"] [role="slider"]')
      .trigger('keydown', { key: 'ArrowRight' })
      .trigger('keydown', { key: 'ArrowRight' });
    cy.get('[data-testid="slider-events"]').should('contain.text', 'locked:30|locked:30');
    cy.get('[data-testid="locked-slider"] [role="slider"]').should(
      'have.attr',
      'aria-valuenow',
      '20',
    );
    cy.get('[data-testid="decimal-slider"] [role="slider"]')
      .first()
      .trigger('keydown', { key: 'End' });
    cy.get('[data-testid="decimal-slider"] [role="slider"]')
      .first()
      .should('have.attr', 'aria-valuenow', '0.1');
  });

  it('moves the nearest Slider endpoint and sorts crossing numeric inputs', () => {
    cy.get('[data-testid="range-slider"] .sd-slider-track').then(($track) => {
      const rect = $track[0].getBoundingClientRect();
      cy.wrap($track).trigger('click', {
        clientX: rect.left + rect.width * 0.1,
        clientY: rect.top + rect.height / 2,
      });
    });
    cy.get('[data-testid="slider-range"]').should('have.text', '[10,60]');
    cy.get('[data-testid="range-slider"] input').first().clear().type('80').blur();
    cy.get('[data-testid="slider-range"]').should('have.text', '[60,80]');
    cy.get('[data-testid="range-slider"] input').last().clear().type('20').blur();
    cy.get('[data-testid="slider-range"]').should('have.text', '[20,60]');
  });

  it('keeps both controlled handles stable until the parent replaces the range', () => {
    const handles = '[data-testid="locked-range-slider"] [role="slider"]';
    cy.get(handles).should('have.length', 2).first().focus().type('{rightarrow}');
    cy.get(handles).last().focus().type('{rightarrow}');
    cy.get('[data-testid="slider-events"]').should(
      'have.text',
      'locked-range:[30,60]|locked-range:[20,70]',
    );
    cy.get(handles).first().should('have.attr', 'aria-valuenow', '20');
    cy.get(handles).last().should('have.attr', 'aria-valuenow', '60');
    cy.contains('button', 'Replace controlled slider range').click();
    cy.get(handles).first().should('have.attr', 'aria-valuenow', '40');
    cy.get(handles).last().should('have.attr', 'aria-valuenow', '80');
  });

  it('drags Slider with a live tooltip and stops listeners on disable and unmount', () => {
    cy.get('[data-testid="single-slider"] [role="slider"]').trigger('mousedown');
    cy.get('[data-testid="single-slider"] .sd-slider-track').then(($track) => {
      const rect = $track[0].getBoundingClientRect();
      cy.window().then((win) =>
        win.dispatchEvent(
          new MouseEvent('mousemove', {
            clientX: rect.left + rect.width * 0.53,
            clientY: rect.top,
          }),
        ),
      );
    });
    cy.get('[data-testid="slider-value"]').should('have.text', '50');
    cy.contains('.sd-tooltip-content', '50 percent').should('be.visible');
    cy.get('[data-testid="single-slider"] [role="slider"]').should(
      'have.attr',
      'aria-valuetext',
      '50 percent',
    );
    cy.contains('button', 'Toggle slider disabled').trigger('click');
    cy.get('[data-testid="single-slider"] [role="slider"]').should('have.attr', 'tabindex', '-1');
    cy.window().then((win) =>
      win.dispatchEvent(new MouseEvent('mousemove', { clientX: 9999, clientY: 0 })),
    );
    cy.get('[data-testid="slider-value"]').should('have.text', '50');
    cy.contains('button', 'Toggle slider disabled').trigger('click');
    cy.get('[data-testid="single-slider"] [role="slider"]').trigger('mousedown');
    cy.contains('button', 'Toggle slider mount').trigger('click');
    cy.window().then((win) =>
      win.dispatchEvent(new MouseEvent('mousemove', { clientX: 9999, clientY: 0 })),
    );
    cy.get('[data-testid="slider-events"]').should('have.text', 'single:50');
  });

  it('cancels native scrolling for Slider touch drag and cleans up cancelled gestures', () => {
    cy.get('[data-testid="single-slider"] [role="slider"]').then(($handle) => {
      const event = new Event('touchstart', { bubbles: true, cancelable: true });
      $handle[0].dispatchEvent(event);
      expect(event.defaultPrevented).to.equal(true);
    });
    cy.get('[data-testid="single-slider"] .sd-slider-track').then(($track) => {
      const rect = $track[0].getBoundingClientRect();
      cy.window().then((win) => {
        const event = new Event('touchmove');
        Object.defineProperty(event, 'touches', {
          value: [{ clientX: rect.right, clientY: rect.top }],
        });
        win.dispatchEvent(event);
        win.dispatchEvent(new Event('touchcancel'));
      });
    });
    cy.get('[data-testid="slider-value"]').should('have.text', '95');
    cy.window().then((win) =>
      win.dispatchEvent(new MouseEvent('mousemove', { clientX: 0, clientY: 0 })),
    );
    cy.get('[data-testid="slider-value"]').should('have.text', '95');
  });

  it('renders Slider ticks and marks and maps negative vertical coordinates', () => {
    cy.get('[data-testid="single-slider"] .sd-slider-tick').should('have.length', 9);
    cy.get('[data-testid="single-slider"] .sd-slider-mark').should('have.length', 3);
    cy.get('[data-testid="negative-slider"] .sd-slider-bar').should(([$bar]) => {
      expect($bar.style.left).to.equal('0%');
      expect($bar.style.right).to.equal('75%');
    });
    cy.get('[data-testid="negative-slider"] .sd-slider-dot').should(
      'have.class',
      'sd-slider-dot-active',
    );
    cy.get('[data-testid="vertical-slider"] .sd-slider-track')
      .scrollIntoView()
      .then(($track) => {
        const rect = $track[0].getBoundingClientRect();
        cy.wrap($track).trigger('click', {
          clientX: rect.left,
          clientY: rect.top + rect.height * 0.25,
        });
      });
    cy.get('[data-testid="vertical-slider"] [role="slider"]').should(
      'have.attr',
      'aria-valuenow',
      '30',
    );
    cy.get('[data-testid="vertical-slider"] .sd-slider-bar').should('have.css', 'bottom', '0px');
    cy.get('[data-testid="silent-slider"] [role="slider"]').trigger('mousedown');
    cy.get('.sd-tooltip-content').should('not.exist');
    cy.window().then((win) => win.dispatchEvent(new MouseEvent('mouseup')));
  });
});
