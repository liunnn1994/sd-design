import type { CropperImage, CropperSelection } from 'cropperjs';

import Cropper from '../index';

const svg = (width: number, height: number) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="red"/></svg>`)}`;

describe('Cropper actual image replacement', () => {
  for (const fit of [true, false]) {
    it(`${fit ? 'fits the final image' : 'preserves the selection'} after rapid source replacement`, () => {
      const finalSrc = svg(160, 120);
      cy.mount(Cropper, {
        props: { src: svg(320, 240), width: 400, height: 300, fitSelectionToImage: fit },
      });
      cy.get<CropperImage>('cropper-image').then(($image) => $image[0].$ready());
      cy.then(() => Cypress.Promise.delay(0));
      cy.get<CropperSelection>('cropper-selection').then(($selection) => {
        $selection[0].$change(10, 12, 60, 40);
      });
      cy.get('@vue').then(async ({ wrapper }) => {
        await wrapper.setProps({ src: svg(800, 600) });
        await wrapper.setProps({ src: finalSrc });
      });
      cy.get<HTMLImageElement>('.sd-cropper-source-image').should('have.attr', 'src', finalSrc);
      cy.get<HTMLImageElement>('.sd-cropper-source-image').then(($image) => $image[0].decode());
      cy.get<CropperImage>('cropper-image').should('have.attr', 'src', finalSrc);
      cy.get<CropperImage>('cropper-image').then(($image) => $image[0].$ready());
      cy.then(() => Cypress.Promise.delay(0));
      cy.get<CropperSelection>('cropper-selection').should(($selection) => {
        const { x, y, width, height } = $selection[0];
        const image = $selection[0].parentElement!.querySelector('cropper-image')!;
        const bounds = image.getBoundingClientRect();
        expect({ x, y, width, height }).to.deep.equal(
          fit
            ? { x: 1, y: 1, width: bounds.width - 2, height: bounds.height - 2 }
            : { x: 10, y: 12, width: 60, height: 40 },
        );
      });
    });
  }
});
