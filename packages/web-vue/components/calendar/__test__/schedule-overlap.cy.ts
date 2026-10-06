import { reactive } from 'vue';

import './real-transitions';
import Calendar from '../index';

it('recalculates overlapping widths when an event moves to another schedule', () => {
  const events = reactive([
    { start: '2025-01-08 10:00', end: '2025-01-08 11:00', title: 'First', schedule: 1 },
    { start: '2025-01-08 10:00', end: '2025-01-08 11:00', title: 'Second', schedule: 2 },
  ]);
  cy.mount(Calendar, {
    props: {
      view: 'day',
      viewDate: '2025-01-08',
      schedules: [
        { id: 1, label: 'One' },
        { id: 2, label: 'Two' },
      ],
      events,
    },
  });
  cy.get('.sd-calendar__event')
    .should('have.length', 2)
    .each(($event) => {
      expect($event[0].style.width).to.equal('100%');
    });
  cy.then(() => {
    events[1].schedule = 1;
  });
  cy.get('[data-schedule="1"] .sd-calendar__event')
    .should('have.length', 2)
    .should(($events) => {
      for (const event of $events) expect(event.style.width).to.equal('50%');
    });
});
