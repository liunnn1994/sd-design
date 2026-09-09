import { ImagePreview } from '../index';

const src = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="red"/></svg>')}`;

describe('Image preview drag lifecycle', () => {
  it('moves a decoded image and recenters a small image on release', () => {
    cy.mount(ImagePreview, { props: { src, defaultVisible: true } });
    cy.get('.sd-image-preview-toolbar').should('be.visible');
    cy.get('.sd-image-preview-img').trigger('mousedown', {
      eventConstructor: 'MouseEvent',
      button: 0,
      clientX: 100,
      clientY: 100,
    });
    cy.window().trigger('mousemove', {
      eventConstructor: 'MouseEvent',
      clientX: 140,
      clientY: 120,
    });
    cy.get('.sd-image-preview-img').should('have.css', 'transform', 'matrix(1, 0, 0, 1, 40, 20)');
    cy.window().trigger('mouseup');
    cy.get('.sd-image-preview-img').should('have.css', 'transform', 'matrix(1, 0, 0, 1, 0, 0)');
    cy.get('.sd-image-preview-img').should('not.have.class', 'sd-image-preview-img-moving');
  });

  it('ends an interrupted drag when the preview closes and reopens', () => {
    cy.mount(ImagePreview, { props: { src, visible: true } });
    cy.get('.sd-image-preview-toolbar').should('be.visible');
    cy.get('.sd-image-preview-img').trigger('mousedown', {
      eventConstructor: 'MouseEvent',
      button: 0,
      clientX: 100,
      clientY: 100,
    });
    cy.window().trigger('mousemove', {
      eventConstructor: 'MouseEvent',
      clientX: 140,
      clientY: 120,
    });
    cy.get('.sd-image-preview-img').should('have.class', 'sd-image-preview-img-moving');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ visible: false }));
    cy.get('.sd-image-preview-wrapper').should('not.exist');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ visible: true }));
    cy.get('.sd-image-preview-toolbar').should('be.visible');
    cy.get('.sd-image-preview-img').should('not.have.class', 'sd-image-preview-img-moving');
    cy.window().trigger('mousemove', {
      eventConstructor: 'MouseEvent',
      clientX: 180,
      clientY: 160,
    });
    cy.get('.sd-image-preview-img').should('have.css', 'transform', 'matrix(1, 0, 0, 1, 0, 0)');
  });
});
