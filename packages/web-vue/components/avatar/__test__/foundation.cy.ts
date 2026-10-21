import { defineComponent, h, ref } from 'vue';

import Avatar, { AvatarGroup } from '../index';

describe('Avatar foundation adapter', () => {
  it('refreshes native group indices, stacking and inherited size after keyed reorder', () => {
    cy.mount(
      defineComponent({
        setup() {
          const changed = ref(false);
          return () => [
            h(
              'button',
              {
                onClick: () => {
                  changed.value = true;
                },
              },
              'Reorder',
            ),
            h(
              AvatarGroup,
              {
                size: changed.value ? 80 : 64,
                shape: changed.value ? 'square' : 'circle',
                zIndexAscend: changed.value,
              },
              () =>
                (changed.value ? ['B', 'A', 'C'] : ['A', 'B', 'C']).map((name) =>
                  h(Avatar, { 'key': name, 'size': 24, 'data-person': name }, () => name),
                ),
            ),
          ];
        },
      }),
    );
    cy.get('.sd-avatar-group > .sd-avatar')
      .first()
      .should(($avatar) => {
        expect($avatar).to.have.attr('data-person', 'A');
        expect($avatar).to.have.css('z-index', '3');
      });
    cy.contains('button', 'Reorder').click();
    cy.get('.sd-avatar-group > .sd-avatar')
      .first()
      .should(($avatar) => {
        expect($avatar).to.have.attr('data-person', 'B');
        expect($avatar).to.have.css('z-index', '1');
        expect($avatar).to.have.css('width', '80px');
        expect($avatar).to.have.class('sd-avatar-square');
        expect($avatar).to.have.css('margin-left', '0px');
      });
    cy.get('.sd-avatar-group > .sd-avatar')
      .eq(1)
      .should(($avatar) => {
        expect($avatar).to.have.attr('data-person', 'A');
        expect($avatar).to.have.css('z-index', '2');
        expect($avatar).to.have.css('margin-left', '-20px');
      });
  });
});
