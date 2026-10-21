import { defineComponent, h, ref } from 'vue';

import Tabs, { TabPane } from '../index';

describe('Tabs render-function registration', () => {
  it('auto-switches to a pane added through a render-function slot', () => {
    cy.mount(
      defineComponent({
        setup() {
          const keys = ref([0, 1]);
          return () =>
            h(
              Tabs,
              {
                editable: true,
                showAddButton: true,
                autoSwitch: true,
                onAdd: () => keys.value.push(2),
              },
              {
                default: () =>
                  keys.value.map((key) =>
                    h(TabPane, { key, title: `Tab ${key}` }, () => `Panel ${key}`),
                  ),
              },
            );
        },
      }),
    );
    cy.contains('.sd-tabs-tab', 'Tab 0').should('have.attr', 'aria-selected', 'true');
    cy.get('.sd-tabs-nav-add-btn').click();
    cy.contains('.sd-tabs-tab', 'Tab 2').should('have.attr', 'aria-selected', 'true');
  });

  it('refreshes header order when an existing render-function slot is reordered', () => {
    const keys = ref([0, 1, 2]);
    cy.mount(
      defineComponent({
        setup: () => () =>
          h(Tabs, null, {
            default: () =>
              keys.value.map((key) =>
                h(TabPane, { key, title: `Tab ${key}` }, () => `Panel ${key}`),
              ),
          }),
      }),
    );
    cy.get('.sd-tabs-tab').first().should('contain.text', 'Tab 0');
    cy.then(() => {
      keys.value = [2, 0, 1];
    });
    cy.get('.sd-tabs-tab').first().should('contain.text', 'Tab 2');
  });
});
