{
  describe('Calendar event view', () => {
    beforeEach(() => cy.visit('/calendar.html?fixture=event'));
    it('registers the native element, renders details and updates permissions', () => {
      cy.get('[data-testid="event-registered"]').should('have.text', 'true');
      cy.get('.sd-calendar__event-title').should('have.text', 'Planning');
      cy.get('.sd-calendar__event-content').should('have.text', 'Discuss scope');
      cy.get('.sd-calendar__event')
        .should('have.attr', 'draggable', 'true')
        .and('have.css', 'cursor', 'grab');
      cy.get('.sd-calendar__event-resizer').should('exist');
      cy.contains('button', 'Edit permission').click();
      cy.get('.sd-calendar__event').should('not.have.attr', 'draggable');
      cy.get('.sd-calendar__event-resizer').should('not.exist');
      cy.contains('button', 'Mount event').click();
      cy.get('[data-testid="event-registered"]').should('have.text', 'false');
      cy.contains('button', 'Mount event').click();
      cy.get('[data-testid="event-registered"]').should('have.text', 'true');
    });
    it('prioritizes all-day and view renderers and restores default month and all-day contents', () => {
      cy.contains('button', 'Custom event').click();
      cy.get('.sd-calendar__event-details').should('have.text', 'Generic Planning');
      cy.contains('button', 'Month mode').click();
      cy.get('.sd-calendar__event-details').should('have.text', 'Month Planning');
      cy.contains('button', 'All day mode').click();
      cy.get('.sd-calendar__event-details').should('have.text', 'All day Planning');
      cy.contains('button', 'Custom event').click();
      cy.get('.sd-calendar__event-time, .sd-calendar__event-content').should('not.exist');
      cy.contains('button', 'All day mode').click();
      cy.get('.sd-calendar__event-start').should('have.text', '10:00');
      cy.get('.sd-calendar__event-end, .sd-calendar__event-resizer').should('not.exist');
    });
    it('renders multiday fragments with clipped geometry and no duplicated time label', () => {
      cy.contains('button', 'Multiday event').click();
      cy.get('.sd-calendar__event-end').should('contain.text', '+2d');
      cy.get('.sd-calendar__event').should('have.class', 'sd-calendar__event--cut-bottom');
      cy.contains('button', 'Next fragment').click();
      cy.get('.sd-calendar__event-time, .sd-calendar__event-resizer').should('not.exist');
      cy.get('.sd-calendar__event')
        .should('have.class', 'sd-calendar__event--cut-top')
        .and('have.class', 'sd-calendar__event--cut-bottom');
    });
    it('deletes with the keyboard through the real events store', () => {
      cy.get('.sd-calendar__event-title').dblclick();
      cy.get('.sd-calendar__event-delete').should('be.visible').focus().type('{enter}');
      cy.get('[data-testid="event-count"]').should('have.text', '0');
      cy.get('[data-testid="event-log"]').should('contain.text', 'event-delete');
      cy.get('.sd-calendar__event').should('not.exist');
    });
    for (const release of ['pointerup', 'touchend', 'touchcancel']) {
      it(`does not forward a hold after ${release}`, () => {
        cy.clock(Date.now(), ['setTimeout', 'clearTimeout']);
        cy.get('.sd-calendar__event').then(($event) => {
          cy.wrap($event).trigger(release === 'pointerup' ? 'pointerdown' : 'touchstart', {
            isPrimary: true,
            eventConstructor: release === 'pointerup' ? 'PointerEvent' : 'Event',
            touches: [{ target: $event[0], clientX: 0, clientY: 0 }],
          });
        });
        cy.tick(100);
        cy.document().trigger(release, {
          eventConstructor: release === 'pointerup' ? 'PointerEvent' : 'Event',
        });
        cy.tick(1000);
        cy.get('[data-testid="event-log"]').should('not.contain.text', 'hold');
      });
    }
    it('forwards exactly one hold until the pointer is released', () => {
      cy.clock(Date.now(), ['setTimeout', 'clearTimeout']);
      cy.get('.sd-calendar__event').trigger('pointerdown', {
        isPrimary: true,
        eventConstructor: 'PointerEvent',
      });
      cy.tick(1000);
      cy.get('[data-testid="event-log"]').should('have.text', 'hold');
      cy.document().trigger('pointerup', { eventConstructor: 'PointerEvent' });
      cy.tick(1000);
      cy.get('[data-testid="event-log"]').should('have.text', 'hold');
    });
    it('resizes using the Core document gesture and removes hold timers on unmount', () => {
      cy.get('.sd-calendar__event-resizer').then(($el) => {
        const rect = $el[0].getBoundingClientRect();
        const clientX = rect.left + 20,
          clientY = rect.top + 4;
        cy.wrap($el).trigger('pointerdown', {
          isPrimary: true,
          eventConstructor: 'PointerEvent',
          clientX,
          clientY,
          button: 0,
        });
        cy.document().trigger('pointermove', {
          eventConstructor: 'PointerEvent',
          clientX,
          clientY: clientY + 60,
        });
        cy.document().trigger('pointerup', {
          eventConstructor: 'PointerEvent',
          clientX,
          clientY: clientY + 60,
        });
      });
      cy.get('[data-testid="event-end"]').should('have.text', '12:00');
      cy.clock();
      cy.contains('button', 'Clear log').click();
      cy.get('.sd-calendar__event').trigger('pointerdown', {
        isPrimary: true,
        eventConstructor: 'PointerEvent',
        clientX: 30,
        clientY: 100,
      });
      cy.contains('button', 'Mount event').then(($button) => $button[0].click());
      cy.tick(1500);
      cy.get('[data-testid="event-log"]').should('not.contain.text', 'hold');
    });
    it('forwards the native stage-two deletion notification without removing source data', () => {
      cy.contains('button', 'Visual delete').click();
      cy.get('[data-testid="event-log"]').should('contain.text', 'dom-deleted');
      cy.get('[data-testid="event-count"]').should('have.text', '1');
    });
    it('does not forward delete-button clicks to ordinary event click listeners', () => {
      cy.get('.sd-calendar__event-title').dblclick();
      cy.get('.sd-calendar__event-delete').should('be.visible');
      cy.contains('button', 'Clear log').click();
      cy.get('.sd-calendar__event-delete').click();
      cy.get('[data-testid="event-count"]').should('have.text', '0');
      cy.get('[data-testid="event-log"]').should('not.contain.text', 'click');
    });
    it('routes native drag events and prevents a resize grip from starting a drag', () => {
      cy.get('.sd-calendar__event-resizer').then(($el) => {
        const win = $el[0].ownerDocument.defaultView!;
        const event = new win.DragEvent('dragstart', { bubbles: true, cancelable: true });
        $el[0].dispatchEvent(event);
        expect(event.defaultPrevented).to.equal(true);
      });
      cy.get('[data-testid="event-log"]').should('not.contain.text', 'dragstart');
      cy.get('.sd-calendar__event').then(($el) => {
        const win = $el[0].ownerDocument.defaultView!;
        $el[0].dispatchEvent(new win.DragEvent('dragstart', { bubbles: true }));
        $el[0].dispatchEvent(new win.DragEvent('dragend', { bubbles: true }));
      });
      cy.get('[data-testid="event-log"]').should('contain.text', 'dragstart|dragend');
    });
  });
}

export {};
