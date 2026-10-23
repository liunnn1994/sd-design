import './real-transitions';
import Calendar from '../index';

describe('Calendar cell gesture lifecycle', () => {
  for (const dragging of [false, true]) {
    it(`cancels ${dragging ? 'a touch drag' : 'a pending touch hold'} without creating an event`, () => {
      const onCellHold = cy.spy();
      const onCellDrag = cy.spy();
      const onEventCreate = cy.spy();
      cy.mount(Calendar, {
        props: {
          view: 'day',
          viewDate: '2025-01-08',
          editableEvents: { create: true },
          onEventCreate,
        },
        attrs: { onCellHold, onCellDrag, style: 'height: 600px' },
      });
      cy.clock(undefined, ['setTimeout', 'clearTimeout']);
      cy.get('.sd-calendar__cell')
        .first()
        .then(($cell) => {
          const rect = $cell[0].getBoundingClientRect();
          cy.wrap($cell).trigger('touchstart', {
            force: true,
            touches: [{ target: $cell[0], clientX: rect.left + 20, clientY: rect.top + 40 }],
          });
          if (dragging) {
            cy.tick(500);
            cy.document().trigger('touchmove', {
              touches: [{ target: $cell[0], clientX: rect.left + 20, clientY: rect.top + 120 }],
            });
            cy.get('.sd-calendar').should('have.class', 'sd-calendar--dragging-cell');
          }
        });
      cy.document().trigger('touchcancel');
      cy.tick(1200);
      cy.wrap(onCellHold).should('not.have.been.called');
      cy.get('.sd-calendar').should('not.have.class', 'sd-calendar--dragging-cell');
      cy.document().trigger('touchmove', { touches: [{ clientX: 100, clientY: 200 }] });
      cy.wrap(onCellDrag).should('have.callCount', dragging ? 1 : 0);
      cy.wrap(onEventCreate).should('not.have.been.called');
      cy.get('.sd-calendar__event').should('not.exist');
    });
  }

  it('removes document gesture handlers and hold timers when unmounted', () => {
    const onCellHold = cy.spy();
    const onCellDrag = cy.spy();
    const onCellMousedown = cy.spy();
    cy.clock(undefined, ['setTimeout', 'clearTimeout']);
    cy.mount(Calendar, {
      props: { view: 'day', viewDate: '2025-01-08' },
      attrs: { onCellHold, onCellDrag, onCellMousedown, style: 'height: 600px' },
    });
    cy.document().then((doc) => {
      cy.spy(doc, 'addEventListener').as('cellAdded');
      cy.spy(doc, 'removeEventListener').as('cellRemoved');
    });
    cy.get('.sd-calendar__cell').trigger('mousedown', { clientX: 100, clientY: 100 });
    cy.wrap(onCellMousedown).should('have.been.calledOnce');
    cy.get('@vue').then(({ wrapper }) => wrapper.unmount());
    cy.get('@cellAdded').then((added: ReturnType<typeof cy.spy>) => {
      for (const type of ['mousemove', 'mouseup']) {
        const registrations = added.getCalls().filter((call) => call.args[0] === type);
        expect(registrations.length, `${type} registered`).to.be.greaterThan(0);
        for (const registration of registrations) {
          cy.get('@cellRemoved').should('have.been.calledWith', type, registration.args[1]);
        }
      }
    });
    cy.document().then((doc) => {
      doc.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 150 }));
    });
    cy.tick(1100);
    cy.wrap(onCellDrag).should('not.have.been.called');
    cy.wrap(onCellHold).should('not.have.been.called');
  });
});
