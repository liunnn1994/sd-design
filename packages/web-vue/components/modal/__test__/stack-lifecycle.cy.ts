import { defineComponent, h, ref } from 'vue';

import Modal from '../modal.vue';

describe('Modal stack lifecycle', () => {
  it('releases its popup stack entry when an open upper modal unmounts', () => {
    const upper = ref(true);
    cy.mount(
      defineComponent({
        setup: () => () => [
          h(Modal, { defaultVisible: true, title: 'Lower', renderToBody: false }),
          upper.value
            ? h(
                Modal,
                {
                  defaultVisible: true,
                  title: 'Upper',
                  renderToBody: false,
                },
                {
                  default: () =>
                    h(
                      'button',
                      {
                        onClick: () => {
                          upper.value = false;
                        },
                      },
                      'Remove upper',
                    ),
                },
              )
            : null,
        ],
      }),
    );
    cy.contains('button', 'Remove upper').click();
    cy.get('.sd-modal').should('have.length', 1);
    cy.get('.sd-modal').trigger('keydown', { key: 'Escape' });
    cy.get('.sd-modal').should('not.be.visible');
  });
});
