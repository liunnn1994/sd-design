import './real-transitions';
import Calendar from '../index';

describe('Calendar creation special-hours boundaries', () => {
  for (const horizontal of [false, true]) {
    for (const backwards of [false, true]) {
      it(`clamps ${horizontal ? 'horizontal' : 'vertical'} ${backwards ? 'backward' : 'forward'} creation`, () => {
        cy.mount(Calendar, {
          attrs: { style: 'height: 600px; width: 800px' },
          props: {
            view: 'day',
            viewDate: '2025-01-08',
            horizontal,
            timeFrom: 540,
            timeTo: 1020,
            snapToInterval: 30,
            editableEvents: true,
            specialHours: { wed: [{ from: 720, to: 780, allowEvents: false }] },
          },
        });
        cy.get('.sd-calendar__cell')
          .first()
          .then(($cell) => {
            const cell = $cell[0];
            const rect = cell.getBoundingClientRect();
            expect(horizontal ? rect.width : rect.height).to.be.greaterThan(100);
            const point = (hour: number) => ({
              bubbles: true,
              cancelable: true,
              clientX: rect.left + rect.width * (horizontal ? (hour - 9) / 8 : 0.5),
              clientY: rect.top + rect.height * (horizontal ? 0.5 : (hour - 9) / 8),
            });
            cell.dispatchEvent(new MouseEvent('mousedown', point(backwards ? 14 : 10)));
            cell.ownerDocument.dispatchEvent(
              new MouseEvent('mousemove', point(backwards ? 10 : 14)),
            );
            cell.ownerDocument.dispatchEvent(new MouseEvent('mouseup', point(backwards ? 10 : 14)));
          });
        cy.get('.sd-calendar__event').should('have.length', 1);
        cy.get('.sd-calendar__event-start').should('have.text', backwards ? '13:00' : '10:00');
        cy.get('.sd-calendar__event-end').should('contain.text', backwards ? '14:00' : '12:00');
      });
    }
  }
});
