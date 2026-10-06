import './real-transitions';
import { defineComponent, h, ref } from 'vue';

import Calendar from '../index';

it('keeps the latest locale when the initial locale finishes loading later', () => {
  cy.intercept('**/*dayjs*zh-cn*', (request) => {
    request.on('response', (response) => response.setDelay(500));
  });
  cy.mount(
    defineComponent({
      setup() {
        const locale = ref('zh-cn');
        return () =>
          h(Calendar, {
            locale: locale.value,
            viewDate: '2025-01-08',
            onReady: () => {
              locale.value = 'en-us';
            },
          });
      },
    }),
  );
  cy.get('.sd-calendar').should('have.attr', 'data-locale', 'en-us');
  cy.wait(1000);
  cy.get('.sd-calendar__nav--today').should('have.text', 'Today');
  cy.get('.sd-calendar__weekday-day').first().should('have.text', 'Monday');
});
