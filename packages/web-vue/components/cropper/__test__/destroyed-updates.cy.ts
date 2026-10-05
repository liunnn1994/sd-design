import type { CropperExpose } from '../interface';

import Cropper from '../index';

describe('Cropper updates after destruction', () => {
  for (const update of ['fit', 'src']) {
    it(`does not register image load listeners after a ${update} update`, () => {
      cy.mount(Cropper, { props: { fitSelectionToImage: update === 'src' } });
      cy.get('cropper-canvas').should('exist');
      cy.get('.sd-cropper-source-image').then(($image) => {
        cy.spy($image[0], 'addEventListener').as('addListener');
      });
      cy.get('@vue').then(async ({ wrapper }) => {
        (wrapper.vm as unknown as CropperExpose).destroy();
        await wrapper.setProps(
          update === 'fit'
            ? { fitSelectionToImage: true }
            : { src: 'data:image/png;base64,invalid' },
        );
      });
      cy.then(() => Cypress.Promise.delay(0));
      cy.get('@addListener').should('not.have.been.calledWith', 'load');
      cy.get('cropper-canvas').should('not.exist');
    });
  }
});
