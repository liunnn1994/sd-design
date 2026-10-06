import './real-transitions';
import Calendar from '../index';

describe('Calendar event hold', () => {
  for (const release of ['mouseup', 'touchend', 'touchcancel']) {
    it(`cancels hold when the pointer ends with ${release}`, () => {
      const hold = cy.stub();
      cy.mount(Calendar, {
        props: {
          view: 'day',
          viewDate: '2025-01-08',
          onEventHold: hold,
          events: [{ start: '2025-01-08 10:00', end: '2025-01-08 11:00', title: 'Event' }],
        },
      });
      cy.clock();
      cy.get('.sd-calendar__event').then(($event) => {
        cy.wrap($event).trigger(release === 'mouseup' ? 'mousedown' : 'touchstart', {
          force: true,
          touches: [{ target: $event[0], clientX: 0, clientY: 0 }],
        });
      });
      cy.tick(100);
      cy.document().trigger(release);
      cy.tick(1000);
      cy.wrap(hold).should('not.have.been.called');
    });
  }

  it('fires once for an uninterrupted hold', () => {
    const hold = cy.stub();
    cy.mount(Calendar, {
      props: {
        view: 'day',
        viewDate: '2025-01-08',
        onEventHold: hold,
        events: [{ start: '2025-01-08 10:00', end: '2025-01-08 11:00', title: 'Event' }],
      },
    });
    cy.clock();
    cy.get('.sd-calendar__event').trigger('mousedown', { force: true });
    cy.tick(1000);
    cy.wrap(hold).should('have.been.calledOnce');
    cy.document().trigger('mouseup');
    cy.tick(1000);
    cy.wrap(hold).should('have.been.calledOnce');
  });
});
