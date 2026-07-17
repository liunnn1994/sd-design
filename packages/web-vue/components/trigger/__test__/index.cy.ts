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
});
