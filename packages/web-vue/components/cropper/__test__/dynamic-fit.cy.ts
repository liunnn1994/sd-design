import type { CropperImage, CropperSelection } from 'cropperjs';

import Cropper from '../index';

const src =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='240'%3E%3Crect width='320' height='240' fill='red'/%3E%3C/svg%3E";

describe('Cropper dynamic fitting', () => {
  it('fits an already loaded image when fitting is enabled at runtime', () => {
    cy.mount(Cropper, { props: { src, width: 400, height: 300, fitSelectionToImage: false } });
    cy.get<CropperImage>('cropper-image').then(($image) => $image[0].$ready());
    cy.get<CropperSelection>('cropper-selection').then(($selection) => {
      $selection[0].$change(10, 10, 30, 30);
    });
    cy.get<CropperSelection>('cropper-selection').should(($selection) => {
      expect($selection[0].width).to.equal(30);
    });
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ fitSelectionToImage: true }));
    cy.get<CropperSelection>('cropper-selection').should(($selection) => {
      expect($selection[0].x).to.equal(1);
      expect($selection[0].y).to.equal(1);
      expect($selection[0].width).to.be.greaterThan(30);
      expect($selection[0].height).to.be.greaterThan(30);
    });
  });
});
