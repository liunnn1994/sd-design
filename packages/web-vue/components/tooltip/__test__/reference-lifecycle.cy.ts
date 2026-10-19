import { h, ref } from 'vue';

import AutoTooltip from '../../_components/auto-tooltip/auto-tooltip.vue';
import Ellipsis, { PerformantEllipsis } from '../../ellipsis';
import Tooltip from '../index';

const label = 'A long label that overflows its container and needs a tooltip';

describe('Tooltip reference lifecycle', () => {
  for (const component of [Tooltip, Ellipsis, PerformantEllipsis, AutoTooltip]) {
    it(`closes ${component.name} when an ancestor is hidden without mouseleave`, () => {
      const hidden = ref(false);
      cy.mount({
        setup: () => () =>
          h('div', { style: { display: hidden.value ? 'none' : undefined } }, [
            h(
              component,
              {
                content: label,
                style: 'display: block; width: 80px; margin: 100px;',
              },
              {
                default: () =>
                  h(
                    'span',
                    {
                      class:
                        component === Tooltip
                          ? 'plain-reference reference-content'
                          : 'reference-content',
                      style: 'display: block; width: 80px;',
                    },
                    label,
                  ),
              },
            ),
          ]),
      });
      cy.get('.sd-ellipsis, .sd-performant-ellipsis, .plain-reference')
        .first()
        .trigger('mouseenter');
      cy.get('[role="tooltip"]').should('be.visible');
      cy.then(() => {
        hidden.value = true;
      });
      cy.get('[role="tooltip"]').should('not.be.visible');
      cy.then(() => {
        hidden.value = false;
      });
      cy.get('.reference-content').first().should('be.visible');
      cy.get('[role="tooltip"]').should('not.be.visible');
      cy.get('.sd-ellipsis, .sd-performant-ellipsis, .plain-reference')
        .first()
        .trigger('mouseenter');
      cy.get('[role="tooltip"]').should('be.visible');
    });
  }

  it('closes an open tooltip when disabled', () => {
    cy.mount(Tooltip, {
      props: { content: label, mouseEnterDelay: 0 },
      slots: { default: '<button>Reference</button>' },
    });
    cy.get('button').trigger('mouseenter');
    cy.get('[role="tooltip"]').should('be.visible');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ disabled: true }));
    cy.get('[role="tooltip"]').should('not.be.visible');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ disabled: false }));
    cy.get('[role="tooltip"]').should('not.be.visible');
  });

  it('closes when the reference DOM is removed without unmounting the tooltip', () => {
    cy.mount(Tooltip, {
      props: { content: label, mouseEnterDelay: 0 },
      slots: { default: '<button>Reference</button>' },
    });
    cy.get('button').trigger('mouseenter');
    cy.get('[role="tooltip"]').should('be.visible');
    cy.get('button').then(($button) => {
      $button[0].remove();
    });
    cy.get('[role="tooltip"]').should('not.be.visible');
  });

  it('suppresses a controlled tooltip while its reference is hidden', () => {
    const hidden = ref(false);
    cy.mount({
      setup: () => () =>
        h('div', { style: { display: hidden.value ? 'none' : undefined } }, [
          h(
            Tooltip,
            { content: label, popupVisible: true },
            {
              default: () => h('button', 'Reference'),
            },
          ),
        ]),
    });
    cy.get('[role="tooltip"]').should('be.visible');
    cy.then(() => {
      hidden.value = true;
    });
    cy.get('[role="tooltip"]').should('not.be.visible');
    cy.then(() => {
      hidden.value = false;
    });
    cy.get('[role="tooltip"]').should('be.visible');
  });

  it('removes a teleported tooltip when its component is unmounted', () => {
    cy.mount(Tooltip, {
      props: { content: label, mouseEnterDelay: 0 },
      slots: { default: '<button>Reference</button>' },
    });
    cy.get('button').trigger('mouseenter');
    cy.get('[role="tooltip"]').should('be.visible');
    cy.get('@vue').then(({ wrapper }) => wrapper.unmount());
    cy.get('[role="tooltip"]').should('not.exist');
  });
});
