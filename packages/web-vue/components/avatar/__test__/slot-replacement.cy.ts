import { defineComponent, h, ref } from 'vue';

import Avatar, { AvatarGroup } from '../index';

describe('Avatar slot replacement', () => {
  it('updates the group when a render function replaces its default slot', () => {
    cy.mount(
      defineComponent({
        setup() {
          const expanded = ref(false);
          return () => {
            const names = expanded.value ? ['A', 'B', 'C'] : ['A'];
            return [
              h('button', { onClick: () => (expanded.value = !expanded.value) }, 'Toggle'),
              h(AvatarGroup, { maxCount: 1 }, () =>
                names.map((name) => h(Avatar, { key: name }, () => name)),
              ),
            ];
          };
        },
      }),
    );
    cy.get('.sd-avatar-group-max-count-avatar').should('not.exist');
    cy.contains('button', 'Toggle').click();
    cy.get('.sd-avatar-group-max-count-avatar').should('contain.text', '+2');
    cy.contains('button', 'Toggle').click();
    cy.get('.sd-avatar-group-max-count-avatar').should('not.exist');
  });

  it('updates the image wrapper when a render function replaces text with an image', () => {
    cy.mount(
      defineComponent({
        setup() {
          const image = ref(false);
          return () => {
            const content = image.value ? h('img', { alt: 'Person' }) : 'A';
            return [
              h('button', { onClick: () => (image.value = !image.value) }, 'Toggle'),
              h(Avatar, {}, () => content),
            ];
          };
        },
      }),
    );
    cy.get('.sd-avatar-text').should('exist');
    cy.contains('button', 'Toggle').click();
    cy.get('.sd-avatar-image img').should('exist');
    cy.contains('button', 'Toggle').click();
    cy.get('.sd-avatar-text').should('contain.text', 'A');
  });
});
