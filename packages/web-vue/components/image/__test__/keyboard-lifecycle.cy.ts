import { h, ref } from 'vue';

import { ImagePreview } from '../index';

const src =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

describe('Image preview keyboard lifecycle', () => {
  it('moves shortcuts to the new popup container without retaining the old listener', () => {
    const container = ref('#preview-a');
    const visible = ref(false);
    cy.mount({
      setup: () => () => [
        h('div', { id: 'preview-a' }),
        h('div', { id: 'preview-b' }),
        h(ImagePreview, { src, visible: visible.value, popupContainer: container.value }),
      ],
    });
    cy.then(() => {
      visible.value = true;
    });
    cy.get('#preview-a .sd-image-preview-toolbar').should('exist');
    cy.then(() => {
      container.value = '#preview-b';
    });
    cy.get('#preview-b .sd-image-preview-toolbar').should('exist');
    cy.get('#preview-a').trigger('keydown', { key: 'ArrowUp', force: true });
    cy.get('.sd-image-preview-img-container').should(
      'have.css',
      'transform',
      'matrix(1, 0, 0, 1, 0, 0)',
    );
    cy.get('#preview-b').trigger('keydown', { key: 'ArrowUp', force: true });
    cy.get('.sd-image-preview-img-container').should(
      'have.css',
      'transform',
      'matrix(1.1, 0, 0, 1.1, 0, 0)',
    );
  });

  for (const keyboard of [true, false]) {
    it(`updates shortcuts while open from keyboard=${keyboard}`, () => {
      cy.mount(ImagePreview, { props: { src, defaultVisible: true, keyboard } });
      cy.get('.sd-image-preview-toolbar').should('be.visible');
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ keyboard: !keyboard }));
      cy.get('body').type('{upArrow}');
      cy.get('.sd-image-preview-img-container').should(
        'have.css',
        'transform',
        keyboard ? 'matrix(1, 0, 0, 1, 0, 0)' : 'matrix(1.1, 0, 0, 1.1, 0, 0)',
      );
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ keyboard }));
      cy.get('body').type('{upArrow}');
      cy.get('.sd-image-preview-img-container').should(
        'have.css',
        'transform',
        'matrix(1.1, 0, 0, 1.1, 0, 0)',
      );
    });
  }
});
