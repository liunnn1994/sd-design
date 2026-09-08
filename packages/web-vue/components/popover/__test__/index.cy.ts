import Popover from '../index';

describe('Popover', () => {
  it('keeps the bordered arrow behind the popup content', () => {
    cy.mount(Popover, {
      props: {
        content: 'Popup content',
        defaultPopupVisible: true,
        position: 'bottom',
        renderToBody: false,
      },
      attrs: { style: 'max-width: 240px;' },
      slots: { default: '<button>Trigger</button>' },
    });
    cy.get('.sd-trigger-popup.sd-popover')
      .should('have.css', 'position', 'absolute')
      .and('have.css', 'max-width', '240px');
    cy.get('.sd-popover-popup-arrow')
      .should('have.css', 'z-index', '-1')
      .and(($arrow) => {
        const style = getComputedStyle($arrow[0]);
        const borderStyles = [
          style.borderTopStyle,
          style.borderRightStyle,
          style.borderBottomStyle,
          style.borderLeftStyle,
        ];
        expect(borderStyles.filter((value) => value === 'none')).to.have.length(2);
      });
  });

  it('wires aria-haspopup/expanded on the trigger and closes on ESC', () => {
    cy.mount(Popover, {
      props: {
        trigger: 'click',
        content: 'Popup content',
        defaultPopupVisible: true,
        renderToBody: false,
      },
      slots: { default: '<button>Trigger</button>' },
    });
    cy.get('button').should('have.attr', 'aria-haspopup', 'true');
    cy.get('button').should('have.attr', 'aria-expanded', 'true');
    // ESC 关闭（aria-expanded 翻 false）
    cy.document().trigger('keydown', { key: 'Escape' });
    cy.get('button').should('have.attr', 'aria-expanded', 'false');
  });

  it('opens on hover and closes on mouse leave, emitting popupVisibleChange', () => {
    cy.mount(Popover, {
      props: {
        trigger: 'hover',
        content: 'Popup content',
        renderToBody: false,
      },
      slots: { default: '<button>Trigger</button>' },
    });
    cy.get('button').trigger('mouseenter');
    cy.get('.sd-trigger-popup-wrapper').should('be.visible');
    cy.get('button').should('have.attr', 'aria-expanded', 'true');
    cy.get('@vue').should(({ wrapper }) => {
      const events = wrapper.emitted('popupVisibleChange') ?? [];
      expect(events).to.have.length(1);
      expect(events[0][0]).to.equal(true);
    });

    cy.get('button').trigger('mouseleave');
    cy.get('button').should('have.attr', 'aria-expanded', 'false');
    cy.get('.sd-trigger-popup-wrapper').should('not.be.visible');
    cy.get('@vue').should(({ wrapper }) => {
      const events = wrapper.emitted('popupVisibleChange') ?? [];
      expect(events).to.have.length(2);
      expect(events[1][0]).to.equal(false);
    });
  });

  it('toggles on click and emits update:popupVisible', () => {
    cy.mount(Popover, {
      props: {
        trigger: 'click',
        content: 'Popup content',
        renderToBody: false,
      },
      slots: { default: '<button>Trigger</button>' },
    });
    cy.get('button').click();
    cy.get('.sd-trigger-popup-wrapper').should('be.visible');
    cy.get('@vue').should(({ wrapper }) => {
      const events = wrapper.emitted('update:popupVisible') ?? [];
      expect(events).to.have.length(1);
      expect(events[0][0]).to.equal(true);
    });

    cy.get('button').click();
    cy.get('.sd-trigger-popup-wrapper').should('not.be.visible');
    cy.get('button').should('have.attr', 'aria-expanded', 'false');
    cy.get('@vue').should(({ wrapper }) => {
      const events = wrapper.emitted('update:popupVisible') ?? [];
      expect(events).to.have.length(2);
      expect(events[1][0]).to.equal(false);
    });
  });

  it('opens on focus and closes on blur', () => {
    cy.mount(Popover, {
      props: {
        trigger: 'focus',
        content: 'Popup content',
        renderToBody: false,
      },
      slots: { default: '<button>Trigger</button>' },
    });
    cy.get('button').focus();
    cy.get('.sd-trigger-popup-wrapper').should('be.visible');
    cy.get('button').should('have.attr', 'aria-expanded', 'true');

    cy.get('button').blur();
    cy.get('button').should('have.attr', 'aria-expanded', 'false');
    cy.get('.sd-trigger-popup-wrapper').should('not.be.visible');
  });

  it('opens on right click and closes on left click', () => {
    cy.mount(Popover, {
      props: {
        trigger: 'contextMenu',
        content: 'Popup content',
        renderToBody: false,
      },
      slots: { default: '<button>Trigger</button>' },
    });
    cy.get('button').rightclick();
    cy.get('.sd-trigger-popup-wrapper').should('be.visible');
    cy.get('button').should('have.attr', 'aria-expanded', 'true');

    cy.get('button').click();
    cy.get('.sd-trigger-popup-wrapper').should('not.be.visible');
    cy.get('button').should('have.attr', 'aria-expanded', 'false');
  });

  it('stays visible in controlled mode and only emits update:popupVisible', () => {
    cy.mount(Popover, {
      props: {
        trigger: 'click',
        content: 'Popup content',
        popupVisible: true,
        renderToBody: false,
      },
      slots: { default: '<button>Trigger</button>' },
    });
    cy.get('.sd-trigger-popup-wrapper').should('be.visible');

    cy.get('button').click();
    cy.get('.sd-trigger-popup-wrapper').should('be.visible');
    cy.get('@vue').should(({ wrapper }) => {
      const events = wrapper.emitted('update:popupVisible') ?? [];
      expect(events).to.have.length(1);
      expect(events[0][0]).to.equal(false);
    });
  });

  it('applies the position prop to the popup element', () => {
    cy.mount(Popover, {
      props: {
        content: 'Popup content',
        defaultPopupVisible: true,
        position: 'right',
        renderToBody: false,
      },
      slots: { default: '<button>Trigger</button>' },
    });
    cy.get('.sd-trigger-popup')
      .should('have.class', 'sd-trigger-position-right')
      .and('have.attr', 'trigger-placement', 'right');
  });

  it('renders title/content props and lets slots override them', () => {
    cy.mount(Popover, {
      props: {
        title: 'Title A',
        content: 'Content A',
        defaultPopupVisible: true,
        renderToBody: false,
      },
      slots: { default: '<button>Trigger</button>' },
    });
    cy.get('.sd-popover-title').should('have.text', 'Title A');
    cy.get('.sd-popover-content').should('have.text', 'Content A');

    cy.mount(Popover, {
      props: {
        title: 'Title A',
        content: 'Content A',
        defaultPopupVisible: true,
        renderToBody: false,
      },
      slots: {
        default: '<button>Trigger</button>',
        title: '<span class="slot-title">Title B</span>',
        content: '<span class="slot-content">Content B</span>',
      },
    });
    cy.get('.sd-popover-title .slot-title').should('have.text', 'Title B');
    cy.get('.sd-popover-content .slot-content').should('have.text', 'Content B');
  });

  it('applies contentClass/contentStyle and arrowClass to the popup', () => {
    cy.mount(Popover, {
      props: {
        content: 'Popup content',
        defaultPopupVisible: true,
        renderToBody: false,
        contentClass: 'custom-content',
        contentStyle: { background: 'rgb(18, 52, 86)' },
        arrowClass: 'custom-arrow',
      },
      slots: { default: '<button>Trigger</button>' },
    });
    cy.get('.sd-trigger-content.custom-content').should(
      'have.css',
      'background-color',
      'rgb(18, 52, 86)',
    );
    cy.get('.sd-popover-popup-arrow.custom-arrow').should('exist');
  });

  it('renders the content without an embedded Scrollbar when scrollbar is false', () => {
    cy.mount(Popover, {
      props: {
        content: 'Popup content',
        defaultPopupVisible: true,
        renderToBody: false,
        scrollbar: false,
      },
      slots: { default: '<button>Trigger</button>' },
    });
    cy.get('.sd-popover-content').should('exist').and('not.have.class', 'sd-scrollbar');

    // 默认行为不变：embed Scrollbar 包裹内容
    cy.mount(Popover, {
      props: {
        content: 'Popup content',
        defaultPopupVisible: true,
        renderToBody: false,
      },
      slots: { default: '<button>Trigger</button>' },
    });
    cy.get('.sd-popover-content').should('have.class', 'sd-scrollbar-type-embed');
  });

  it('mounts the popup into the popupContainer element', () => {
    cy.mount(Popover, {
      props: {
        content: 'Popup content',
        defaultPopupVisible: true,
        popupContainer: 'body',
      },
      slots: { default: '<button>Trigger</button>' },
    });
    // renderToBody 默认 true 时 teleport 到 popupContainer（body）
    cy.get('.sd-trigger-popup.sd-popover').should(($popup) => {
      const parent = $popup[0].parentElement;
      expect(parent?.tagName).to.equal('BODY');
    });
  });
});
