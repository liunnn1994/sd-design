import { defineComponent, h, ref } from 'vue';

import Comment from '../index';

describe('Comment dynamic slots', () => {
  for (const slot of ['author', 'avatar', 'content', 'datetime']) {
    it(`adds and removes the ${slot} slot after mounting`, () => {
      cy.mount(
        defineComponent({
          setup() {
            const visible = ref(false);
            return () =>
              h('div', [
                h(
                  'button',
                  {
                    onClick: () => {
                      visible.value = !visible.value;
                    },
                  },
                  'Toggle',
                ),
                h(Comment, {}, visible.value ? { [slot]: () => h('span', 'Dynamic content') } : {}),
              ]);
          },
        }),
      );
      cy.get(`.sd-comment-${slot}`).should('not.exist');
      cy.contains('button', 'Toggle').click();
      cy.get(`.sd-comment-${slot}`).should('contain.text', 'Dynamic content');
      cy.contains('button', 'Toggle').click();
      cy.get(`.sd-comment-${slot}`).should('not.exist');
    });
  }
});
