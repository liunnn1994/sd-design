import { h, ref } from 'vue';

import Image, { ImagePreviewGroup } from '../index';

const sources = ['red', 'blue', 'green'].map(
  (color) =>
    `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="${color}"/></svg>`)}`,
);

describe('Image group source updates', () => {
  it('updates the current image without moving its registration to the end', () => {
    const first = ref(sources[0]);
    cy.mount({
      setup: () => () =>
        h(
          ImagePreviewGroup,
          {},
          {
            default: () => [h(Image, { src: first.value }), h(Image, { src: sources[1] })],
          },
        ),
    });
    cy.get('.sd-image-overlay').should('not.exist');
    cy.get('.sd-image-img').first().click();
    cy.get('.sd-image-preview-img').should('have.attr', 'src', sources[0]);
    cy.then(() => {
      first.value = sources[2];
    });
    cy.get('.sd-image-preview-img').should('have.attr', 'src', sources[2]);
    cy.get('.sd-image-preview-arrow-left').should('have.class', 'sd-image-preview-arrow-disabled');
    cy.get('.sd-image-preview-arrow-right').click();
    cy.get('.sd-image-preview-img').should('have.attr', 'src', sources[1]);
  });
});
