import { defineComponent, h, ref } from 'vue';

import Drawer from '../../drawer/drawer.vue';
import FilePreviewer from '../index';

describe('FilePreviewer popup lifecycle', () => {
  it('releases the popup stack when an open preview unmounts', () => {
    const preview = ref(true);
    cy.mount(
      defineComponent({
        setup: () => () => [
          h(Drawer, { defaultVisible: true, title: 'Lower drawer', renderToBody: false }),
          preview.value
            ? h(
                FilePreviewer,
                { defaultVisible: true, type: 'audio' },
                {
                  content: () =>
                    h('button', { onClick: () => (preview.value = false) }, 'Remove preview'),
                },
              )
            : null,
        ],
      }),
    );
    cy.contains('button', 'Remove preview').click();
    cy.get('.sd-file-previewer').should('not.exist');
    cy.get('.sd-drawer').trigger('keydown', { key: 'Escape' });
    cy.get('.sd-drawer').should('not.be.visible');
  });
});
