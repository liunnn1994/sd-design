import { createSSRApp } from 'vue';

import { renderToString } from 'vue/server-renderer';

import Image from '../index';

const src =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

describe('Image source lifecycle', () => {
  let hydratedApp: ReturnType<typeof createSSRApp> | undefined;
  let hydratedContainer: HTMLDivElement | undefined;
  afterEach(() => {
    hydratedApp?.unmount();
    hydratedContainer?.remove();
    hydratedApp = undefined;
    hydratedContainer = undefined;
  });
  it('hydrates an already decoded server image without waiting for another load event', () => {
    const load = cy.spy().as('load');
    cy.mount({ template: '<div />' });
    cy.document().then(async (document) => {
      const props = { src, title: 'Hydrated caption', width: 100, height: 80, onLoad: load };
      hydratedContainer = document.createElement('div');
      hydratedContainer.innerHTML = await renderToString(createSSRApp(Image, props));
      document.body.appendChild(hydratedContainer);
      const image = hydratedContainer.querySelector('img')!;
      await image.decode();
      expect(image.complete).to.equal(true);
      expect(image.naturalWidth).to.equal(1);
      hydratedApp = createSSRApp(Image, props);
      hydratedApp.mount(hydratedContainer);
      expect(hydratedContainer.querySelector('img')).to.equal(image);
    });
    cy.get('.sd-image-overlay').should('not.exist');
    cy.get('.sd-image-footer').should('contain', 'Hydrated caption');
    cy.get('.sd-image-img').click(8, 8);
    cy.get('.sd-image-preview-img').should('have.attr', 'src', src);
    cy.get('@load').should('not.have.been.called');
  });
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
