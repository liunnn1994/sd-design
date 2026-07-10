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
});
