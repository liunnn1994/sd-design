import { defineComponent, h } from 'vue';

import Tooltip from '../index';

describe('Tooltip', () => {
  it('renders tooltips in every position', () => {
    cy.mount(
      defineComponent({
        render() {
          return h(
            'div',
            ['top', 'tl', 'tr', 'bottom', 'bl', 'br', 'left', 'lt', 'lb', 'right', 'rt', 'rb'].map(
              (item) =>
                h(
                  Tooltip,
                  {
                    content: 'content',
                    defaultPopupVisible: true,
                    position: item,
                    renderToBody: false,
                  },
                  { default: () => h('button', `Button-${item}`) },
                ),
            ),
          );
        },
      }),
    );
    cy.get('.sd-tooltip').should('exist');
  });

  it('emits popupVisibleChange on enter and leave', () => {
    cy.mount(Tooltip, {
      props: { mouseEnterDelay: 0, mouseLeaveDelay: 0 },
      slots: { default: '<button>Button</button>', content: 'Content' },
    });
    cy.get('button').trigger('mouseenter');
    cy.get('button').trigger('mouseleave');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('popupVisibleChange')).to.have.length(2);
    });
  });

  it('wires aria-describedby on the trigger to the role=tooltip popup', () => {
    cy.mount(Tooltip, {
      props: { defaultPopupVisible: true, renderToBody: false },
      slots: { default: '<button>Button</button>', content: 'Helpful text' },
    });
    // 弹出层是 role=tooltip，且触发器 aria-describedby 指向它
    cy.get('[role="tooltip"]').should('exist');
    cy.get('button').then(($btn) => {
      const describedBy = $btn.attr('aria-describedby');
      expect(describedBy, 'trigger has aria-describedby').to.be.a('string');
      cy.get(`#${describedBy}`).should('have.attr', 'role', 'tooltip');
    });
  });
});
