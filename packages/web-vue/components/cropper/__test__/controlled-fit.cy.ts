import type { CropperImage, CropperSelection } from 'cropperjs';

import Cropper from '../index';

const src =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='240'%3E%3Crect width='320' height='240' fill='red'/%3E%3C/svg%3E";

describe('Cropper fitting with controlled geometry', () => {
  it('keeps all explicitly supplied geometry after the image loads', () => {
    cy.mount(Cropper, {
      props: {
        src,
        width: 400,
        height: 300,
        selectionX: 10,
        selectionY: 12,
        selectionWidth: 60,
        selectionHeight: 40,
      },
    });
    cy.get<CropperImage>('cropper-image').then(($image) => $image[0].$ready());
    cy.then(() => Cypress.Promise.delay(0));
    cy.get<CropperSelection>('cropper-selection').should(($selection) => {
      const { x, y, width, height } = $selection[0];
      expect({ x, y, width, height }).to.deep.equal({ x: 10, y: 12, width: 60, height: 40 });
    });
  });

  it('fits uncontrolled dimensions while preserving an explicit x coordinate', () => {
    cy.mount(Cropper, { props: { src, width: 400, height: 300, selectionX: 10 } });
    cy.get<CropperImage>('cropper-image').then(($image) => $image[0].$ready());
    cy.then(() => Cypress.Promise.delay(0));
    cy.get<CropperSelection>('cropper-selection').should(($selection) => {
      expect($selection[0].x).to.equal(10);
      expect($selection[0].y).to.equal(1);
      expect($selection[0].width).to.be.greaterThan(30);
      expect($selection[0].height).to.be.greaterThan(30);
    });
  });
});
