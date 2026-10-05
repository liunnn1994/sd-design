import { defineComponent, h, ref } from 'vue';

import Drawer from '../../drawer/drawer.vue';
import FilePreviewer from '../index';

describe('FilePreviewer shared scroll container', () => {
  let container: HTMLElement;
  afterEach(() => {
    cy.get('@vue').then(({ wrapper }) => wrapper.unmount());
    cy.then(() => container.remove());
  });

  for (const lowerIsDrawer of [false, true]) {
    it(`retains the lock after closing the owner above another ${lowerIsDrawer ? 'drawer' : 'preview'}`, () => {
      const lower = ref(true);
      const upper = ref(true);
      cy.document().then((doc) => {
        container = doc.createElement('div');
        container.id = 'scroll-fixture';
        container.style.cssText = 'height:100px;overflow:auto;position:relative';
        const content = doc.createElement('div');
        content.style.height = '500px';
        container.appendChild(content);
        doc.body.appendChild(container);
      });
      cy.mount(
        defineComponent({
          setup: () => () => [
            h(
              lowerIsDrawer ? Drawer : FilePreviewer,
              {
                visible: lower.value,
                popupContainer: '#scroll-fixture',
                ...(lowerIsDrawer ? {} : { type: 'audio' }),
              },
              { content: () => 'Lower content' },
            ),
            h(
              FilePreviewer,
              { visible: upper.value, popupContainer: '#scroll-fixture', type: 'audio' },
              { content: () => 'Upper content' },
            ),
          ],
        }),
        { global: { stubs: { 'transition': false, 'transition-group': false } } },
      );
      cy.get('#scroll-fixture').should('have.css', 'overflow', 'hidden');
      cy.then(() => {
        (lowerIsDrawer ? upper : lower).value = false;
      });
      cy.get('.sd-file-previewer').should('have.length', lowerIsDrawer ? 0 : 1);
      cy.get('#scroll-fixture').should('have.css', 'overflow', 'hidden');
      cy.then(() => {
        (lowerIsDrawer ? lower : upper).value = false;
      });
      cy.get('#scroll-fixture').should('have.css', 'overflow', 'auto');
    });
  }
});
