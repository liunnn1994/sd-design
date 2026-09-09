import { h, ref } from 'vue';

import Image, { ImagePreviewGroup } from '../index';

const sources = ['red', 'blue', 'green'].map(
  (color) =>
    `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="${color}"/></svg>`)}`,
);

describe('Image group identity', () => {
  it('opens each child and keeps the other children registered after removal', () => {
    const ids = ref([0, 1, 2]);
    cy.mount({
      setup: () => () =>
        h(
          ImagePreviewGroup,
          {},
          {
            default: () =>
              ids.value.map((id) =>
                h(Image, {
                  'key': id,
                  'src': sources[id],
                  'data-image': id,
                }),
              ),
          },
        ),
    });
    cy.get('.sd-image-overlay').should('not.exist');
    cy.get('[data-image="0"]').click();
    cy.get('.sd-image-preview-img').should('have.attr', 'src', sources[0]);
    cy.get('.sd-image-preview-arrow-right').click();
    cy.get('.sd-image-preview-img').should('have.attr', 'src', sources[1]);
    cy.get('.sd-image-preview-arrow-right').click();
    cy.get('.sd-image-preview-img').should('have.attr', 'src', sources[2]);
    cy.get('.sd-image-preview-close-btn').click();
    cy.then(() => {
      ids.value = [0, 2];
    });
    cy.get('[data-image="1"]').should('not.exist');
    cy.get('[data-image="0"]').click();
    cy.get('.sd-image-preview-img').should('have.attr', 'src', sources[0]);
    cy.get('.sd-image-preview-arrow-right').click();
    cy.get('.sd-image-preview-img').should('have.attr', 'src', sources[2]);
  });
});
