import Slider from '../index';

describe('Slider', () => {
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
