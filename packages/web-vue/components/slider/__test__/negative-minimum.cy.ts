import Slider from '../index';

describe('Slider negative minimum', () => {
  for (const direction of ['horizontal', 'vertical'] as const) {
    it(`starts the uncontrolled ${direction} selection at the minimum`, () => {
      cy.mount(Slider, {
        props: {
          min: -100,
          max: 100,
          defaultValue: -50,
          direction,
          marks: { '-75': 'Selected mark' },
        },
      });

      cy.get('.sd-slider-bar').should(($bar) => {
        const { style } = $bar[0];
        expect(direction === 'horizontal' ? style.left : style.bottom).to.equal('0%');
        expect(direction === 'horizontal' ? style.right : style.top).to.equal('75%');
      });
      cy.get('.sd-slider-dot').should('have.class', 'sd-slider-dot-active');
    });
  }
});
