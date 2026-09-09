import { ImagePreviewAction } from '../index';

describe('Image preview action disabled state', () => {
  for (const name of [undefined, 'Download']) {
    it(`blocks disabled clicks with ${name ? 'a tooltip' : 'no tooltip'}`, () => {
      const click = cy.spy().as('actionClick');
      cy.mount(ImagePreviewAction, {
        props: { name, disabled: true },
        attrs: { onClick: click },
        slots: { default: '<span>Download</span>' },
      });
      cy.get('.sd-image-preview-toolbar-action').click();
      cy.get('@actionClick').should('not.have.been.called');
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ disabled: false }));
      cy.get('.sd-image-preview-toolbar-action').click();
      cy.get('@actionClick').should('have.been.calledOnce');
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ disabled: true }));
      cy.get('.sd-image-preview-toolbar-action').click();
      cy.get('@actionClick').should('have.been.calledOnce');
    });
  }
});
