import Slider from '../index';

describe('Slider styles', () => {
  it('enlarges the active handle to the configured width', () => {
    cy.mount(Slider);
    cy.get('.sd-slider-btn').then(($button) => $button.addClass('sd-slider-btn-active'));
    cy.get('.sd-slider-btn').should(($button) => {
      const win = $button[0].ownerDocument.defaultView!;
      const transform = win.getComputedStyle($button[0], '::after').transform;
      expect(new win.DOMMatrixReadOnly(transform).a).to.be.closeTo(14 / 12, 0.001);
    });
  });
});
