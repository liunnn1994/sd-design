import type { CropperImage, CropperSelection } from 'cropperjs';

import Cropper from '../index';

const src =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360'%3E%3Crect width='640' height='360' fill='red'/%3E%3C/svg%3E";

describe('Cropper scaled fitting', () => {
  it('keeps the initial selection inside the canvas when the image is scaled down', () => {
    cy.mount(Cropper, { props: { src, width: 320, height: 240 } });
    cy.get<CropperImage>('cropper-image').then(($image) => $image[0].$ready());
    cy.get<CropperSelection>('cropper-selection').should(($selection) => {
      const selection = $selection[0];
      expect(selection.width).to.be.greaterThan(0);
      expect(selection.x + selection.width).to.be.at.most(320);
      expect(selection.y + selection.height).to.be.at.most(240);
    });
  });
});
