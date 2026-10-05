import { h } from 'vue';

import { ImagePreview } from '../index';

const src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

describe('Image preview keyboard stack', () => {
  it('zooms and closes only the top preview, then restores the lower preview shortcuts', () => {
    cy.mount({
      setup: () => () => [
        h(ImagePreview, { src, defaultVisible: true }),
        h(ImagePreview, { src, defaultVisible: true }),
      ],
    });
    cy.get('.sd-image-preview').eq(1).find('.sd-image-preview-toolbar').should('be.visible');
    cy.get('.sd-image-preview')
      .eq(1)
      .find('.sd-image-preview-wrapper')
      .trigger('keydown', { key: 'ArrowUp' });
    cy.get('.sd-image-preview')
      .eq(1)
      .find('.sd-image-preview-img-container')
      .should('have.css', 'transform', 'matrix(1.1, 0, 0, 1.1, 0, 0)');
    cy.get('.sd-image-preview')
      .eq(0)
      .find('.sd-image-preview-img-container')
      .should('have.css', 'transform', 'matrix(1, 0, 0, 1, 0, 0)');
    cy.get('.sd-image-preview')
      .eq(1)
      .find('.sd-image-preview-wrapper')
      .trigger('keydown', { key: 'Escape' });
    cy.get('.sd-image-preview').eq(1).find('.sd-image-preview-wrapper').should('not.exist');
    cy.get('.sd-image-preview')
      .eq(0)
      .find('.sd-image-preview-wrapper')
      .should('be.visible')
      .trigger('keydown', { key: 'ArrowUp' });
    cy.get('.sd-image-preview')
      .eq(0)
      .find('.sd-image-preview-img-container')
      .should('have.css', 'transform', 'matrix(1.1, 0, 0, 1.1, 0, 0)');
    cy.get('.sd-image-preview')
      .eq(0)
      .find('.sd-image-preview-wrapper')
      .trigger('keydown', { key: 'Escape' });
    cy.get('.sd-image-preview').eq(0).find('.sd-image-preview-wrapper').should('not.exist');
  });

  it('keeps the lower preview open after Escape closes the upper preview', () => {
    cy.mount({
      setup: () => () => [
        h(ImagePreview, { src, defaultVisible: true }),
        h(ImagePreview, { src, defaultVisible: true }),
      ],
    });
    cy.get('.sd-image-preview').eq(1).find('.sd-image-preview-toolbar').should('be.visible');
    cy.get('.sd-image-preview')
      .eq(1)
      .find('.sd-image-preview-wrapper')
      .trigger('keydown', { key: 'Escape' });
    cy.get('.sd-image-preview').eq(1).find('.sd-image-preview-wrapper').should('not.exist');
    cy.get('.sd-image-preview').eq(0).find('.sd-image-preview-wrapper').should('be.visible');
  });
});
