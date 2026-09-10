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

  it('allows mouse events to pass through by default', () => {
    cy.mount(Tooltip, {
      props: { defaultPopupVisible: true, renderToBody: false },
      slots: { default: '<button>Button</button>', content: 'Content' },
    });
    cy.get('.sd-tooltip')
      .should('have.class', 'sd-tooltip-mouse-through')
      .and('have.css', 'pointer-events', 'none');
  });

  it('allows interacting with the tooltip when mouseThrough is false', () => {
    cy.mount(Tooltip, {
      props: { defaultPopupVisible: true, mouseThrough: false, renderToBody: false },
      slots: { default: '<button>Button</button>', content: 'Content' },
    });
    cy.get('.sd-tooltip')
      .should('not.have.class', 'sd-tooltip-mouse-through')
      .and('have.css', 'pointer-events', 'auto');
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

  it('shows for keyboard focus and removes the description relationship on blur', () => {
    cy.mount(Tooltip, {
      props: { content: 'Keyboard help', renderToBody: false, focusDelay: 0 },
      slots: { default: '<button>Button</button>' },
    });
    cy.get('button').focus().should('have.attr', 'aria-describedby');
    cy.get('button')
      .invoke('attr', 'aria-describedby')
      .then((popupId) => {
        cy.get(`#${popupId}`).should('have.attr', 'role', 'tooltip').and('be.visible');
      });
    cy.get('button').blur().should('not.have.attr', 'aria-describedby');
    cy.get('@vue').should(({ wrapper }) => {
      const events = wrapper.emitted('popupVisibleChange') ?? [];
      expect(events.map(([visible]) => visible)).to.deep.equal([true, false]);
    });
  });

  it('shows the content prop on hover and reports hidden after mouse leave', () => {
    cy.mount(Tooltip, {
      props: { content: 'Helpful text', renderToBody: false },
      slots: { default: '<button>Button</button>' },
    });
    cy.get('button').trigger('mouseenter');
    cy.get('.sd-trigger-popup-wrapper').should('be.visible');
    cy.get('.sd-tooltip-content').should('contain.text', 'Helpful text');
    // 隐藏依赖 Transition 动画事件，隐藏容器仍留在 DOM，用事件断言收尾
    cy.get('button').trigger('mouseleave');
    cy.get('@vue').should(({ wrapper }) => {
      const events = wrapper.emitted('popupVisibleChange') ?? [];
      expect(events.length, 'popupVisibleChange emitted').to.be.greaterThan(0);
      expect(events[events.length - 1][0]).to.equal(false);
    });
  });

  it('renders the content slot instead of the content prop', () => {
    cy.mount(Tooltip, {
      props: { content: 'Prop content', defaultPopupVisible: true, renderToBody: false },
      slots: { default: '<button>Button</button>', content: 'Slot content' },
    });
    cy.get('.sd-tooltip-content').should('contain.text', 'Slot content');
    cy.get('.sd-tooltip-content').should('not.contain.text', 'Prop content');
  });

  it('does not open on hover when disabled', () => {
    cy.mount(Tooltip, {
      props: { content: 'Content', disabled: true, renderToBody: false },
      slots: { default: '<button>Button</button>' },
    });
    cy.get('button').trigger('mouseenter');
    // disabled 时弹层内容根本不渲染
    cy.get('.sd-trigger-popup-wrapper').should('not.exist');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('popupVisibleChange'), 'no visible change emitted').to.equal(
        undefined,
      );
    });
  });

  it('supports a controlled popupVisible and emits update:popupVisible on hover', () => {
    cy.mount(Tooltip, {
      props: { popupVisible: false, renderToBody: false },
      slots: { default: '<button>Button</button>', content: 'Content' },
    });
    cy.get('button').trigger('mouseenter');
    // 受控 false：hover 只上报意图，气泡内容未渲染
    cy.get('.sd-trigger-popup-wrapper').should('not.exist');
    cy.get('@vue').should(({ wrapper }) => {
      const events = wrapper.emitted('update:popupVisible') ?? [];
      expect(events.length, 'update:popupVisible emitted').to.be.greaterThan(0);
      expect(events[events.length - 1][0]).to.equal(true);
    });

    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ popupVisible: true })));
    cy.get('.sd-trigger-popup-wrapper').should('be.visible');
  });

  it('applies backgroundColor to the content and the arrow', () => {
    cy.mount(Tooltip, {
      props: { backgroundColor: 'rgb(255, 0, 0)', defaultPopupVisible: true, renderToBody: false },
      slots: { default: '<button>Button</button>', content: 'Content' },
    });
    cy.get('.sd-tooltip-content').should('have.css', 'background-color', 'rgb(255, 0, 0)');
    cy.get('.sd-tooltip-popup-arrow').should('have.css', 'background-color', 'rgb(255, 0, 0)');
  });

  it('applies custom content and arrow class/style overrides', () => {
    cy.mount(Tooltip, {
      props: {
        defaultPopupVisible: true,
        renderToBody: false,
        contentClass: 'my-tooltip-content',
        contentStyle: { padding: '8px' },
        arrowClass: 'my-tooltip-arrow',
        arrowStyle: { borderRadius: '50%' },
      },
      slots: { default: '<button>Button</button>', content: 'Content' },
    });
    cy.get('.sd-tooltip-content')
      .should('have.class', 'my-tooltip-content')
      .and('have.css', 'padding', '8px');
    cy.get('.sd-tooltip-popup-arrow')
      .should('have.class', 'my-tooltip-arrow')
      .and('have.css', 'border-radius', '50%');
  });

  it('renders the mini size class on the content', () => {
    cy.mount(Tooltip, {
      props: { content: 'Content', mini: true, defaultPopupVisible: true, renderToBody: false },
      slots: { default: '<button>Button</button>' },
    });
    cy.get('.sd-tooltip-content').should('have.class', 'sd-tooltip-mini');
  });
});
