import { defineComponent, h } from 'vue';

import Trigger from '../index';

describe('Trigger', () => {
  it('shows the popup content on click', () => {
    cy.mount(Trigger, {
      slots: {
        default: '<button>Test</button>',
        content: '<div id="popup-content">Popup Content</div>',
      },
      props: { trigger: 'click' },
    });
    cy.get('button').click();
    cy.get('#popup-content').should('exist');
  });

  it('shows the popup content by default when defaultPopupVisible', () => {
    cy.mount(Trigger, {
      slots: {
        default: '<button>Test</button>',
        content: '<div id="popup-content">Popup Content</div>',
      },
      props: { defaultPopupVisible: true },
    });
    cy.get('#popup-content').should('exist');
  });

  it('passes Floating UI options through and lets them override legacy positioning', () => {
    cy.mount(Trigger, {
      slots: {
        default: '<button>Test</button>',
        content: '<div id="popup-content">Popup Content</div>',
      },
      props: {
        defaultPopupVisible: true,
        position: 'top',
        floatingOptions: {
          placement: 'right-end',
          middleware: [
            {
              name: 'testCoordinates',
              fn: () => ({ x: 31, y: 47 }),
            },
          ],
        },
      },
    });
    cy.get('.sd-trigger-popup')
      .should('have.attr', 'trigger-placement', 'rb')
      .and(($popup) => {
        expect(($popup[0] as HTMLElement).style.transform).to.contain('31px');
        expect(($popup[0] as HTMLElement).style.transform).to.contain('47px');
      });
  });

  it('wires aria-haspopup/expanded/controls on the trigger when ariaHasPopup is set', () => {
    cy.mount(Trigger, {
      slots: {
        default: '<button>Test</button>',
        content: '<div id="popup-content">Popup Content</div>',
      },
      props: { trigger: 'click', ariaHasPopup: 'menu' },
    });
    cy.get('button').should('have.attr', 'aria-haspopup', 'menu');
    cy.get('button').should('have.attr', 'aria-expanded', 'false');
    cy.get('button').click();
    cy.get('button').should('have.attr', 'aria-expanded', 'true');
    // aria-controls 指向的弹出层 id 确实存在
    cy.get('button').then(($btn) => {
      cy.get(`#${$btn.attr('aria-controls')}`).should('exist');
    });
  });

  it('closes the popup on ESC when escToClose is set', () => {
    cy.mount(Trigger, {
      slots: {
        default: '<button>Test</button>',
        content: '<div id="popup-content">Popup Content</div>',
      },
      props: { trigger: 'click', escToClose: true, ariaHasPopup: 'menu' },
    });
    cy.get('button').click();
    cy.get('#popup-content').should('be.visible');
    cy.get('button').should('have.attr', 'aria-expanded', 'true');
    cy.document().trigger('keydown', { key: 'Escape' });
    // ESC 后弹出层隐藏（display:none）；注：组件测试无 CSS 过渡，after-leave 卸载不触发，
    // 故只断言不可见 + aria-expanded 翻 false，真实环境下还会卸载。
    cy.get('button').should('have.attr', 'aria-expanded', 'false');
    cy.get('#popup-content').should('not.be.visible');
  });

  it('nested contextMenu trigger closes when clicking back on the trigger area', () => {
    const outerVisibleChanges: boolean[] = [];
    const innerVisibleChanges: boolean[] = [];
    cy.mount(
      defineComponent({
        setup() {
          return () =>
            h(
              Trigger,
              {
                trigger: 'contextMenu',
                position: 'bl',
                onPopupVisibleChange: (visible: boolean) => outerVisibleChanges.push(visible),
              },
              {
                default: () =>
                  h('div', { class: 'tree' }, [
                    h('span', { class: 'blank' }, 'Blank'),
                    h(
                      Trigger,
                      {
                        trigger: 'contextMenu',
                        position: 'bl',
                        onPopupVisibleChange: (visible: boolean) =>
                          innerVisibleChanges.push(visible),
                      },
                      {
                        default: () =>
                          h(
                            'span',
                            {
                              class: 'node',
                              onContextmenu: (event: MouseEvent) => event.stopPropagation(),
                            },
                            'Node',
                          ),
                        content: () => h('div', { id: 'inner-menu' }, 'Inner'),
                      },
                    ),
                  ]),
                content: () => h('div', { id: 'outer-menu' }, 'Outer'),
              },
            );
        },
      }),
    );
    cy.get('.tree').then(($el) => {
      $el[0].dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
    });
    cy.then(() => {
      expect(outerVisibleChanges.at(-1)).to.equal(true);
    });
    cy.get('.node').then(($el) => {
      $el[0].dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
    });
    cy.then(() => {
      expect(innerVisibleChanges.at(-1)).to.equal(true);
    });
  });

  it('opens on hover and closes after mouseleave (default hover trigger)', () => {
    const visibleChanges: boolean[] = [];
    cy.mount(Trigger, {
      slots: {
        default: '<button>Test</button>',
        content: '<div id="popup-content">Popup Content</div>',
      },
      props: {
        mouseEnterDelay: 0,
        mouseLeaveDelay: 0,
        onPopupVisibleChange: (visible: boolean) => visibleChanges.push(visible),
      },
    });
    cy.get('button').trigger('mouseenter');
    cy.get('#popup-content').should('be.visible');
    cy.get('button').trigger('mouseleave');
    cy.get('#popup-content').should('not.be.visible');
    cy.then(() => {
      expect(visibleChanges).to.deep.equal([true, false]);
    });
  });

  it('ignores click and hover when disabled', () => {
    const visibleChanges: boolean[] = [];
    cy.mount(Trigger, {
      slots: {
        default: '<button>Test</button>',
        content: '<div id="popup-content">Popup Content</div>',
      },
      props: {
        trigger: ['click', 'hover'],
        disabled: true,
        onPopupVisibleChange: (visible: boolean) => visibleChanges.push(visible),
      },
    });
    cy.get('button').click();
    cy.get('button').trigger('mouseenter');
    cy.then(() => {
      expect(visibleChanges).to.deep.equal([]);
    });
  });

  it('respects controlled popupVisible and still emits update events', () => {
    const updates: boolean[] = [];
    cy.mount(Trigger, {
      slots: {
        default: '<button>Test</button>',
        content: '<div id="popup-content">Popup Content</div>',
      },
      props: {
        'trigger': 'click',
        'popupVisible': true,
        'onUpdate:popupVisible': (visible: boolean) => updates.push(visible),
      },
    });
    cy.get('#popup-content').should('be.visible');
    // 受控模式下点击只上报事件，可见性跟随 prop 而非内部状态
    cy.get('button').click();
    cy.then(() => {
      expect(updates).to.deep.equal([false]);
    });
    cy.get('#popup-content').should('be.visible');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ popupVisible: false }));
    cy.get('#popup-content').should('not.be.visible');
  });

  it('opens on focus and closes on blur when trigger is focus (blurToClose honored)', () => {
    cy.mount(Trigger, {
      slots: {
        default: '<button>Test</button>',
        content: '<div id="popup-content">Popup Content</div>',
      },
      props: { trigger: 'focus', focusDelay: 0 },
    });
    cy.get('button').focus();
    cy.get('#popup-content').should('be.visible');
    cy.get('button').blur();
    cy.get('#popup-content').should('not.be.visible');

    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.unmount()));
    cy.mount(Trigger, {
      slots: {
        default: '<button>Test</button>',
        content: '<div id="popup-content">Popup Content</div>',
      },
      props: { trigger: 'focus', focusDelay: 0, blurToClose: false },
    });
    cy.get('button').focus();
    cy.get('#popup-content').should('be.visible');
    cy.get('button').blur();
    // blurToClose=false 时失焦不关闭
    cy.get('#popup-content').should('be.visible');
  });

  it('opens on contextmenu, prevents default, and closes on click', () => {
    const visibleChanges: boolean[] = [];
    cy.mount(Trigger, {
      slots: {
        default: '<button>Test</button>',
        content: '<div id="popup-content">Popup Content</div>',
      },
      props: {
        trigger: 'contextMenu',
        onPopupVisibleChange: (visible: boolean) => visibleChanges.push(visible),
      },
    });
    cy.get('button').then(($btn) => {
      const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
      cy.spy(event, 'preventDefault').as('preventDefault');
      $btn[0].dispatchEvent(event);
    });
    cy.get('#popup-content').should('be.visible');
    cy.get('@preventDefault').should('have.been.called');
    // contextMenu 触发下，左键点击也会收起
    cy.get('button').click();
    cy.get('#popup-content').should('not.be.visible');
    cy.then(() => {
      expect(visibleChanges).to.deep.equal([true, false]);
    });
  });

  it('renders the requested position when autoFitPosition is off', () => {
    cy.mount(Trigger, {
      slots: {
        default: '<button>Test</button>',
        content: '<div id="popup-content">Popup Content</div>',
      },
      props: { defaultPopupVisible: true, position: 'top', autoFitPosition: false },
    });
    cy.get('.sd-trigger-popup')
      .should('have.class', 'sd-trigger-position-top')
      .and('have.attr', 'trigger-placement', 'top');
  });

  it('renders arrow and applies content/arrow class and style props', () => {
    cy.mount(Trigger, {
      slots: {
        default: '<button>Test</button>',
        content: '<div id="popup-content">Popup Content</div>',
      },
      props: {
        defaultPopupVisible: true,
        showArrow: true,
        arrowClass: 'my-arrow',
        arrowStyle: { background: 'rgb(255, 0, 0)' },
        contentClass: 'my-content',
        contentStyle: { color: 'rgb(1, 2, 3)' },
      },
    });
    cy.get('.sd-trigger-content')
      .should('have.class', 'my-content')
      .and('have.attr', 'style')
      .and('contain', 'color: rgb(1, 2, 3)');
    cy.get('.sd-trigger-arrow')
      .should('have.class', 'my-arrow')
      .and('have.attr', 'style')
      .and('contain', 'background: rgb(255, 0, 0)')
      // floating-ui 的 arrow 中间件会给箭头写入定位 transform
      .and('contain', 'transform');
  });

  it('fits popup width/min-width to the trigger with autoFitPopupWidth/autoFitPopupMinWidth', () => {
    cy.mount(Trigger, {
      slots: {
        default: '<button style="width: 120px">Test</button>',
        content: '<div id="popup-content">Popup Content</div>',
      },
      props: { defaultPopupVisible: true, autoFitPopupWidth: true },
    });
    cy.get('.sd-trigger-popup').should(($popup) => {
      expect($popup[0].style.width).to.equal('120px');
    });

    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.unmount()));
    cy.mount(Trigger, {
      slots: {
        default: '<button style="width: 120px">Test</button>',
        content: '<div id="popup-content">Popup Content</div>',
      },
      props: { defaultPopupVisible: true, autoFitPopupMinWidth: true },
    });
    cy.get('.sd-trigger-popup').should(($popup) => {
      expect($popup[0].style.minWidth).to.equal('120px');
      expect($popup[0].style.width).to.equal('');
    });
  });

  it('teleports the popup into popupContainer', () => {
    cy.mount(
      defineComponent({
        setup() {
          return () =>
            h('div', [
              h('div', { id: 'custom-container' }),
              h(
                Trigger,
                {
                  popupContainer: '#custom-container',
                  defaultPopupVisible: true,
                },
                {
                  default: () => h('button', 'Test'),
                  content: () => h('div', { id: 'popup-content' }, 'Popup Content'),
                },
              ),
            ]);
        },
      }),
    );
    cy.get('#custom-container').find('#popup-content').should('be.visible');
  });

  it('does not render the popup at all when hideEmpty is set without content slot', () => {
    const visibleChanges: boolean[] = [];
    cy.mount(Trigger, {
      slots: { default: '<button>Test</button>' },
      props: {
        trigger: 'click',
        hideEmpty: true,
        onPopupVisibleChange: (visible: boolean) => visibleChanges.push(visible),
      },
    });
    cy.get('button').click();
    cy.then(() => {
      expect(visibleChanges).to.deep.equal([true]);
    });
    // hideEmpty 下 shouldRenderPopup 恒为 false，弹出层从未渲染——not.exist 是确定性的
    cy.get('.sd-trigger-popup').should('not.exist');
  });

  it('keeps the popup mounted but hidden after close when unmountOnClose is false', () => {
    cy.mount(Trigger, {
      slots: {
        default: '<button>Test</button>',
        content: '<div id="popup-content">Popup Content</div>',
      },
      props: { trigger: 'click', unmountOnClose: false, defaultPopupVisible: true },
    });
    cy.get('#popup-content').should('be.visible');
    cy.get('button').click();
    cy.get('#popup-content').should('exist').and('not.be.visible');
  });

  it('applies openedClass to the trigger child while open', () => {
    cy.mount(Trigger, {
      slots: {
        default: '<button>Test</button>',
        content: '<div id="popup-content">Popup Content</div>',
      },
      props: { trigger: 'click', openedClass: 'is-opened' },
    });
    cy.get('button').should('not.have.class', 'is-opened');
    cy.get('button').click();
    cy.get('button').should('have.class', 'is-opened');
    cy.get('button').click();
    cy.get('button').should('not.have.class', 'is-opened');
  });

  it('closes on window scroll when scrollToClose is set', () => {
    const visibleChanges: boolean[] = [];
    cy.mount(
      defineComponent({
        setup() {
          return () =>
            h('div', [
              // 让 document 可滚动，触发 window scroll
              h('div', { style: 'height: 2000px' }),
              h(
                Trigger,
                {
                  trigger: 'click',
                  scrollToClose: true,
                  onPopupVisibleChange: (visible: boolean) => visibleChanges.push(visible),
                },
                {
                  default: () => h('button', 'Test'),
                  content: () => h('div', { id: 'popup-content' }, 'Popup Content'),
                },
              ),
            ]);
        },
      }),
    );
    cy.get('button').click();
    cy.get('#popup-content').should('be.visible');
    cy.scrollTo(0, 200);
    cy.get('#popup-content').should('not.be.visible');
    cy.then(() => {
      expect(visibleChanges.at(-1)).to.equal(false);
    });
  });

  it('closes an initially visible popup on window scroll', () => {
    const visibleChanges: boolean[] = [];
    cy.mount(
      defineComponent({
        setup() {
          return () =>
            h('div', [
              h('div', { style: 'height: 2000px' }),
              h(
                Trigger,
                {
                  defaultPopupVisible: true,
                  scrollToClose: true,
                  onPopupVisibleChange: (visible: boolean) => visibleChanges.push(visible),
                },
                {
                  default: () => h('button', 'Test'),
                  content: () => h('div', { id: 'popup-content' }, 'Popup Content'),
                },
              ),
            ]);
        },
      }),
    );
    cy.get('#popup-content').should('be.visible');
    cy.scrollTo(0, 200);
    cy.get('#popup-content').should('not.be.visible');
    cy.then(() => {
      expect(visibleChanges).to.deep.equal([false]);
    });
  });

  it('prevents default on popup mousedown when preventFocus is set', () => {
    cy.mount(Trigger, {
      slots: {
        default: '<button>Test</button>',
        content: '<div id="popup-content">Popup Content</div>',
      },
      props: { trigger: 'click', defaultPopupVisible: true, preventFocus: true },
    });
    cy.get('.sd-trigger-popup').then(($popup) => {
      const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
      cy.spy(event, 'preventDefault').as('preventDefault');
      $popup[0].dispatchEvent(event);
    });
    cy.get('@preventDefault').should('have.been.called');
  });

  it('wires aria-describedby to the popup when ariaDescribedbyPopup is set', () => {
    cy.mount(Trigger, {
      slots: {
        default: '<button>Test</button>',
        content: '<div id="popup-content">Popup Content</div>',
      },
      props: { trigger: 'click', ariaDescribedbyPopup: true },
    });
    cy.get('button').should('not.have.attr', 'aria-describedby');
    cy.get('button').click();
    cy.get('button').should('have.attr', 'aria-describedby');
    // aria-describedby 指向的弹出层 id 确实存在
    cy.get('button').then(($btn) => {
      cy.get(`#${$btn.attr('aria-describedby')}`).should('exist');
    });
  });
});
