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
