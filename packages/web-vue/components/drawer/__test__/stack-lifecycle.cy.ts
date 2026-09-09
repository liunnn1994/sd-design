import { defineComponent, h, ref } from 'vue';

import Drawer from '../drawer.vue';

describe('Drawer stack lifecycle', () => {
  it('releases its popup stack entry when an open upper drawer unmounts', () => {
    const upper = ref(true);
    cy.mount(
      defineComponent({
        setup: () => () => [
          h(Drawer, { defaultVisible: true, title: 'Lower', renderToBody: false }),
          upper.value
            ? h(
                Drawer,
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
    cy.get('.sd-drawer').should('have.length', 1);
    cy.get('.sd-drawer').trigger('keydown', { key: 'Escape' });
    cy.get('.sd-drawer').should('not.be.visible');
  });

  it('unmounts after the real leave transition and opens fresh content again', () => {
    const visible = ref(false);
    const onOpen = cy.spy().as('opened');
    const onClose = cy.spy().as('closed');
    cy.mount(
      defineComponent({
        setup: () => () => [
          h(
            'button',
            {
              class: 'open-drawer',
              onClick: () => {
                visible.value = true;
              },
            },
            'Open',
          ),
          h(
            Drawer,
            {
              'visible': visible.value,
              'unmountOnClose': true,
              'onUpdate:visible': (value: boolean) => {
                visible.value = value;
              },
              onOpen,
              onClose,
            },
            { default: () => h('input', { class: 'drawer-input' }) },
          ),
        ],
      }),
      { global: { stubs: { 'transition': false, 'transition-group': false } } },
    );
    cy.get('.open-drawer').click();
    cy.get('@opened').should('have.been.calledOnce');
    cy.get('.drawer-input').type('Draft');
    cy.get('.sd-drawer-close-btn').click();
    cy.get('@closed').should('have.been.calledOnce');
    cy.get('.sd-drawer-container').should('not.exist');
    cy.get('.open-drawer').should('be.focused').click();
    cy.get('@opened').should('have.been.calledTwice');
    cy.get('.drawer-input').should('have.value', '');
    cy.get('@vue').then(({ wrapper }) => wrapper.unmount());
    cy.get('.sd-drawer-container').should('not.exist');
  });
});
