import { defineComponent, h, ref } from 'vue';

import { dayjs } from '@sdata/web-core/_utils/date';

import DatePanel from '../panels/date/index.vue';

describe('DatePicker mounted clock synchronization', () => {
  for (const isRange of [false, true]) {
    it(`updates selected clock columns after external values change with range=${isRange}`, () => {
      cy.mount(
        defineComponent({
          setup() {
            const value = ref(dayjs('2026-11-08 09:30:00'));
            return () =>
              h('div', [
                h(
                  'button',
                  {
                    onClick: () => {
                      value.value = dayjs('2026-11-08 18:45:20');
                    },
                  },
                  'External clock',
                ),
                h(DatePanel, {
                  headerValue: value.value,
                  value: value.value,
                  footerValue: value.value,
                  timePickerValue: value.value,
                  showTime: true,
                  isRange,
                  currentView: 'time',
                }),
              ]);
          },
        }),
      );
      cy.get('.sd-timepicker-column')
        .eq(0)
        .find('.sd-timepicker-cell-selected')
        .should('have.text', '09');
      cy.contains('button', 'External clock').click();
      for (const [index, text] of ['18', '45', '20'].entries()) {
        cy.get('.sd-timepicker-column')
          .eq(index)
          .find('.sd-timepicker-cell-selected')
          .should('have.text', text);
      }
    });
  }
});
