import './real-transitions';
import { defineComponent } from 'vue';

import Calendar from '../index';

describe('Calendar asynchronous drop', () => {
  it('moves the rendered event when approval arrives after native dragend', () => {
    let approve!: (accepted: boolean) => void;
    const onDrop = cy.stub().returns(
      new Promise<boolean>((resolve) => {
        approve = resolve;
      }),
    );
    const events = [{ start: '2025-01-08 10:00', end: '2025-01-08 11:00', title: 'Transfer' }];
    cy.mount(
      defineComponent({
        components: { Calendar },
        setup: () => ({ onDrop, events }),
        template:
          '<Calendar id="source" view="day" view-date="2025-01-08" :events="events" :editable-events="{ drag: true, delete: false }" style="height:300px"/><Calendar id="destination" view="day" view-date="2025-01-08" :editable-events="true" @event-drop="onDrop" style="height:300px"/>',
      }),
    );

    const dataTransfer = new DataTransfer();
    cy.get('#source .sd-calendar__event').trigger('dragstart', { dataTransfer, force: true });
    cy.get('#destination .sd-calendar__cell')
      .first()
      .trigger('drop', { dataTransfer, clientY: 100, force: true });
    cy.wrap(onDrop).should('have.been.calledOnce');
    cy.get('#source .sd-calendar__event').trigger('dragend', { dataTransfer, force: true });
    cy.get('#source .sd-calendar__event-title').should('have.text', 'Transfer');
    cy.get('#destination .sd-calendar__event').should('not.exist');

    cy.then(() => approve(true));
    cy.get('#destination .sd-calendar__event-title').should('have.text', 'Transfer');
    cy.get('#source .sd-calendar__event').should('not.exist');
  });
});
