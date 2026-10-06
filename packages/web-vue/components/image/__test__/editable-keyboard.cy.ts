import { h } from 'vue';

import { ImagePreview } from '../index';

const src =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

describe('Image preview custom action keyboard', () => {
  it('allows typing and arrow keys in a custom input without zooming', () => {
    cy.mount(ImagePreview, {
      props: { src, defaultVisible: true },
      slots: { actions: () => h('input', { 'data-test': 'caption' }) },
    });
    cy.get('[data-test="caption"]').type('caption').should('have.value', 'caption');
    cy.get('[data-test="caption"]').trigger('keydown', { key: 'ArrowUp' });
    cy.get('.sd-image-preview-img-container').should(
      'have.css',
      'transform',
      'matrix(1, 0, 0, 1, 0, 0)',
    );
    cy.get('[data-test="caption"]').trigger('keydown', { key: 'Escape' });
    cy.get('.sd-image-preview-wrapper').should('not.exist');
  });

  it('leaves Tab available while preserving preview zoom shortcuts', () => {
    cy.mount(ImagePreview, { props: { src, defaultVisible: true } });
    cy.get('.sd-image-preview-wrapper').then(($wrapper) => {
      const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
      $wrapper[0].dispatchEvent(event);
      expect(event.defaultPrevented).to.equal(false);
    });
    cy.get('.sd-image-preview-wrapper').trigger('keydown', { key: 'ArrowUp' });
    cy.get('.sd-image-preview-img-container').should(
      'have.css',
      'transform',
      'matrix(1.1, 0, 0, 1.1, 0, 0)',
    );
  });
});
