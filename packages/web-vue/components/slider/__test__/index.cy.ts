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
