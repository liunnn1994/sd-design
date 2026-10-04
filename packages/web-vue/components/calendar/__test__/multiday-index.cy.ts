import Calendar from '../index';

const otherEvents = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    start: '2024-01-01 10:00',
    end: '2024-01-01 11:00',
    title: `Other ${index}`,
  }));

describe('Calendar large event index', () => {
  it('keeps a visible multiday event when the list grows from 100 to 101 entries', () => {
    const visible = {
      start: '2025-01-07 10:00',
      end: '2025-01-09 11:00',
      title: 'Spanning event',
    };
    cy.mount(Calendar, {
      props: { view: 'day', viewDate: '2025-01-08', events: [visible, ...otherEvents(99)] },
    });
    cy.get('.sd-calendar__event-title').should('have.text', 'Spanning event');
    cy.get('@vue').then(({ wrapper }) =>
      wrapper.setProps({ events: [visible, ...otherEvents(100)] }),
    );
    cy.get('.sd-calendar__event-title').should('have.text', 'Spanning event');
  });

  it('preserves all-day filtering and excludes the ending midnight with over 100 events', () => {
    cy.mount(Calendar, {
      props: {
        view: 'day',
        viewDate: '2025-01-08',
        allDayEvents: true,
        events: [
          { start: '2025-01-07', end: '2025-01-09', allDay: true, title: 'All-day spanning' },
          { start: '2025-01-08 10:00', end: '2025-01-10 11:00', title: 'Timed spanning' },
          ...otherEvents(100),
        ],
      },
    });
    cy.get('.sd-calendar__all-day .sd-calendar__event-title').should(
      'have.text',
      'All-day spanning',
    );
    cy.get('.sd-calendar__event-title').should('have.length', 2);
    cy.get('@vue').then(({ wrapper }) => wrapper.vm.view.next());
    cy.get('.sd-calendar__all-day .sd-calendar__event-title').should('not.exist');
    cy.get('.sd-calendar__event-title').should('have.text', 'Timed spanning');
  });
});
