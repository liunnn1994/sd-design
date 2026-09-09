import Image from '../index';

const src =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

describe('Image source lifecycle', () => {
  for (const empty of [undefined, '']) {
    it(`clears the decoded image and restores loading after ${String(empty)}`, () => {
      cy.mount(Image, {
        props: { src, title: 'Caption', width: 40, height: 40, footerPosition: 'outer' },
      });
      cy.get('.sd-image-footer').should('contain', 'Caption');
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ src: empty }));
      cy.get('.sd-image-img').should('not.have.attr', 'src');
      cy.get('.sd-image-footer').should('not.exist');
      cy.get('.sd-image').should('not.have.class', 'sd-image-loading');
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ src }));
      cy.get('.sd-image-footer').should('contain', 'Caption');
      cy.get('.sd-image-img').click();
      cy.get('.sd-image-preview-img').should('have.attr', 'src', src);
    });
  }
});
