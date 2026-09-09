import { defineComponent, h, ref } from 'vue';

import FilePreviewer from '../index';

describe('FilePreviewer dynamic content', () => {
  for (const type of ['image', 'video'] as const) {
    it(`lets an inserted content slot take over the ${type} preview`, () => {
      const custom = ref(false);
      cy.mount(
        defineComponent({
          setup: () => () =>
            h(
              FilePreviewer,
              {
                type,
                defaultVisible: true,
                mediaProps: { skin: 'native' },
              },
              custom.value
                ? { content: () => h('div', { class: 'custom-preview' }, 'Custom content') }
                : {},
            ),
        }),
      );
      if (type === 'image') cy.get('.sd-image').should('exist');
      else cy.get('video.sd-file-previewer-video').should('exist');
      cy.then(() => {
        custom.value = true;
      });
      cy.get('.custom-preview').should('be.visible');
      cy.get('.sd-file-previewer-loading').should('not.exist');
      cy.then(() => {
        custom.value = false;
      });
      cy.get('.custom-preview').should('not.exist');
      if (type === 'image') cy.get('.sd-image').should('exist');
      else cy.get('video.sd-file-previewer-video').should('exist');
    });
  }
});
