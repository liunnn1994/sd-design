import './real-transitions';
import { defineComponent, ref } from 'vue';

import Calendar from '../index';

describe('Calendar event updates', () => {
  it('tracks same-length mutations after the events prop array is replaced', () => {
    cy.mount(
      defineComponent({
        components: { Calendar },
        setup: () => ({
          events: ref([{ start: '2025-01-08 10:00', end: '2025-01-08 11:00', title: 'Original' }]),
        }),
        template: `<button @click="events = [{start: '2025-01-08 12:00', end: '2025-01-08 13:00', title: 'New array'}]">Replace array</button>
        <button @click="events.splice(0, 1, {start: '2025-01-08 14:00', end: '2025-01-08 15:00', title: 'New item'})">Replace item</button>
        <Calendar view-date="2025-01-08" :events="events" />`,
      }),
    );
    cy.contains('button', 'Replace array').click();
    cy.get('.sd-calendar__event-title').should('have.text', 'New array');
    cy.contains('button', 'Replace item').click();
    cy.get('.sd-calendar__event-title').should('have.text', 'New item');
    cy.get('.sd-calendar__event-start').should('have.text', '14:00');
  });

  it('renders an event replaced in place without changing the array length', () => {
    cy.mount(
      defineComponent({
        components: { Calendar },
        setup: () => ({
          events: ref([{ start: '2025-01-08 10:00', end: '2025-01-08 11:00', title: 'Original' }]),
        }),
        template:
          '<button @click="events.splice(0, 1, {start: \'2025-01-08 12:00\', end: \'2025-01-08 13:00\', title: \'Replacement\'})">Replace</button><Calendar view-date="2025-01-08" :events="events" />',
      }),
    );
    cy.get('.sd-calendar__event-title').should('have.text', 'Original');
    cy.contains('button', 'Replace').click();
    cy.get('.sd-calendar__event-title').should('have.text', 'Replacement');
    cy.get('.sd-calendar__event-start').should('have.text', '12:00');
  });

  it('creates an event from string dates with interval snapping', () => {
    cy.mount(Calendar, {
      props: { viewDate: '2025-01-08', snapToInterval: 30, editableEvents: true },
    });
    cy.get('@vue').then(({ wrapper }) => {
      wrapper.vm.view.createEvent({
        start: '2025-01-08 10:08',
        end: '2025-01-08 11:08',
        title: 'Snapped',
      });
    });
    cy.get('.sd-calendar__event-title').should('have.text', 'Snapped');
    cy.get('.sd-calendar__event-start').should('have.text', '10:00');
    cy.get('.sd-calendar__event-end').should('contain.text', '11:00');
  });
});
