import { h, ref } from 'vue';

import Image, { ImagePreviewGroup } from '../index';

const sources = ['red', 'blue', 'green'].map(
  (color) =>
    `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="${color}"/></svg>`)}`,
);

describe('Image group explicit sources', () => {
  it('does not append child images to an explicit source list', () => {
    cy.mount(ImagePreviewGroup, {
      props: { srcList: sources.slice(0, 2), defaultVisible: true },
      slots: { default: () => h(Image, { src: sources[2] }) },
    });
    cy.get('.sd-image-preview-img').should('have.attr', 'src', sources[0]);
    cy.get('.sd-image-preview-arrow-right').click();
    cy.get('.sd-image-preview-img').should('have.attr', 'src', sources[1]);
    cy.get('.sd-image-preview-arrow-right').should('have.class', 'sd-image-preview-arrow-disabled');
    cy.get('.sd-image-preview-close-btn').click();
    cy.get('.sd-image-img').click();
    cy.get('.sd-image-preview-img').should('have.attr', 'src', sources[1]);
  });

  it('restores registered children when the explicit list is removed', () => {
    const list = ref<string[] | undefined>([sources[0]]);
    cy.mount({
      setup: () => () =>
        h(
          ImagePreviewGroup,
          { srcList: list.value, defaultVisible: true },
          {
            default: () => h(Image, { src: sources[2] }),
          },
        ),
    });
    cy.get('.sd-image-preview-img').should('have.attr', 'src', sources[0]);
    cy.then(() => {
      list.value = undefined;
    });
    cy.get('.sd-image-preview-img').should('have.attr', 'src', sources[2]);
    cy.then(() => {
      list.value = [sources[1]];
    });
    cy.get('.sd-image-preview-img').should('have.attr', 'src', sources[1]);
    cy.get('.sd-image-preview-arrow-right').should('have.class', 'sd-image-preview-arrow-disabled');
  });
});
