import { ImagePreview } from '../index';

const src = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="red"/></svg>')}`;

describe('Image preview boundaries', () => {
  for (const scale of [0.25, 5]) {
    it(`keeps toolbar and keyboard zoom within the ${scale} boundary`, () => {
      cy.mount(ImagePreview, { props: { src, defaultVisible: true, defaultScale: scale } });
      const index = scale === 5 ? 3 : 4;
      cy.get('.sd-image-preview-toolbar-action')
        .eq(index)
        .should('have.class', 'sd-image-preview-toolbar-action-disabled')
        .click();
      cy.get('body').type(scale === 5 ? '{upArrow}' : '{downArrow}');
      cy.get('.sd-image-preview-img-container').should(
        'have.css',
        'transform',
        `matrix(${scale}, 0, 0, ${scale}, 0, 0)`,
      );
      cy.get('.sd-image-preview-toolbar-action')
        .eq(scale === 5 ? 4 : 3)
        .click();
      cy.get('.sd-image-preview-img-container').should(
        'have.css',
        'transform',
        scale === 5 ? 'matrix(4, 0, 0, 4, 0, 0)' : 'matrix(0.33, 0, 0, 0.33, 0, 0)',
      );
    });
  }

  it('reopens after a real leave transition and resets image transforms', () => {
    cy.mount(ImagePreview, {
      props: { src, visible: false },
      global: { stubs: { 'transition': false, 'transition-group': false } },
    });
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ visible: true }));
    cy.get('.sd-image-preview-mask').should('have.css', 'opacity', '1');
    cy.get('.sd-image-preview-toolbar-action').eq(1).click();
    cy.get('.sd-image-preview-img').should('have.css', 'transform', 'matrix(0, 1, -1, 0, 0, 0)');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ visible: false }));
    cy.get('.sd-image-preview-mask').should('have.css', 'display', 'none');
    cy.get('.sd-image-preview-mask').should('not.have.class', 'image-fade-leave-active');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ visible: true }));
    cy.get('.sd-image-preview-mask')
      .should('have.css', 'display', 'block')
      .and('have.css', 'opacity', '1');
    cy.get('.sd-image-preview-wrapper').should('be.visible');
    cy.get('.sd-image-preview-img').should('have.css', 'transform', 'matrix(1, 0, 0, 1, 0, 0)');
    cy.get('body').type('{upArrow}');
    cy.get('.sd-image-preview-img-container').should(
      'have.css',
      'transform',
      'matrix(1.1, 0, 0, 1.1, 0, 0)',
    );
  });
});
