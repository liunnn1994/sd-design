import './real-transitions';
import Calendar from '../index';

describe('Calendar resize rejection', () => {
  for (const callback of ['onEventResize', 'onEventResizeEnd']) {
    for (const result of ['false', 'error']) {
      it(`restores the event when ${callback} returns ${result}`, () => {
        const rejectResize = cy.stub().callsFake(async () => {
          if (result === 'error') throw new Error('Resize rejected');
          return false;
        });
        cy.mount(Calendar, {
          props: {
            view: 'day',
            viewDate: '2025-01-08',
            editableEvents: true,
            [callback]: rejectResize,
            events: [{ start: '2025-01-08 10:00', end: '2025-01-08 11:00', title: 'Keep time' }],
          },
        });
        let release: () => void;
        cy.get('.sd-calendar__event-resizer').then(($resizer) => {
          const resizer = $resizer[0];
          const rect = resizer.getBoundingClientRect();
          const clientX = rect.left + rect.width / 2;
          const clientY = rect.top + rect.height / 2;
          const doc = resizer.ownerDocument;
          resizer.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX, clientY }));
          doc.dispatchEvent(
            new MouseEvent('mousemove', {
              bubbles: true,
              cancelable: true,
              clientX,
              clientY: clientY + 60,
            }),
          );
          release = () =>
            doc.dispatchEvent(
              new MouseEvent('mouseup', { bubbles: true, clientX, clientY: clientY + 60 }),
            );
        });
        cy.then(() => Cypress.Promise.delay(0));
        cy.then(() => {
          release();
          return Cypress.Promise.delay(0);
        });
        cy.wrap(rejectResize).should('have.been.calledOnce');
        cy.get('.sd-calendar__event-start').should('have.text', '10:00');
        cy.get('.sd-calendar__event-end').should('contain.text', '11:00');
        cy.get('.sd-calendar').should('not.have.class', 'sd-calendar--resizing-event');
      });
    }
  }
});
