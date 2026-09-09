import './real-transitions';
import { defineComponent } from 'vue';

import Calendar from '../index';

describe('Calendar week-start isolation', () => {
  it('keeps Monday and Sunday calendars aligned after navigating', () => {
    cy.mount(
      defineComponent({
        components: { Calendar },
        template:
          '<Calendar id="monday" view="week" view-date="2025-01-08" locale="en-us"/><Calendar id="sunday" view="week" view-date="2025-01-08" locale="en-us" :start-week-on-sunday="true"/>',
      }),
    );
    cy.get('#monday .sd-calendar__nav--next').click();
    cy.get('#monday .sd-calendar__body').should('have.length', 1);
    cy.get('#monday .sd-calendar__cell')
      .first()
      .should('have.attr', 'data-start', String(new Date(2025, 0, 13).getTime()));
    cy.get('#sunday .sd-calendar__nav--next').click();
    cy.get('#sunday .sd-calendar__body').should('have.length', 1);
    cy.get('#sunday .sd-calendar__cell')
      .first()
      .should('have.attr', 'data-start', String(new Date(2025, 0, 12).getTime()));
  });
});
