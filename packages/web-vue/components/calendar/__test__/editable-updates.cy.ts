import './real-transitions';
import Calendar from '../index';

describe('Calendar editing updates', () => {
  for (const enabled of [true, false]) {
    it(`${enabled ? 'enables' : 'disables'} cell drops when editableEvents changes`, () => {
      const onDrop = cy.stub().returns(true);
      cy.mount(Calendar, {
        props: {
          view: 'day',
          viewDate: '2025-01-08',
          editableEvents: !enabled,
          onEventDrop: onDrop,
        },
        attrs: { style: 'height: 600px' },
      });
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ editableEvents: enabled }));
      const transfer = new DataTransfer();
      transfer.setData('event', JSON.stringify({ title: 'New event', duration: 60 }));
      cy.get('.sd-calendar__cell')
        .first()
        .then(($cell) => {
          const rect = $cell[0].getBoundingClientRect();
          expect(rect.height).to.be.greaterThan(0);
          cy.wrap($cell).trigger('drop', {
            dataTransfer: transfer,
            clientX: rect.left + 10,
            clientY: rect.top + rect.height / 2,
            force: true,
          });
        });
      cy.then(() => Cypress.Promise.delay(0));
      cy.wrap(onDrop).should(enabled ? 'have.been.calledOnce' : 'not.have.been.called');
      if (enabled) cy.get('.sd-calendar__event-title').should('have.text', 'New event');
      else cy.get('.sd-calendar__event').should('not.exist');
    });
  }
});
