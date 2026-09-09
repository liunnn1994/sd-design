import './real-transitions';
import Calendar from '../index';

describe('Calendar resize lifecycle', () => {
  it('keeps the latest accepted position when move approvals arrive out of order', () => {
    const approvals: Array<(accepted: boolean) => void> = [];
    const approveResize = cy
      .stub()
      .callsFake(() => new Promise<boolean>((resolve) => approvals.push(resolve)));
    cy.mount(Calendar, {
      attrs: { style: 'height: 600px' },
      global: { stubs: { 'transition': false, 'transition-group': false } },
      props: {
        view: 'day',
        viewDate: '2025-01-08',
        editableEvents: true,
        timeFrom: 540,
        timeTo: 840,
        onEventResize: approveResize,
        events: [{ start: '2025-01-08 10:00', end: '2025-01-08 11:00', title: 'Latest wins' }],
      },
    });
    cy.get('.sd-calendar__cell')
      .first()
      .should(($cell) => {
        expect($cell[0].getBoundingClientRect().height).to.be.greaterThan(100);
      });
    cy.get('.sd-calendar__event-resizer')
      .should('be.visible')
      .then(($resizer) => {
        const resizer = $resizer[0];
        const rect = resizer.closest('.sd-calendar__cell')!.getBoundingClientRect();
        const clientX = rect.left + rect.width / 2;
        const clientY = rect.top + rect.height * 0.4;
        resizer.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX, clientY }));
        for (const offset of [rect.height * 0.2, rect.height * 0.4]) {
          resizer.ownerDocument.dispatchEvent(
            new MouseEvent('mousemove', {
              bubbles: true,
              cancelable: true,
              clientX,
              clientY: clientY + offset,
            }),
          );
        }
      });
    cy.wrap(approveResize).should('have.been.calledTwice');
    cy.then(() => {
      expect(approveResize.firstCall.args[0].event.end.getTime()).not.to.equal(
        approveResize.secondCall.args[0].event.end.getTime(),
      );
    });
    cy.then(() => {
      approvals[1](true);
      return Cypress.Promise.delay(0);
    });
    let acceptedEnd: string;
    cy.get('.sd-calendar__event-end')
      .invoke('text')
      .then((value) => {
        acceptedEnd = value;
      });
    cy.then(() => {
      approvals[0](true);
      return Cypress.Promise.delay(0);
    });
    cy.get('.sd-calendar__event-end').should(($end) => {
      expect($end.text()).to.equal(acceptedEnd);
    });
  });

  it('ignores a pending move approval after the resize gesture ends', () => {
    let resolveResize!: (accepted: boolean) => void;
    const pending = new Promise<boolean>((resolve) => {
      resolveResize = resolve;
    });
    const approveResize = cy.stub().returns(pending);
    cy.mount(Calendar, {
      props: {
        view: 'day',
        viewDate: '2025-01-08',
        editableEvents: true,
        onEventResize: approveResize,
        events: [{ start: '2025-01-08 10:00', end: '2025-01-08 11:00', title: 'Resize me' }],
      },
    });
    cy.get('.sd-calendar__event-resizer').then(($resizer) => {
      const resizer = $resizer[0];
      const rect = resizer.getBoundingClientRect();
      const clientX = rect.left + rect.width / 2;
      const clientY = rect.top + rect.height / 2;
      resizer.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX, clientY }));
      const doc = resizer.ownerDocument;
      doc.dispatchEvent(
        new MouseEvent('mousemove', {
          bubbles: true,
          cancelable: true,
          clientX,
          clientY: clientY + 60,
        }),
      );
      doc.dispatchEvent(
        new MouseEvent('mouseup', { bubbles: true, clientX, clientY: clientY + 90 }),
      );
    });
    cy.wrap(approveResize).should('have.been.calledOnce');
    cy.then(() => Cypress.Promise.delay(0));
    cy.get('.sd-calendar__event-end')
      .invoke('text')
      .then((finalEnd) => {
        resolveResize(true);
        return Cypress.Promise.delay(0).then(() => {
          cy.get('.sd-calendar__event-end').should('have.text', finalEnd);
        });
      });
    cy.get('.sd-calendar').should('not.have.class', 'sd-calendar--resizing-event');
  });

  for (const callback of ['onEventResize', 'onEventResizeEnd']) {
    it(`ignores pending ${callback} approval after unmount`, () => {
      let resolveResize!: (accepted: boolean) => void;
      const pending = new Promise<boolean>((resolve) => {
        resolveResize = resolve;
      });
      const approveResize = cy.stub().returns(pending);
      cy.mount(Calendar, {
        props: {
          view: 'day',
          viewDate: '2025-01-08',
          editableEvents: true,
          [callback]: approveResize,
          events: [{ start: '2025-01-08 10:00', end: '2025-01-08 11:00', title: 'Resize me' }],
        },
      });
      cy.get('.sd-calendar__event-resizer').then(($resizer) => {
        const resizer = $resizer[0];
        const rect = resizer.getBoundingClientRect();
        const clientX = rect.left + rect.width / 2;
        const clientY = rect.top + rect.height / 2;
        resizer.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX, clientY }));
        const doc = resizer.ownerDocument;
        doc.dispatchEvent(
          new MouseEvent('mousemove', {
            bubbles: true,
            cancelable: true,
            clientX,
            clientY: clientY + 60,
          }),
        );
        if (callback === 'onEventResizeEnd') {
          doc.dispatchEvent(
            new MouseEvent('mouseup', { bubbles: true, clientX, clientY: clientY + 60 }),
          );
        }
      });
      cy.wrap(approveResize).should('have.been.calledOnce');
      cy.get('@vue').then(({ wrapper }) => wrapper.unmount());
      cy.then(() => {
        resolveResize(true);
        return Cypress.Promise.delay(0);
      });
      cy.get('.sd-calendar').should('not.exist');
    });
  }

  it('removes document resize listeners when unmounted during a gesture', () => {
    cy.mount(Calendar, {
      props: {
        view: 'day',
        viewDate: '2025-01-08',
        editableEvents: true,
        events: [{ start: '2025-01-08 10:00', end: '2025-01-08 11:00', title: 'Resize me' }],
      },
    });
    cy.document().then((doc) => {
      cy.spy(doc, 'addEventListener').as('addListener');
      cy.spy(doc, 'removeEventListener').as('removeListener');
    });
    cy.get('.sd-calendar__event-resizer').trigger('mousedown', { clientY: 200, force: true });
    cy.get('@vue').then(({ wrapper }) => wrapper.unmount());
    cy.get('@addListener').then((addListener: any) => {
      for (const type of ['mousemove', 'mouseup']) {
        const registrations = addListener.getCalls().filter((call: any) => call.args[0] === type);
        expect(registrations.length, `${type} registered`).to.be.greaterThan(0);
        for (const registration of registrations) {
          cy.get('@removeListener').should('have.been.calledWith', type, registration.args[1]);
        }
      }
    });
  });
});
