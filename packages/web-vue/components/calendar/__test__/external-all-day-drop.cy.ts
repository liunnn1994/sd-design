import './real-transitions';
import Calendar from '../index';

describe('Calendar external drop destination', () => {
  for (const allDay of [true, false]) {
    it(`uses the destination allDay=${allDay} when creating an external event`, () => {
      const dropped = cy.stub();
      cy.mount(Calendar, {
        props: {
          view: 'day',
          viewDate: '2025-01-08',
          allDayEvents: true,
          editableEvents: true,
          onEventDropped: dropped,
        },
      });
      const transfer = new DataTransfer();
      transfer.setData(
        'event',
        JSON.stringify({
          title: 'External',
          start: '2025-01-08T10:00:00',
          end: '2025-01-08T11:00:00',
          allDay: !allDay,
        }),
      );
      const destination = allDay ? '.sd-calendar__all-day' : '.sd-calendar__body';
      cy.get(`${destination} .sd-calendar__cell`)
        .first()
        .then(($cell) => {
          const rect = $cell[0].getBoundingClientRect();
          cy.wrap($cell).trigger('drop', {
            dataTransfer: transfer,
            clientX: rect.left + 10,
            clientY: rect.top + rect.height / 2,
            force: true,
          });
        });
      cy.wrap(dropped).should('have.been.calledOnce');
      cy.wrap(dropped).should(() => {
        expect(dropped.firstCall.args[0].event.allDay).to.equal(allDay);
      });
      cy.get(`${destination} .sd-calendar__event-title`).should('have.text', 'External');
    });
  }
});
