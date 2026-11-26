import Palette from '../palette.vue';

const color = { hsv: { h: 0, s: 1, v: 1 }, rgb: { r: 255, g: 0, b: 0 }, hex: 'FF0000' };

describe('ColorPicker drag lifecycle', () => {
  it('removes active pointer listeners when the palette unmounts', () => {
    cy.mount(Palette, { props: { color }, attrs: { style: 'width: 200px; height: 100px' } });
    cy.get('@vue').then(({ wrapper }) => {
      const element = wrapper.element as HTMLElement;
      const add = cy.spy(element, 'addEventListener');
      const remove = cy.spy(element, 'removeEventListener');
      const rect = element.getBoundingClientRect();
      element.dispatchEvent(
        new PointerEvent('pointerdown', {
          isPrimary: true,
          buttons: 1,
          clientX: rect.x + 40,
          clientY: rect.y + 40,
        }),
      );
      wrapper.unmount();
      for (const type of ['pointermove', 'pointerup', 'pointercancel', 'lostpointercapture']) {
        const registration = add.getCalls().find((call) => call.args[0] === type);
        expect(registration, `${type} registered`).not.to.equal(undefined);
        expect(remove.calledWith(type, registration!.args[1]), `${type} removed`).to.equal(true);
      }
    });
  });

  it('cancels a queued color update when the palette unmounts', () => {
    const change = cy.spy().as('colorChange');
    cy.mount(Palette, {
      props: { color, onChange: change },
      attrs: { style: 'width: 200px; height: 100px' },
    });
    cy.get('@vue').then(({ wrapper }) => {
      const element = wrapper.element as HTMLElement;
      const rect = element.getBoundingClientRect();
      element.dispatchEvent(
        new PointerEvent('pointerdown', {
          isPrimary: true,
          buttons: 1,
          clientX: rect.x + 40,
          clientY: rect.y + 40,
        }),
      );
      wrapper.unmount();
      return Cypress.Promise.delay(100);
    });
    cy.get('@colorChange').should('not.have.been.called');
  });
});
