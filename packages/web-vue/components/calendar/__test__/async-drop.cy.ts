import './real-transitions';
import { defineComponent, ref } from 'vue';

import Calendar from '../index';

describe('Calendar asynchronous drop', () => {
  for (const accepted of [true, false, 'error'] as const) {
    it(`preserves one event when the drop result is ${accepted} after dragend`, () => {
      let resolve!: (accepted: boolean) => void;
      let reject!: (reason: Error) => void;
      const decision = new Promise<boolean>((done, fail) => {
        resolve = done;
        reject = fail;
      });
      const onDrop = cy.stub().returns(decision);
      cy.mount(
        defineComponent({
          components: { Calendar },
          setup: () => ({
            onDrop,
            events: ref([
              { start: '2025-01-08 10:00', end: '2025-01-08 11:00', title: 'Transfer' },
            ]),
          }),
          template:
            '<Calendar id="source" view="day" view-date="2025-01-08" :events="events" :editable-events="true" style="height:300px"/><Calendar id="destination" view="day" view-date="2025-01-08" :editable-events="true" @event-drop="onDrop" style="height:300px"/>',
        }),
      );
      const transfer = new DataTransfer();
      cy.get('#source .sd-calendar__event').trigger('dragstart', {
        dataTransfer: transfer,
        force: true,
      });
      cy.get('#destination .sd-calendar__cell')
        .first()
        .trigger('drop', { dataTransfer: transfer, clientY: 100, force: true });
      cy.wrap(onDrop).should('have.been.calledOnce');
      cy.get('#source .sd-calendar__event').trigger('dragend', {
        dataTransfer: transfer,
        force: true,
      });
      cy.then(() => {
        if (accepted === 'error') reject(new Error('Drop failed'));
        else resolve(accepted);
        return Cypress.Promise.delay(0);
      });
      cy.get('.sd-calendar__event-title').should('have.length', 1).and('have.text', 'Transfer');
      cy.get(`${accepted === true ? '#destination' : '#source'} .sd-calendar__event-title`).should(
        'have.text',
        'Transfer',
      );
    });
  }
});
