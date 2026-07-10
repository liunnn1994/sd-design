import Image, { ImagePreview as Preview, ImagePreviewGroup as PreviewGroup } from '../index';
import getScale from '../utils/get-scale';

const imgSrc = 'http://it-does-not-matter.png/';

const mountLoadedPreview = () => {
  cy.mount(Preview, { props: { src: imgSrc, defaultVisible: true, renderToBody: false } });
  cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.vm.onImgLoad()));
};

describe('Image', () => {
  it('renders the error state for a broken src', () => {
    cy.mount(Image, { props: { src: imgSrc } });
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.vm.onImgLoadError()));
    cy.get('.sd-image-error').should('exist');
  });

  it('renders the footer caption title', () => {
    cy.mount(Image, { props: { src: imgSrc, title: 'My title' } });
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.vm.onImgLoaded()));
    cy.get('.sd-image-footer-caption-title').should('have.text', 'My title');
  });

  it('closes the preview on mask click', () => {
    mountLoadedPreview();
    cy.get('.sd-image-preview-wrapper').click({ force: true });
    cy.get('.sd-image-preview-wrapper').should('not.exist');
  });

  it('rotates the preview image right', () => {
    mountLoadedPreview();
    cy.get('.sd-image-preview-toolbar-action').eq(1).click({ force: true });
    cy.get('.sd-image-preview-img').invoke('attr', 'style').should('contain', 'rotate(90deg)');
  });

  it('rotates the preview image left', () => {
    mountLoadedPreview();
    cy.get('.sd-image-preview-toolbar-action').eq(2).click({ force: true });
    cy.get('.sd-image-preview-img').invoke('attr', 'style').should('contain', 'rotate(270deg)');
  });

  it('zooms the preview in', () => {
    mountLoadedPreview();
    cy.get('.sd-image-preview-toolbar-action').eq(3).click({ force: true });
    cy.get('.sd-image-preview-img-container')
      .invoke('attr', 'style')
      .should('contain', 'scale(1.1, 1.1)');
  });

  it('zooms the preview out', () => {
    mountLoadedPreview();
    cy.get('.sd-image-preview-toolbar-action').eq(4).click({ force: true });
    cy.get('.sd-image-preview-img-container')
      .invoke('attr', 'style')
      .should('contain', 'scale(0.9, 0.9)');
  });

  it('emits change on PreviewGroup arrow clicks', () => {
    cy.mount(PreviewGroup, {
      props: {
        srcList: ['https://1.jpg', 'https://2.jpg', 'https://3.jpg'],
        defaultVisible: true,
        renderToBody: false,
      },
    });
    cy.get('.sd-image-preview-arrow-right').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')![0]).to.include(1);
    });
    cy.get('.sd-image-preview-arrow-left').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')![1]).to.include(0);
    });
  });

  it('computes scale correctly', () => {
    expect(getScale(1.3)).to.equal(1.5);
    expect(getScale(0.79)).to.equal(0.9);
  });
});
