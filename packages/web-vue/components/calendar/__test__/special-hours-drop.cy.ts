import './real-transitions';
import Calendar from '../index';

describe('Calendar special-hours drops', () => {
  for (const schedule of [1, 2]) {
    it(`applies the special-hours override for schedule ${schedule}`, () => {
      const onDrop = cy.stub().returns(true);
      cy.mount(Calendar, {
        attrs: { style: 'height: 600px; width: 800px' },
        props: {
          view: 'day',
          viewDate: '2025-01-08',
          timeFrom: 540,
          timeTo: 1020,
          snapToInterval: 60,
          editableEvents: true,
          onEventDrop: onDrop,
          schedules: [
            { id: 1, label: 'Default' },
            { id: 2, label: 'Override' },
          ],
          specialHours: {
            wed: {
              default: [{ from: 720, to: 780, allowEvents: false, label: 'Closed' }],
              schedules: { 2: [{ from: 720, to: 780, allowEvents: true, label: 'Open' }] },
            },
          },
        },
      });
      const transfer = new DataTransfer();
      transfer.setData('event', JSON.stringify({ title: 'Scheduled', duration: 60 }));
      cy.get(`.sd-calendar__schedule--cell[data-schedule="${schedule}"]`).then(($schedule) => {
        const rect = $schedule[0].getBoundingClientRect();
        expect(rect.height).to.be.greaterThan(100);
        cy.wrap($schedule).trigger('drop', {
          dataTransfer: transfer,
          force: true,
          clientX: rect.left + rect.width / 2,
          clientY: rect.top + (rect.height * 3) / 8,
        });
      });
      cy.then(() => Cypress.Promise.delay(0));
      if (schedule === 1) {
        cy.wrap(onDrop).should('not.have.been.called');
        cy.get('.sd-calendar__event').should('not.exist');
      } else {
        cy.wrap(onDrop).should('have.been.calledOnce');
        cy.get('.sd-calendar__schedule--cell[data-schedule="2"] .sd-calendar__event-start').should(
          'have.text',
          '12:00',
        );
      }
    });
  }

  for (const horizontal of [false, true]) {
    for (const hour of [10, 11, 12, 13]) {
      it(`${horizontal ? 'horizontal' : 'vertical'} drop at ${hour}:00 respects blocked hours`, () => {
        const onDrop = cy.stub().returns(true);
        cy.mount(Calendar, {
          attrs: { style: 'height: 600px; width: 800px' },
          props: {
            view: 'day',
            viewDate: '2025-01-08',
            horizontal,
            timeFrom: 540,
            timeTo: 1020,
            snapToInterval: 60,
            editableEvents: true,
            onEventDrop: onDrop,
            specialHours: { wed: [{ from: 720, to: 780, allowEvents: false, label: 'Closed' }] },
          },
        });
        const transfer = new DataTransfer();
        transfer.setData('event', JSON.stringify({ title: 'Dropped', duration: 60 }));
        cy.get('.sd-calendar__cell')
          .first()
          .should(($cell) => {
            const rect = $cell[0].getBoundingClientRect();
            expect(horizontal ? rect.width : rect.height).to.be.greaterThan(100);
          })
          .then(($cell) => {
            const rect = $cell[0].getBoundingClientRect();
            const fraction = (hour - 9) / 8;
            cy.wrap($cell).trigger('drop', {
              dataTransfer: transfer,
              force: true,
              clientX: rect.left + rect.width * (horizontal ? fraction : 0.5),
              clientY: rect.top + rect.height * (horizontal ? 0.5 : fraction),
            });
          });
        cy.then(() => Cypress.Promise.delay(0));
        if (hour === 12) {
          cy.wrap(onDrop).should('not.have.been.called');
          cy.get('.sd-calendar__event').should('not.exist');
        } else {
          cy.wrap(onDrop).should('have.been.calledOnce');
          cy.get('.sd-calendar__event-start').should('have.text', `${hour}:00`);
          cy.get('.sd-calendar__event-end').should('contain.text', `${hour + 1}:00`);
        }
      });
    }
  }
});
