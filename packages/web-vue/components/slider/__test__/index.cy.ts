import Slider from '../index';

describe('Slider', () => {
  it('renders repeating-decimal percentages without precision boundary warnings', () => {
    cy.window().then((win) => {
      cy.spy(win.console, 'warn').as('consoleWarn');
    });
    cy.mount(Slider, {
      props: {
        min: 0,
        max: 3,
        modelValue: 2,
        marks: { 1: 'one', 2: 'two' },
      },
    });
    cy.get('.sd-slider-bar').should('have.attr', 'style').and('contain', 'right: 33.33%');
    cy.get('.sd-slider-dot-wrapper').eq(0).should('have.attr', 'style').and('contain', '33.33%');
    cy.get('.sd-slider-mark').eq(1).should('have.attr', 'style').and('contain', '66.67%');
    cy.get('@consoleWarn').should((consoleWarn) => {
      expect(consoleWarn).not.to.have.been.calledWithMatch(
        Cypress.sinon.match('is beyond boundary when transfer to integer'),
      );
    });
  });

  it('renders a draggable handle', () => {
    cy.mount(Slider);
    cy.get('.sd-slider-btn').should('exist');
  });

  it('keeps the tooltip anchored to the handle while dragging', () => {
    cy.mount(Slider, {
      props: { defaultValue: 20 },
      attrs: { style: 'width: 400px; margin: 100px;' },
    });

    cy.get('.sd-slider-track').then(($track) => {
      const trackRect = $track[0].getBoundingClientRect();
      cy.get('.sd-slider-btn').trigger('mousedown');
      cy.get('.sd-slider-btn').should('have.attr', 'aria-describedby');
      cy.window().then((win) => {
        win.dispatchEvent(
          new MouseEvent('mousemove', {
            clientX: trackRect.left + trackRect.width * 0.8,
            clientY: trackRect.top + trackRect.height / 2,
          }),
        );
      });
    });

    cy.get('[role="tooltip"]').should(($popup) => {
      expect($popup.is(':visible')).to.equal(true);
      expect($popup[0].parentElement).to.equal(document.body);
      expect($popup.find('.sd-tooltip-content')[0].style.translate).to.equal('');
      expect($popup.find('.sd-tooltip-popup-arrow')[0].style.translate).to.equal('');
      expect($popup.attr('style')).not.to.contain('left: 80%');
    });
    cy.get('.sd-slider-btn').then(($button) => {
      cy.get('[role="tooltip"]').should(($popup) => {
        const buttonRect = $button[0].getBoundingClientRect();
        const popupRect = $popup[0].getBoundingClientRect();
        expect(popupRect.left + popupRect.width / 2).to.be.closeTo(
          buttonRect.left + buttonRect.width / 2,
          1,
        );
      });
    });
  });

  it('handle has slider role with aria-value* and moves via arrow keys', () => {
    cy.mount(Slider, { props: { min: 0, max: 100, step: 10, modelValue: 20 } });
    cy.get('.sd-slider-btn').should('have.attr', 'role', 'slider');
    cy.get('.sd-slider-btn').should('have.attr', 'aria-valuemin', '0');
    cy.get('.sd-slider-btn').should('have.attr', 'aria-valuemax', '100');
    cy.get('.sd-slider-btn').should('have.attr', 'aria-valuenow', '20');
    // ArrowRight 按 step(10) 增加
    cy.get('.sd-slider-btn').trigger('keydown', { key: 'ArrowRight' });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[0]?.[0]).to.equal(30);
    });
  });
});
