import { h, nextTick, ref } from 'vue';

import Tooltip from '../../tooltip';
import Trigger from '../index';

describe('Nested tooltip closing animation', () => {
  for (const controlled of [false, true]) {
    it(`hides a nested tooltip as its parent starts leaving, controlled=${controlled}`, () => {
      const open = ref(true);
      cy.mount(
        {
          setup: () => () =>
            h(
              Trigger,
              {
                popupVisible: open.value,
                duration: 1000,
                animationName: 'slide-dynamic-origin',
              },
              {
                default: () => h('button', 'Parent'),
                content: () =>
                  h('div', { class: 'parent-popup-body' }, [
                    h(
                      Tooltip,
                      {
                        content: 'Nested help',
                        popupVisible: controlled ? true : undefined,
                        mouseEnterDelay: 0,
                      },
                      { default: () => h('button', { class: 'nested-reference' }, 'Nested') },
                    ),
                  ]),
              },
            ),
        },
        { global: { stubs: { transition: false } } },
      );
      cy.get('.nested-reference').trigger('mouseenter');
      cy.get('[role="tooltip"]').should('be.visible');
      cy.get('[role="tooltip"]').then(async ($tooltip) => {
        open.value = false;
        await nextTick();
        expect(
          $tooltip[0].checkVisibility({ checkVisibilityCSS: true }),
          'hidden before a closing frame is painted',
        ).to.equal(false);
      });
      cy.get('.parent-popup-body').should('not.be.visible');
      cy.get('[role="tooltip"]').should('not.be.visible');
    });
  }

  it('keeps a tooltip in the trigger slot usable while the parent popup is closed', () => {
    cy.mount(Trigger, {
      props: { popupVisible: false },
      slots: {
        default: () =>
          h(
            Tooltip,
            { content: 'Trigger help', mouseEnterDelay: 0 },
            {
              default: () => h('button', 'Reference'),
            },
          ),
        content: () => h('div', 'Closed popup'),
      },
      global: { stubs: { transition: false } },
    });
    cy.get('button').trigger('mouseenter');
    cy.get('[role="tooltip"]').should('be.visible');
  });

  it('restores a controlled tooltip when its parent reopens before leaving completes', () => {
    const open = ref(true);
    cy.mount(
      {
        setup: () => () =>
          h(
            Trigger,
            {
              popupVisible: open.value,
              duration: 1000,
              animationName: 'slide-dynamic-origin',
            },
            {
              default: () => h('button', 'Parent'),
              content: () =>
                h(
                  Tooltip,
                  { content: 'Nested help', popupVisible: true },
                  {
                    default: () => h('button', { class: 'nested-reference' }, 'Nested'),
                  },
                ),
            },
          ),
      },
      { global: { stubs: { transition: false } } },
    );
    cy.get('.nested-reference')
      .closest('.sd-trigger-popup-wrapper')
      .should('not.have.class', 'slide-dynamic-origin-enter-active');
    cy.get('[role="tooltip"]').should('be.visible');
    cy.get('.nested-reference').then(async ($reference) => {
      const reference = $reference[0];
      const width = reference.offsetWidth;
      const height = reference.offsetHeight;
      open.value = false;
      await nextTick();
      expect(
        reference
          .closest('.sd-trigger-popup-wrapper')
          ?.classList.contains('slide-dynamic-origin-leave-active'),
      ).to.equal(true);
      expect(
        reference.ownerDocument
          .querySelector('[role="tooltip"]')!
          .checkVisibility({ checkVisibilityCSS: true }),
      ).to.equal(false);
      open.value = true;
      await nextTick();
      expect(reference.offsetWidth).to.equal(width);
      expect(reference.offsetHeight).to.equal(height);
    });
    cy.get('[role="tooltip"]').should('be.visible');
  });
});
