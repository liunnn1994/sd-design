import { h, ref } from 'vue';

import Drawer from '../../drawer/drawer.vue';
import { ImagePreview } from '../index';

describe('Image preview popup lifecycle', () => {
  it('releases the popup stack when the open preview is removed', () => {
    const preview = ref(true);
    cy.mount({
      setup: () => () => [
        h(Drawer, { defaultVisible: true, title: 'Lower drawer', renderToBody: false }),
        preview.value ? h(ImagePreview, { defaultVisible: true }) : null,
      ],
    });
    cy.get('.sd-image-preview-wrapper').should('be.visible');
    cy.then(() => {
      preview.value = false;
    });
    cy.get('.sd-image-preview').should('not.exist');
    cy.get('.sd-drawer').trigger('keydown', { key: 'Escape' });
    cy.get('.sd-drawer').should('not.be.visible');
  });
});
