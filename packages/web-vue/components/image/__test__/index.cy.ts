import { h } from 'vue';

import Image, { ImagePreview as Preview, ImagePreviewGroup as PreviewGroup } from '../index';
import getScale from '../utils/get-scale';

const brokenImgSrc = 'http://it-does-not-matter.png/';
const imgSrc = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
const invalidImgSrc = 'data:image/png;base64,INVALIDIMAGE';
const pngImgSrc =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const mountLoadedPreview = () => {
  cy.mount(Preview, { props: { src: imgSrc, defaultVisible: true, renderToBody: false } });
  cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.vm.onImgLoad()));
};

const mountPreview = (props: Record<string, any> = {}) => {
  cy.mount(Preview, {
    props: { src: imgSrc, renderToBody: false, ...props },
  });
  cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ visible: true }));
  cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.vm.onImgLoad()));
};

describe('Image', () => {
  it('renders the error state for a broken src', () => {
    cy.mount(Image, { props: { src: brokenImgSrc } });
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

  describe('Image basics', () => {
    it('renders the img with the given src once loaded', () => {
      cy.mount(Image, { props: { src: imgSrc } });
      cy.get('.sd-image-img').should('have.attr', 'src', imgSrc);
      cy.get('.sd-image-error').should('not.exist');
      cy.get('.sd-image-overlay').should('not.exist');
    });

    it('recovers from the error state when src changes to a valid one', () => {
      cy.mount(Image, { props: { src: invalidImgSrc } });
      cy.get('.sd-image-error').should('exist');
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ src: imgSrc }));
      cy.get('.sd-image-error').should('not.exist');
      cy.get('.sd-image-img').should('have.attr', 'src', imgSrc);
    });

    it('applies width and height props to the img style (px and %)', () => {
      cy.mount(Image, { props: { src: imgSrc, width: 200, height: 100 } });
      cy.get('.sd-image-img')
        .invoke('attr', 'style')
        .should('contain', 'width: 200px')
        .and('contain', 'height: 100px');
      cy.mount(Image, { props: { src: imgSrc, width: '50%' } });
      cy.get('.sd-image-img').invoke('attr', 'style').should('contain', 'width: 50%');
    });

    it('applies the fit prop as object-fit', () => {
      cy.mount(Image, { props: { src: imgSrc, fit: 'cover' } });
      cy.get('.sd-image-img').invoke('attr', 'style').should('contain', 'object-fit: cover');
    });

    it('shows title and description in the footer and title attr on img', () => {
      cy.mount(Image, {
        props: { src: imgSrc, title: 'My title', description: 'My description' },
      });
      cy.get('.sd-image-footer-caption-title').should('have.text', 'My title');
      cy.get('.sd-image-footer-caption-description').should('have.text', 'My description');
      cy.get('.sd-image-img').should('have.attr', 'title', 'My title');
    });

    it('applies footer-class to the footer', () => {
      cy.mount(Image, {
        props: { src: imgSrc, title: 'My title', footerClass: 'custom-footer-class' },
      });
      cy.get('.sd-image-footer.custom-footer-class').should('exist');
    });

    it('hides the footer when there is no title, description or extra slot', () => {
      cy.mount(Image, { props: { src: imgSrc } });
      cy.get('.sd-image-img').should('have.attr', 'src', imgSrc);
      cy.get('.sd-image-footer').should('not.exist');
    });

    it('hides the footer when hide-footer is true', () => {
      cy.mount(Image, { props: { src: imgSrc, title: 'My title', hideFooter: true } });
      cy.get('.sd-image-img').should('have.attr', 'src', imgSrc);
      cy.get('.sd-image-footer').should('not.exist');
    });

    it('shows the footer in the error state when hide-footer is never', () => {
      cy.mount(Image, {
        props: { src: invalidImgSrc, title: 'My title', hideFooter: 'never' },
      });
      cy.get('.sd-image-error').should('exist');
      cy.get('.sd-image-footer').should('exist');
      cy.get('.sd-image-footer-caption-title').should('have.text', 'My title');
    });

    it('applies the footer-position outer class to the wrapper', () => {
      cy.mount(Image, {
        props: { src: imgSrc, title: 'My title', footerPosition: 'outer' },
      });
      cy.get('.sd-image.sd-image-with-footer-outer').should('exist');
    });

    it('renders the extra slot in the footer', () => {
      cy.mount(Image, {
        props: { src: imgSrc },
        slots: { extra: '<span class="footer-extra-content">Extra</span>' },
      });
      cy.get('.sd-image-footer-extra').should('contain', 'Extra');
    });

    it('renders custom error and error-icon slots', () => {
      cy.mount(Image, {
        props: { src: invalidImgSrc },
        slots: { error: '<div class="my-error-content">Oops</div>' },
      });
      cy.get('.sd-image-error').should('not.exist');
      cy.get('.my-error-content').should('have.text', 'Oops');
      cy.mount(Image, {
        props: { src: invalidImgSrc },
        slots: { 'error-icon': '<span class="my-error-icon">X</span>' },
      });
      cy.get('.sd-image-error-icon .my-error-icon').should('have.text', 'X');
    });

    it('shows alt text in the error state and falls back to description', () => {
      cy.mount(Image, { props: { src: invalidImgSrc, alt: 'Broken picture' } });
      cy.get('.sd-image-error-alt').should('have.text', 'Broken picture');
      cy.mount(Image, { props: { src: invalidImgSrc, description: 'Some description' } });
      cy.get('.sd-image-error-alt').should('have.text', 'Some description');
    });
  });

  describe('Image preview', () => {
    it('does not open the preview when preview is false', () => {
      cy.mount(Image, { props: { src: imgSrc, preview: false, renderToBody: false } });
      cy.get('.sd-image-img').click();
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('preview-visible-change')).to.equal(undefined);
      });
      cy.get('.sd-image-preview-wrapper').should('not.exist');
    });

    it('opens the preview on image click and emits preview-visible-change', () => {
      cy.mount(Image, { props: { src: imgSrc, renderToBody: false } });
      cy.get('.sd-image-img').click();
      cy.get('.sd-image-preview-wrapper').should('be.visible');
      cy.get('.sd-image-preview-img').should('have.attr', 'src', imgSrc);
      cy.get('@vue').should(({ wrapper }) => {
        const events = wrapper.emitted('preview-visible-change') || [];
        expect(events.length).to.equal(1);
        expect(events[0][0]).to.equal(true);
      });
    });

    it('emits preview-visible-change false when closed via the close button', () => {
      cy.mount(Image, { props: { src: imgSrc, renderToBody: false } });
      cy.get('.sd-image-img').click();
      cy.get('.sd-image-preview-close-btn').click({ force: true });
      cy.get('@vue').should(({ wrapper }) => {
        const events = wrapper.emitted('preview-visible-change') || [];
        expect(events.length).to.equal(2);
        expect(events[1][0]).to.equal(false);
      });
      cy.get('.sd-image-preview-mask').should('not.be.visible');
    });

    it('respects the controlled preview-visible prop', () => {
      cy.mount(Image, {
        props: { src: imgSrc, previewVisible: false, renderToBody: false },
      });
      cy.get('.sd-image-img').click();
      cy.get('@vue').should(({ wrapper }) => {
        const events = wrapper.emitted('update:previewVisible') || [];
        expect(events.length).to.equal(1);
        expect(events[0][0]).to.equal(true);
        expect(wrapper.emitted('preview-visible-change')).to.not.equal(undefined);
      });
      cy.get('.sd-image-preview-wrapper').should('not.exist');
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ previewVisible: true }));
      cy.get('.sd-image-preview-wrapper').should('be.visible');
    });

    it('opens the preview on mount when default-preview-visible is true', () => {
      cy.mount(Image, {
        props: { src: imgSrc, defaultPreviewVisible: true, renderToBody: false },
      });
      cy.get('.sd-image-preview-wrapper').should('be.visible');
      cy.get('.sd-image-preview-img').should('have.attr', 'src', imgSrc);
    });

    it('uses the src from preview-props for the preview image', () => {
      cy.mount(Image, {
        props: { src: imgSrc, previewProps: { src: pngImgSrc }, renderToBody: false },
      });
      cy.get('.sd-image-img').click();
      cy.get('.sd-image-preview-img').should('have.attr', 'src', pngImgSrc);
    });
  });

  describe('ImagePreview', () => {
    it('shows the loading indicator while the preview src is missing', () => {
      cy.mount(Preview, { props: { renderToBody: false } });
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ visible: true }));
      cy.get('.sd-image-preview-loading').should('be.visible');
      cy.get('.sd-image-preview-toolbar').should('not.exist');
    });

    it('does not close on mask click when mask-closable is false', () => {
      mountPreview({ maskClosable: false });
      cy.get('.sd-image-preview-wrapper').click({ force: true });
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('close')).to.equal(undefined);
      });
      cy.get('.sd-image-preview-wrapper').should('be.visible');
    });

    it('renders no close button when closable is false', () => {
      mountPreview({ closable: false });
      cy.get('.sd-image-preview-close-btn').should('not.exist');
    });

    it('closes the preview when Escape is pressed', () => {
      mountPreview();
      cy.get('body').type('{esc}');
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('close')).to.have.lengthOf(1);
      });
      cy.get('.sd-image-preview-mask').should('not.be.visible');
    });

    it('zooms in with the ArrowUp key', () => {
      mountPreview();
      cy.get('body').type('{upArrow}');
      cy.get('.sd-image-preview-img-container')
        .invoke('attr', 'style')
        .should('contain', 'scale(1.1, 1.1)');
    });

    it('zooms with the mouse wheel', () => {
      mountPreview();
      cy.get('.sd-image-preview-wrapper').trigger('wheel', { deltaY: -100 });
      cy.get('.sd-image-preview-img-container')
        .invoke('attr', 'style')
        .should('contain', 'scale(1.1, 1.1)');
      cy.wait(200);
      cy.get('.sd-image-preview-wrapper').trigger('wheel', { deltaY: 100 });
      cy.get('.sd-image-preview-img-container')
        .invoke('attr', 'style')
        .should('contain', 'scale(1, 1)');
    });

    it('renders only the configured actions from actions-layout', () => {
      mountPreview({ actionsLayout: ['zoomIn', 'originalSize'] });
      cy.get('.sd-image-preview-toolbar-action').should('have.length', 2);
      cy.get('.sd-image-preview-toolbar-action').eq(0).click({ force: true });
      cy.get('.sd-image-preview-img-container')
        .invoke('attr', 'style')
        .should('contain', 'scale(1.1, 1.1)');
    });

    it('applies the default-scale prop', () => {
      mountPreview({ defaultScale: 1.5 });
      cy.get('.sd-image-preview-img-container')
        .invoke('attr', 'style')
        .should('contain', 'scale(1.5, 1.5)');
    });

    it('resets the scale with the originalSize action', () => {
      mountPreview();
      cy.get('.sd-image-preview-toolbar-action').eq(3).click({ force: true });
      cy.get('.sd-image-preview-img-container')
        .invoke('attr', 'style')
        .should('contain', 'scale(1.1, 1.1)');
      cy.get('.sd-image-preview-toolbar-action').eq(5).click({ force: true });
      cy.get('.sd-image-preview-img-container')
        .invoke('attr', 'style')
        .should('contain', 'scale(1, 1)');
    });

    it('changes the scale with the fullScreen action', () => {
      mountPreview();
      cy.get('.sd-image-preview-img-container')
        .invoke('attr', 'style')
        .then((before) => {
          cy.get('.sd-image-preview-toolbar-action').eq(0).click({ force: true });
          cy.get('.sd-image-preview-img-container')
            .invoke('attr', 'style')
            .should((after) => {
              expect(after).to.not.equal(before);
            });
        });
    });
  });

  describe('ImagePreviewGroup', () => {
    it('wraps to the last image with infinite', () => {
      cy.mount(PreviewGroup, {
        props: {
          srcList: ['https://1.jpg', 'https://2.jpg', 'https://3.jpg'],
          defaultVisible: true,
          renderToBody: false,
          infinite: true,
        },
      });
      cy.get('.sd-image-preview-arrow-left').click({ force: true });
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('change')![0]).to.include(2);
      });
    });

    it('disables the left arrow at the first image without infinite', () => {
      cy.mount(PreviewGroup, {
        props: {
          srcList: ['https://1.jpg', 'https://2.jpg', 'https://3.jpg'],
          defaultVisible: true,
          renderToBody: false,
        },
      });
      cy.get('.sd-image-preview-arrow-left').should(
        'have.class',
        'sd-image-preview-arrow-disabled',
      );
      cy.get('.sd-image-preview-arrow-right').should(
        'not.have.class',
        'sd-image-preview-arrow-disabled',
      );
      cy.get('.sd-image-preview-arrow-left').click({ force: true });
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('change')).to.equal(undefined);
      });
    });

    it('opens the group preview when a child Image is clicked', () => {
      cy.mount(PreviewGroup, {
        props: { renderToBody: false },
        slots: { default: () => h(Image, { src: imgSrc }) },
      });
      cy.get('.sd-image-img').click();
      cy.get('.sd-image-preview-wrapper').should('be.visible');
      cy.get('.sd-image-preview-img').should('have.attr', 'src', imgSrc);
      cy.get('.sd-image-preview-close-btn').click({ force: true });
      cy.get('@vue').should(({ wrapper }) => {
        const events = wrapper.emitted('visible-change') || [];
        expect(events.length).to.be.at.least(1);
        expect(events[events.length - 1][0]).to.equal(false);
      });
    });
  });
});
