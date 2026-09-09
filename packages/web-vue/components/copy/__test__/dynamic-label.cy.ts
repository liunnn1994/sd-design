import { defineComponent, h, ref } from 'vue';

import Copy from '../index';

describe('Copy dynamic accessible name', () => {
  it('updates the accessible name when consumer attributes change', () => {
    cy.mount(
      defineComponent({
        setup() {
          const label = ref('Copy first');
          return () =>
            h('div', [
              h(
                'button',
                {
                  onClick: () => {
                    label.value = 'Copy second';
                  },
                },
                'Update label',
              ),
              h(Copy, { 'content': 'Text', 'aria-label': label.value }),
            ]);
        },
      }),
    );
    cy.get('.sd-copy').should('have.attr', 'aria-label', 'Copy first');
    cy.contains('button', 'Update label').click();
    cy.get('.sd-copy').should('have.attr', 'aria-label', 'Copy second');
  });

  it('restores an icon-only name when the visible text slot is removed', () => {
    cy.mount(
      defineComponent({
        setup() {
          const text = ref(true);
          return () =>
            h('div', [
              h(
                'button',
                {
                  onClick: () => {
                    text.value = !text.value;
                  },
                },
                'Toggle text',
              ),
              h(
                Copy,
                { content: 'Text', tooltip: 'Copy text' },
                text.value ? { default: () => 'Visible text' } : {},
              ),
            ]);
        },
      }),
    );
    cy.get('.sd-copy').should('not.have.attr', 'aria-label');
    cy.contains('button', 'Toggle text').click();
    cy.get('.sd-copy').should('have.attr', 'aria-label', 'Copy text');
    cy.contains('button', 'Toggle text').click();
    cy.get('.sd-copy').should('not.have.attr', 'aria-label');
    cy.get('.sd-copy').should('contain.text', 'Visible text');
  });
});
