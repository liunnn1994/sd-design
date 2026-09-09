import './real-transitions';
import Calendar from '../index';

describe('Calendar resize special-hours boundaries', () => {
  for (const horizontal of [false, true]) {
    it(`clamps ${horizontal ? 'horizontal' : 'vertical'} resizing at a blocked range`, () => {
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
          events: [{ start: '2025-01-08 10:00', end: '2025-01-08 11:00', title: 'Resize' }],
        },
      });
      cy.get('.sd-calendar__event-resizer')
        .should('be.visible')
        .then(($resizer) => {
          const resizer = $resizer[0];
          const rect = resizer.closest('.sd-calendar__cell')!.getBoundingClientRect();
          expect(horizontal ? rect.width : rect.height).to.be.greaterThan(100);
          const point = (hour: number) => ({
            bubbles: true,
            cancelable: true,
            clientX: rect.left + rect.width * (horizontal ? (hour - 9) / 8 : 0.5),
            clientY: rect.top + rect.height * (horizontal ? 0.5 : (hour - 9) / 8),
          });
          resizer.dispatchEvent(new MouseEvent('mousedown', point(11)));
          resizer.ownerDocument.dispatchEvent(new MouseEvent('mousemove', point(13.5)));
          resizer.ownerDocument.dispatchEvent(new MouseEvent('mouseup', point(13.5)));
        });
      cy.get('.sd-calendar__event-start').should('have.text', '10:00');
      cy.get('.sd-calendar__event-end').should('contain.text', '12:00');
      cy.get('.sd-calendar').should('not.have.class', 'sd-calendar--resizing-event');
    });
  }
});
