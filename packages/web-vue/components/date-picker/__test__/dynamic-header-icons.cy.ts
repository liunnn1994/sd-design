import { defineComponent, h, ref } from 'vue';

import DatePicker, { RangePicker } from '../index';

describe('DatePicker dynamic header icons', () => {
  for (const range of [false, true]) {
    it(`adds and removes an icon in an already mounted ${range ? 'range' : 'date'} panel`, () => {
      cy.mount(
        defineComponent({
          setup() {
            const visible = ref(false);
            return () =>
              h('div', [
                h(
                  'button',
                  {
                    onClick: () => {
                      visible.value = !visible.value;
                    },
                  },
                  'Toggle',
                ),
                h(
                  range ? RangePicker : DatePicker,
                  { hideTrigger: true },
                  visible.value
                    ? {
                        'icon-next-double': () => h('span', { 'data-testid': 'next-icon' }, 'Next'),
                      }
                    : {},
                ),
              ]);
          },
        }),
      );
      cy.get('[data-testid="next-icon"]').should('not.exist');
      cy.contains('button', 'Toggle').click();
      cy.get('[data-testid="next-icon"]').should('exist');
      cy.contains('button', 'Toggle').click();
      cy.get('[data-testid="next-icon"]').should('not.exist');
    });
  }
});
