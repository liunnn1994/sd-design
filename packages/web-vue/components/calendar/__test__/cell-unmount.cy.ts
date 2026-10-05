import './real-transitions';
import Calendar from '../index';

describe('Calendar cell gesture lifecycle', () => {
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
