import ColorPicker from '../index';

describe('ColorPicker gradient pointer dragging', () => {
  it('clamps dragging at both ends of the track', () => {
    cy.mount(ColorPicker, {
      props: {
        hideTrigger: true,
        colorModes: ['linear-gradient'],
        defaultValue: 'linear-gradient(90deg, rgb(255, 0, 0) 0%, rgb(0, 0, 255) 100%)',
      },
    });
    cy.get('.sd-color-picker-gradient-thumb')
      .first()
      .then(($thumb) => {
        const thumb = $thumb[0];
        const win = thumb.ownerDocument.defaultView!;
        const track = thumb.parentElement!.querySelector('.sd-color-picker-gradient-bar')!;
        const rect = track.getBoundingClientRect();
        expect(rect.width).to.be.greaterThan(0);
        const pointer = (type: string, x: number) =>
          new PointerEvent(type, {
            bubbles: true,
            pointerId: 1,
            pointerType: 'mouse',
            button: 0,
            buttons: 1,
            clientX: x,
            clientY: rect.y + rect.height / 2,
          });
        thumb.dispatchEvent(pointer('pointerdown', rect.x));
        win.dispatchEvent(pointer('pointermove', rect.right + 40));
        cy.wrap(thumb).should('have.attr', 'style').and('contain', 'left: 100%');
        cy.then(() => win.dispatchEvent(pointer('pointermove', rect.x - 40)));
        cy.wrap(thumb).should('have.attr', 'style').and('contain', 'left: 0%');
        cy.then(() => win.dispatchEvent(pointer('pointerup', rect.x - 40)));
      });
  });

  it('keeps the dragged node selected after it crosses another stop', () => {
    cy.mount(ColorPicker, {
      props: {
        hideTrigger: true,
        colorModes: ['linear-gradient'],
        defaultValue:
          'linear-gradient(90deg, rgb(255, 0, 0) 0%, rgb(0, 255, 0) 50%, rgb(0, 0, 255) 100%)',
      },
    });
    cy.get('.sd-color-picker-gradient-thumb')
      .first()
      .then(($thumb) => {
        const thumb = $thumb[0];
        const win = thumb.ownerDocument.defaultView!;
        const rect = thumb
          .parentElement!.querySelector('.sd-color-picker-gradient-bar')!
          .getBoundingClientRect();
        const pointer = (type: string, x: number) =>
          new PointerEvent(type, {
            bubbles: true,
            pointerId: 1,
            pointerType: 'mouse',
            button: 0,
            buttons: 1,
            clientX: x,
            clientY: rect.y + rect.height / 2,
          });
        thumb.dispatchEvent(pointer('pointerdown', rect.x));
        win.dispatchEvent(pointer('pointermove', rect.x + rect.width * 0.8));
        win.dispatchEvent(pointer('pointerup', rect.x + rect.width * 0.8));
        cy.get('.sd-color-picker-gradient-thumb')
          .eq(1)
          .should(($node) => {
            expect($node[0]).to.equal(thumb);
            expect(parseFloat(thumb.style.left)).to.be.closeTo(80, 1);
          });
        cy.get('.sd-color-picker-gradient-thumb-active').should(($node) => {
          expect($node[0]).to.equal(thumb);
        });
        cy.get('.sd-color-picker-format-input input').first().should('have.value', '255');
      });
  });
});
