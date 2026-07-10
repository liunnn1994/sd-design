import Calendar from '../index';

const overlapEvents = [
  { start: '2025-01-08 12:00', end: '2025-01-08 13:00', title: 'Event 1' },
  { start: '2025-01-08 12:15', end: '2025-01-08 13:15', title: 'Event 2' },
];

describe('Calendar', () => {
  it('emits ready and renders week view by default', () => {
    cy.mount(Calendar, { props: { viewDate: '2025-01-08' } });
    cy.get('.sd-calendar').should('have.class', 'sd-calendar--week-view');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('ready')).to.have.length(1);
    });
  });

  it('renders the custom header slot', () => {
    cy.mount(Calendar, {
      props: { viewDate: '2025-01-08' },
      slots: { header: '<div class="calendar-header-slot">自定义头部</div>' },
    });
    cy.get('.calendar-header-slot').should('contain.text', '自定义头部');
  });

  it('renders overlap stack classes when stackEvents is enabled', () => {
    cy.mount(Calendar, {
      props: {
        view: 'week',
        viewDate: '2025-01-08',
        stackEvents: true,
        events: overlapEvents,
        timeFrom: 9 * 60,
        timeTo: 18 * 60,
      },
      attrs: { style: 'height: 600px' },
    });
    cy.get('.sd-calendar__event').should(($els) => {
      expect($els).to.have.lengthOf.at.least(2);
    });
    cy.get('body').then(($body) => {
      const hasStack =
        $body.find('.sd-calendar__event--stack-1-2').length > 0 ||
        $body.find('.sd-calendar__event--stack-2-2').length > 0;
      expect(hasStack, 'expected a stack-N-M class on an event').to.equal(true);
    });
  });
});
