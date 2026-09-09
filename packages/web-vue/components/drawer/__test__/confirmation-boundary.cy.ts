import { defineComponent, h, ref } from 'vue';

import Drawer from '../drawer.vue';

describe('Drawer confirmation and title boundaries', () => {
  it('blocks a synchronously thrown confirmation and allows a successful retry', () => {
    let attempts = 0;
    cy.mount(Drawer, {
      props: {
        defaultVisible: true,
        renderToBody: false,
        onBeforeOk: () => {
          if (attempts++ === 0) throw new Error('Confirmation unavailable');
          return true;
        },
      },
    });
    cy.get('.sd-drawer-footer button').last().click();
    cy.then(() => Cypress.Promise.delay(0));
    cy.get('.sd-drawer').should('be.visible');
    cy.get('.sd-drawer-footer button').last().should('not.have.class', 'sd-btn-loading');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('ok')).to.equal(undefined);
    });
    cy.get('.sd-drawer-footer button').last().click();
    cy.get('.sd-drawer').should('not.be.visible');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('ok')).to.have.length(1);
    });
  });

  for (const slot of ['title', 'header'] as const) {
    it(`updates the accessible title when the ${slot} slot changes`, () => {
      const enabled = ref(false);
      cy.mount(
        defineComponent({
          setup: () => () =>
            h(
              Drawer,
              {
                defaultVisible: true,
                renderToBody: false,
                title: slot === 'header' ? 'Default title' : undefined,
              },
              {
                default: () =>
                  h(
                    'button',
                    {
                      onClick: () => {
                        enabled.value = !enabled.value;
                      },
                    },
                    'Toggle slot',
                  ),
                ...(enabled.value ? { [slot]: () => h('span', 'Slot title') } : {}),
              },
            ),
        }),
      );
      const assertLabel = (exists: boolean) => {
        if (exists) {
          cy.get('.sd-drawer-title').then(($title) => {
            cy.get('.sd-drawer').should('have.attr', 'aria-labelledby', $title.attr('id'));
          });
        } else {
          cy.get('.sd-drawer').should('not.have.attr', 'aria-labelledby');
        }
      };
      assertLabel(slot === 'header');
      cy.contains('button', 'Toggle slot').click();
      assertLabel(slot === 'title');
      cy.contains('button', 'Toggle slot').click();
      assertLabel(slot === 'header');
    });
  }
});
