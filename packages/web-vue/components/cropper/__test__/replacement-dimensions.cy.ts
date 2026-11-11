import type { CropperImage } from 'cropperjs';

import Cropper from '../index';

const picture = (width: number, height: number) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="blue"/></svg>`)}`;

describe('Cropper replacement image dimensions', () => {
  it('updates the rendered aspect ratio after replacing a cached decoded image', () => {
    const first = picture(640, 360);
    const second = picture(320, 240);
    cy.window().then(async (win) => {
      const image = new win.Image();
      image.src = first;
      await image.decode();
    });
    cy.mount(Cropper, { props: { src: first, width: 400, height: 300 } });
    cy.get<CropperImage>('cropper-image').then(($image) => $image[0].$ready());
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ src: second }));
    cy.get<CropperImage>('cropper-image')
      .then(($image) => $image[0].$ready())
      .should('have.prop', 'naturalWidth', 320);
    cy.get('cropper-image').should(($image) => {
      const bounds = $image[0].getBoundingClientRect();
      expect(bounds.width / bounds.height).to.be.closeTo(4 / 3, 0.01);
    });
  });
});
