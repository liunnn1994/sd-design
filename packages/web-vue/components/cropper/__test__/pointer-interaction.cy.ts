import type { CropperImage, CropperSelection } from 'cropperjs';

import Cropper from '../index';

const src =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='240'%3E%3Crect width='320' height='240' fill='red'/%3E%3C/svg%3E";

describe('Cropper pointer interactions', () => {
  for (const action of ['move', 'se-resize']) {
    for (const disabled of [false, true]) {
      it(`${disabled ? 'prevents' : 'supports'} ${action} while canvas disabled is ${disabled}`, () => {
        const onChange = cy.spy().as('selectionChange');
        cy.mount(Cropper, {
          props: {
            src,
            'width': 400,
            'height': 300,
            'fitSelectionToImage': false,
            'canvasProps': { disabled },
            'onSelection:change': onChange,
          },
        });
        cy.get<CropperImage>('cropper-image').then(($image) => $image[0].$ready());
        cy.get<CropperSelection>('cropper-selection').then(($selection) => {
          $selection[0].$change(30, 40, 100, 80);
        });
        cy.then(() => Cypress.Promise.delay(0));
        cy.get(`cropper-selection cropper-handle[action="${action}"]`).then(($handle) => {
          onChange.resetHistory();
          const handle = $handle[0];
          const document = handle.ownerDocument;
          const EventConstructor = document.defaultView!.PointerEvent;
          const bounds = handle.getBoundingClientRect();
          const clientX = bounds.left + bounds.width / 2;
          const clientY = bounds.top + bounds.height / 2;
          const options = {
            bubbles: true,
            cancelable: true,
            pointerId: 1,
            pointerType: 'mouse',
            button: 0,
            buttons: 1,
            clientX,
            clientY,
          };
          handle.dispatchEvent(new EventConstructor('pointerdown', options));
          handle.dispatchEvent(
            new EventConstructor('pointermove', {
              ...options,
              clientX: clientX + 25,
              clientY: clientY + 15,
            }),
          );
          handle.dispatchEvent(
            new EventConstructor('pointerup', {
              ...options,
              buttons: 0,
              clientX: clientX + 25,
              clientY: clientY + 15,
            }),
          );
        });
        cy.then(() => Cypress.Promise.delay(0));
        cy.get<CropperSelection>('cropper-selection').should(($selection) => {
          const { x, y, width, height } = $selection[0];
          const expected = disabled
            ? { x: 30, y: 40, width: 100, height: 80 }
            : action === 'move'
              ? { x: 55, y: 55, width: 100, height: 80 }
              : { x: 30, y: 40, width: 125, height: 95 };
          expect({ x, y, width, height }).to.deep.equal(expected);
          if (disabled) expect(onChange.callCount).to.equal(0);
          else expect(onChange.lastCall.args).to.deep.equal([expected]);
        });
      });
    }
  }
});
