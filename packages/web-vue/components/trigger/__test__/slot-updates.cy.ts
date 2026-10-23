import { defineComponent, h, ref } from 'vue';

import Trigger from '../index';

describe('Trigger slot updates', () => {
  for (const autoFixPosition of [true, false]) {
    it(`updates a replaced slot snapshot with autoFixPosition=${autoFixPosition}`, () => {
      let initialElement: HTMLElement;
      cy.mount(
        defineComponent({
          setup() {
            const label = ref('Before');
            return () => {
              const snapshot = label.value;
              return h('div', [
                h(
                  'button',
                  { id: 'replace-slot', onClick: () => (label.value = 'After') },
                  'Replace',
                ),
                h(
                  Trigger,
                  { autoFixPosition },
                  {
                    default: () => h('button', { id: 'slot-target', title: snapshot }, snapshot),
                  },
                ),
              ]);
            };
          },
        }),
      );
      cy.get('#slot-target').then(($target) => {
        initialElement = $target[0];
      });
      cy.get('#replace-slot').click();
      cy.get('#slot-target')
        .should('have.text', 'After')
        .and('have.attr', 'title', 'After')
        .and(($target) => expect($target[0]).to.equal(initialElement));
    });
  }
});
