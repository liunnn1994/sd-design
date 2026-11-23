describe('React carousel', () => {
  beforeEach(() => cy.visit('/carousel.html'));

  it('navigates Carousel with arrows and keyboard while publishing 1-based ordered events', () => {
    cy.get('[data-testid="carousel-main"]').should('have.attr', 'data-ready', 'true');
    cy.clock();
    cy.get('[data-testid="carousel-main"]').should('have.attr', 'aria-roledescription', 'carousel');
    cy.get('[data-testid="carousel-main"] .sd-carousel-item-current')
      .should('have.attr', 'data-slide', '1')
      .and('have.attr', 'aria-hidden', 'false');
    cy.get('[data-testid="carousel-main"] .sd-carousel-arrow-right').click();
    cy.get('[data-testid="carousel-main"] .sd-carousel-item-current').should(
      'have.attr',
      'data-slide',
      '2',
    );
    cy.get('[data-testid="carousel-events"]').should('have.text', 'update:2|change:2:1:true');
    cy.tick(100);
    cy.get('[data-testid="carousel-main"]').trigger('keydown', { key: 'ArrowLeft' });
    cy.get('[data-testid="carousel-main"] .sd-carousel-item-current').should(
      'have.attr',
      'data-slide',
      '1',
    );
    cy.tick(100);
    cy.get('[aria-label="Carousel input 1"]').focus().trigger('keydown', { key: 'ArrowRight' });
    cy.get('[data-testid="carousel-main"] .sd-carousel-item-current').should(
      'have.attr',
      'data-slide',
      '1',
    );
  });

  it('keeps controlled Carousel visibility and reports the displayed previous index', () => {
    cy.contains('button', 'Carousel controlled third').click();
    cy.get('[data-testid="carousel-main"] .sd-carousel-item-current').should(
      'have.attr',
      'data-slide',
      '3',
    );
    cy.get('[data-testid="carousel-main"] .sd-carousel-arrow-right').click();
    cy.get('[data-testid="carousel-main"] .sd-carousel-item-current').should(
      'have.attr',
      'data-slide',
      '3',
    );
    cy.get('[data-testid="carousel-events"]').should('have.text', 'update:1|change:1:3:true');
    cy.contains('button', 'Carousel negative current').click();
    cy.get('[data-testid="carousel-main"] .sd-carousel-item-current').should(
      'have.attr',
      'data-slide',
      '2',
    );
    cy.contains('button', 'Carousel release').click();
    cy.get('[data-testid="carousel-main"] .sd-carousel-item-current').should(
      'have.attr',
      'data-slide',
      '2',
    );
  });

  it('normalizes Carousel imperative indexes and follows removal and reordered wrapped items', () => {
    cy.contains('button', 'Carousel go zero').click();
    cy.get('[data-testid="carousel-main"] .sd-carousel-item-current').should(
      'have.attr',
      'data-slide',
      '3',
    );
    cy.contains('button', 'Carousel remove').click();
    cy.get('[data-testid="carousel-main"] [data-carousel-item]').should('have.length', 2);
    cy.get('[data-testid="carousel-main"] .sd-carousel-item-current').should(
      'have.attr',
      'data-slide',
      '1',
    );
    cy.contains('button', 'Carousel reverse').click();
    cy.get('[data-testid="carousel-main"] .sd-carousel-item-current').should(
      'have.attr',
      'data-slide',
      '2',
    );
    cy.contains('button', 'Carousel remove').click();
    cy.get('[data-testid="carousel-main"] .sd-carousel-arrow').should('not.exist');
    cy.get('[data-testid="carousel-main"] .sd-carousel-indicator-wrapper').should('not.exist');
    cy.window().then((win) =>
      win.dispatchEvent(new CustomEvent('carousel-action', { detail: 'empty' })),
    );
    cy.get('[data-testid="carousel-main"] [data-carousel-item]').should('not.exist');
    cy.get('[data-testid="carousel-main"]').trigger('keydown', { key: 'ArrowRight' });
    cy.contains('button', 'Carousel add').click();
    cy.get('[data-testid="carousel-main"] .sd-carousel-item-current').should(
      'have.attr',
      'data-slide',
      '1',
    );
  });

  it('switches Carousel direction, fade/card styling and keyboard/hover indicators', () => {
    cy.contains('button', 'Carousel direction').click();
    cy.contains('button', 'Carousel animation').click();
    cy.get('[data-testid="carousel-main"] .sd-carousel-fade').should(
      'have.class',
      'sd-carousel-vertical',
    );
    cy.get('[data-testid="carousel-main"] .sd-carousel-arrow-top').should('exist');
    cy.get('[data-testid="carousel-main"] .custom-carousel-indicators').should(
      'have.class',
      'sd-carousel-indicator-right',
    );
    cy.get('[data-testid="carousel-main"] .sd-carousel-indicator-item')
      .eq(2)
      .trigger('keydown', { key: ' ' });
    cy.get('[data-testid="carousel-main"] .sd-carousel-item-current')
      .should('have.attr', 'data-slide', '3')
      .and('have.css', 'transition-duration', '0.1s');
    cy.contains('button', 'Carousel animation').click();
    cy.get('[data-testid="carousel-main"] .sd-carousel-card').should('exist');
    cy.contains('button', 'Carousel hover').click();
    cy.get('[data-testid="carousel-main"] .sd-carousel-arrow').should(
      'have.class',
      'sd-carousel-arrow-hover',
    );
    cy.get('[data-testid="carousel-main"] .sd-carousel-indicator-item').eq(0).trigger('mouseover');
    cy.get('[data-testid="carousel-main"] .sd-carousel-item-current').should(
      'have.attr',
      'data-slide',
      '1',
    );
  });

  it('selects Carousel slider track positions using the actual delegated current target', () => {
    cy.contains('button', 'Carousel indicator').click();
    cy.get('[data-testid="carousel-main"] .sd-carousel-indicator-line').should('exist');
    cy.contains('button', 'Carousel indicator').click();
    cy.get('[data-testid="carousel-main"] .sd-carousel-indicator-slider').click('right');
    cy.get('[data-testid="carousel-main"] .sd-carousel-item-current').should(
      'have.attr',
      'data-slide',
      '3',
    );
    cy.get('[data-testid="carousel-main"] .sd-carousel-indicator-item').then((element) =>
      expect(element[0].getBoundingClientRect().width).to.be.greaterThan(0),
    );
    cy.contains('button', 'Carousel indicator').click();
    cy.get('[data-testid="carousel-main"] .sd-carousel-indicator-wrapper').should('not.exist');
  });

  it('preserves the Carousel animation lock when autoplay reschedules', () => {
    cy.get('[data-testid="carousel-main"]').should('have.attr', 'data-ready', 'true');
    cy.clock();
    cy.window().then((win) =>
      win.dispatchEvent(new CustomEvent('carousel-action', { detail: 'autoplay' })),
    );
    cy.get('[data-testid="carousel-main"]').should('have.attr', 'data-auto-interval', '100');
    cy.tick(100);
    cy.get('[data-testid="carousel-main"] .sd-carousel-item-current').should(
      'have.attr',
      'data-slide',
      '2',
    );
    cy.get('[data-testid="carousel-events"]').should('have.text', 'update:2|change:2:1:false');
    cy.get('[data-testid="carousel-main"]').trigger('keydown', { key: 'ArrowRight' });
    cy.tick(100);
    cy.get('[data-testid="carousel-main"] .sd-carousel-item-current').should(
      'have.attr',
      'data-slide',
      '2',
    );
    cy.tick(100);
    cy.get('[data-testid="carousel-main"] .sd-carousel-item-current').should(
      'have.attr',
      'data-slide',
      '3',
    );
  });

  it('pauses Carousel on hover, resumes after a policy change and cancels timers on unmount', () => {
    cy.get('[data-testid="carousel-main"]').should('have.attr', 'data-ready', 'true');
    cy.clock();
    cy.window().then((win) =>
      win.dispatchEvent(new CustomEvent('carousel-action', { detail: 'pause-test' })),
    );
    cy.get('[data-testid="carousel-main"]').should('have.attr', 'data-auto-interval', '100');
    cy.get('[data-testid="carousel-main"]').trigger('mouseover');
    cy.get('[data-testid="carousel-main"]').should('have.attr', 'data-hovered', 'true');
    cy.tick(500);
    cy.get('[data-testid="carousel-main"] .sd-carousel-item-current').should(
      'have.attr',
      'data-slide',
      '1',
    );
    cy.window().then((win) =>
      win.dispatchEvent(new CustomEvent('carousel-action', { detail: 'hover-off' })),
    );
    cy.get('[data-testid="carousel-main"]').should('have.attr', 'data-hover-pause', 'false');
    cy.tick(100);
    cy.get('[data-testid="carousel-main"] .sd-carousel-item-current').should(
      'have.attr',
      'data-slide',
      '2',
    );
    cy.get('[data-testid="carousel-events"]').should('have.text', 'update:2|change:2:1:false');
    cy.window().then((win) =>
      win.dispatchEvent(new CustomEvent('carousel-action', { detail: 'unmount' })),
    );
    cy.get('[data-testid="carousel-main"]').should('not.exist');
    cy.get('[data-testid="carousel-events"]').should('have.text', 'update:2|change:2:1:false');
    cy.tick(1000);
    cy.get('[data-testid="carousel-events"]').should('have.text', 'update:2|change:2:1:false');
  });

  it('keeps Carousel indexes local across nested prefix changes and reordering', () => {
    cy.contains('button', /^Carousel nested$/).click();
    cy.contains('button', 'Carousel nested prefix').click();
    cy.get('[data-testid="carousel-nested"]').should('have.class', 'custom-carousel');
    cy.get('[data-testid="carousel-main"] [data-slide="2"]').should(
      'have.attr',
      'aria-label',
      '第 2 张,共 3 张',
    );
    cy.contains('button', 'Carousel ref next').click();
    cy.get('[data-testid="carousel-main"] > .sd-carousel-slide > .sd-carousel-item-current').should(
      'have.attr',
      'data-slide',
      '2',
    );
    cy.contains('button', 'Carousel reverse').click();
    cy.get('[data-testid="carousel-main"] [data-slide="3"]').should(
      'have.attr',
      'aria-label',
      '第 1 张,共 3 张',
    );
    cy.contains('button', 'Carousel nested prefix').click();
    cy.get('[data-testid="carousel-nested"]').should('have.class', 'sd-carousel');
    cy.get('[data-testid="carousel-main"] [data-slide="1"]').should(
      'have.attr',
      'aria-label',
      '第 3 张,共 3 张',
    );
  });

  it('isolates Carousel child registration in nested roots', () => {
    cy.contains('button', 'Carousel nested').click();
    cy.get(
      '[data-testid="carousel-main"] > .sd-carousel-indicator-wrapper .sd-carousel-indicator-item',
    ).should('have.length', 3);
    cy.get('[data-testid="carousel-nested"] .sd-carousel-indicator-item').should('have.length', 2);
    cy.get('[data-testid="carousel-nested"] .sd-carousel-arrow-right').click();
    cy.get('[data-testid="carousel-nested"] .sd-carousel-item-current').should(
      'have.text',
      'Nested B',
    );
    cy.get('[data-testid="carousel-main"] > .sd-carousel-slide > .sd-carousel-item-current').should(
      'have.attr',
      'data-slide',
      '1',
    );
    cy.get('[data-testid="carousel-events"]').should('have.text', '');
  });
});
