import type { CalendarEventInput } from '../types';

import './real-transitions';
import Calendar from '../index';

describe('Calendar pending creation approval', () => {
  for (const unmount of [false, true]) {
    it(`${unmount ? 'ignores approval after unmount' : 'keeps the original proposal after navigation'}`, () => {
      const events: CalendarEventInput[] = [];
      let approve!: (accepted: boolean) => void;
      const onEventCreate = cy.stub().callsFake((payload: { resolve(value: boolean): void }) => {
        approve = payload.resolve;
      });
      cy.mount(Calendar, {
        attrs: { style: 'height: 600px' },
        props: {
          view: 'day',
          viewDate: '2025-01-08',
          timeFrom: 540,
          timeTo: 840,
          editableEvents: true,
          events,
          onEventCreate,
        },
      });
      cy.get('.sd-calendar__cell')
        .first()
        .then(($cell) => {
          const cell = $cell[0];
          const rect = cell.getBoundingClientRect();
          const clientX = rect.left + rect.width / 2;
          const clientY = rect.top + 40;
          cell.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX, clientY }));
          cell.ownerDocument.dispatchEvent(
            new MouseEvent('mousemove', { clientX, clientY: clientY + 80 }),
          );
          cell.ownerDocument.dispatchEvent(
            new MouseEvent('mouseup', { clientX, clientY: clientY + 80 }),
          );
        });
      cy.wrap(onEventCreate).should('have.been.calledOnce');
      cy.get('@vue').then(({ wrapper }) => {
        if (unmount) wrapper.unmount();
        else return wrapper.setProps({ viewDate: '2025-01-09' });
      });
      cy.then(() => {
        approve(true);
        return Cypress.Promise.delay(0);
      });
      cy.wrap(events).should('have.length', unmount ? 0 : 1);
      if (!unmount) cy.then(() => expect(new Date(events[0].start).getDate()).to.equal(8));
    });
  }
});
