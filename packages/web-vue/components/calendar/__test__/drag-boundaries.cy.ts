import './real-transitions';
import { defineComponent, ref } from 'vue';

import Calendar from '../index';

describe('Calendar drag boundaries', () => {
  for (const constraint of [
    { disableDays: ['2025-01-09'] },
    { minDate: '2025-01-10' },
    { maxDate: '2025-01-08' },
  ]) {
    it(`preserves the source when dropping on a date blocked by ${Object.keys(constraint)[0]}`, () => {
      const onDrop = cy.stub();
      cy.mount(
        defineComponent({
          components: { Calendar },
          setup: () => ({
            constraint,
            onDrop,
            events: ref([{ start: '2025-01-08 10:00', end: '2025-01-08 11:00', title: 'Keep me' }]),
          }),
          template:
            '<Calendar id="source" view="day" view-date="2025-01-08" :events="events" :editable-events="true" style="height:300px"/><Calendar id="destination" view="day" view-date="2025-01-09" v-bind="constraint" :editable-events="true" @event-drop="onDrop" style="height:300px"/>',
        }),
      );
      const transfer = new DataTransfer();
      cy.get('#source .sd-calendar__event').trigger('dragstart', {
        dataTransfer: transfer,
        force: true,
      });
      cy.get('#destination .sd-calendar__cell')
        .first()
        .should('have.class', 'sd-calendar__cell--disabled')
        .trigger('drop', { dataTransfer: transfer, clientY: 100, force: true });
      cy.get('#source .sd-calendar__event').trigger('dragend', {
        dataTransfer: transfer,
        force: true,
      });
      cy.then(() => Cypress.Promise.delay(0));
      cy.wrap(onDrop).should('not.have.been.called');
      cy.get('#source .sd-calendar__event-title').should('have.text', 'Keep me');
      cy.get('#destination .sd-calendar__event').should('not.exist');
    });
  }

  it('cancels a pending hover navigation when dragging ends without a drop', () => {
    cy.mount(Calendar, {
      props: {
        view: 'month',
        viewDate: '2025-01-08',
        editableEvents: true,
        eventsOnMonthView: true,
        events: [{ start: '2025-01-08 10:00', end: '2025-01-08 11:00', title: 'Drag me' }],
      },
    });
    const transfer = new DataTransfer();
    cy.get('.sd-calendar__event').trigger('dragstart', { dataTransfer: transfer, force: true });
    cy.get('.sd-calendar__cell')
      .eq(10)
      .trigger('dragenter', { dataTransfer: transfer, force: true });
    cy.get('.sd-calendar__event').trigger('dragend', { dataTransfer: transfer, force: true });
    cy.wait(2200);
    cy.get('.sd-calendar').should('have.class', 'sd-calendar--month-view');
  });

  it('clears delayed hover navigation when the calendar unmounts', () => {
    cy.mount(Calendar, { props: { view: 'month', viewDate: '2025-01-08', editableEvents: true } });
    cy.get('@vue').then(({ wrapper }) => {
      cy.spy(wrapper.vm.view, 'switch').as('switchView');
    });
    cy.get('.sd-calendar__cell')
      .eq(10)
      .trigger('dragenter', { dataTransfer: new DataTransfer(), force: true });
    cy.get('@vue').then(({ wrapper }) => wrapper.unmount());
    cy.wait(2200);
    cy.get('@switchView').should('not.have.been.called');
  });

  it('preserves the source event when another calendar rejects the drop', () => {
    const rejectDrop = cy.stub().returns(false);
    cy.mount(
      defineComponent({
        components: { Calendar },
        setup: () => ({
          rejectDrop,
          events: ref([{ start: '2025-01-08 10:00', end: '2025-01-08 11:00', title: 'Keep me' }]),
        }),
        template:
          '<Calendar id="source" view="day" view-date="2025-01-08" :events="events" :editable-events="true" style="height:300px"/><Calendar id="destination" view="day" view-date="2025-01-08" :editable-events="true" @event-drop="rejectDrop" style="height:300px"/>',
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
    cy.wrap(rejectDrop).should('have.been.calledOnce');
    cy.then(() => Cypress.Promise.delay(0));
    cy.get('#source .sd-calendar__event').trigger('dragend', {
      dataTransfer: transfer,
      force: true,
    });
    cy.then(() => Cypress.Promise.delay(0));
    cy.get('#source .sd-calendar__event-title').should('have.text', 'Keep me');
    cy.get('#destination .sd-calendar__event').should('not.exist');
  });

  it('opens a narrower view when a dragged event is held over a month cell', () => {
    cy.mount(Calendar, { props: { view: 'month', viewDate: '2025-01-08', editableEvents: true } });
    cy.get('.sd-calendar__cell')
      .eq(10)
      .trigger('dragenter', { dataTransfer: new DataTransfer(), force: true });
    cy.get('.sd-calendar').should('not.have.class', 'sd-calendar--month-view');
  });
});
