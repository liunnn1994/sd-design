import Slider from '../index';

describe('Slider', () => {
  it('renders a draggable handle', () => {
    cy.mount(Slider);
    cy.get('.sd-slider-btn').should('exist');
  });
});
