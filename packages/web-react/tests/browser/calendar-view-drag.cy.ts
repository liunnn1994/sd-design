{
  let transfer: DataTransfer;
  let source: HTMLElement;
  const startDrag = () =>
    cy
      .get('[data-testid="source"] .sd-calendar__event')
      .first()
      .then(($el) => {
        source = $el[0];
        const win = source.ownerDocument.defaultView!;
        transfer = new win.DataTransfer();
        const rect = source.getBoundingClientRect();
        source.dispatchEvent(
          new win.DragEvent('dragstart', {
            bubbles: true,
            cancelable: true,
            dataTransfer: transfer,
            clientX: rect.left + 10,
            clientY: rect.top,
          }),
        );
        expect(transfer.getData('event')).to.contain('Move me');
      });
  const dropOn = (id: string, index = 2) =>
    cy
      .get(`[data-testid="${id}"] .sd-calendar__body > .sd-calendar__cell`)
      .eq(index)
      .then(($el) => {
        const element = $el[0];
        const win = element.ownerDocument.defaultView!;
        const rect = element.getBoundingClientRect();
        const options = {
          bubbles: true,
          cancelable: true,
          dataTransfer: transfer,
          clientX: rect.left + rect.width / 2,
          clientY: rect.top + 120 + Number(transfer.getData('cursor-grab-at')),
        };
        element.dispatchEvent(new win.DragEvent('dragenter', options));
        element.dispatchEvent(new win.DragEvent('dragover', options));
        element.dispatchEvent(new win.DragEvent('drop', options));
        source.dispatchEvent(
          new win.DragEvent('dragend', { bubbles: true, dataTransfer: transfer }),
        );
      });
  describe('Calendar native drag adapter', () => {
    beforeEach(() => cy.visit('/calendar.html?fixture=drag'));
    it('moves an event to another day with metadata and duration updated', () => {
      startDrag();
      dropOn('source');
      cy.get('[data-testid="source"] [data-testid="drag-events"]').should(
        'have.text',
        'Move me:2026-11-04 11:00-12:00',
      );
      cy.get('[data-testid="source"] [data-testid="drag-count"]').should('have.text', '1');
      cy.get('[data-testid="source"] [data-testid="drag-log"]')
        .should('contain.text', 'event-drag-start')
        .and('contain.text', 'event-drag-end')
        .and('contain.text', 'event-dropped');
    });
    it('moves between real event stores without requiring deletion permission', () => {
      startDrag();
      dropOn('target');
      cy.get('[data-testid="source"] [data-testid="drag-count"]').should('have.text', '0');
      cy.get('[data-testid="target"] [data-testid="drag-events"]').should(
        'have.text',
        'Move me:2026-11-04 11:00-12:00',
      );
    });
    it('retains the source when the target rejects the drop', () => {
      cy.get('[data-testid="target"]').contains('button', 'Reject drop').click();
      startDrag();
      dropOn('target');
      cy.get('[data-testid="target"] [data-testid="drag-log"]').should(
        'contain.text',
        'event-dropped',
      );
      cy.get('[data-testid="target"] [data-testid="drag-count"]').should('have.text', '0');
      cy.get('[data-testid="source"] [data-testid="drag-events"]').should(
        'have.text',
        'Move me:2026-11-03 10:00-11:00',
      );
    });
    it('moves the rendered event when approval arrives after native dragend', () => {
      cy.get('[data-testid="target"]').contains('button', 'Defer drop').click();
      startDrag();
      dropOn('target');
      cy.get('[data-testid="source"] .sd-calendar__event-title').should('have.text', 'Move me');
      cy.get('[data-testid="target"] .sd-calendar__event').should('not.exist');
      cy.contains('button', 'Accept pending drop').click();
      cy.get('[data-testid="target"] .sd-calendar__event-title').should('have.text', 'Move me');
      cy.get('[data-testid="source"] .sd-calendar__event').should('not.exist');
    });
    it('ignores delayed approval after the destination unmounts and reconnects cleanly', () => {
      cy.get('[data-testid="target"]').contains('button', 'Defer drop').click();
      startDrag();
      dropOn('target');
      cy.contains('button', 'Mount target').click();
      cy.get('[data-testid="target"]').should('not.exist');
      cy.contains('button', 'Accept pending drop').click();
      cy.get('[data-testid="source"] [data-testid="drag-count"]').should('have.text', '1');
      cy.contains('button', 'Mount target').click();
      startDrag();
      dropOn('target');
      cy.get('[data-testid="target"] [data-testid="drag-count"]').should('have.text', '1');
      cy.get('[data-testid="source"] [data-testid="drag-count"]').should('have.text', '0');
    });
    it('cancels hover navigation when leaving a month cell', () => {
      cy.clock();
      cy.get('[data-testid="target"]').contains('button', 'Month view').click();
      startDrag();
      cy.get('[data-testid="target"] .sd-calendar__cell')
        .eq(3)
        .then(($el) => {
          const win = $el[0].ownerDocument.defaultView!;
          $el[0].dispatchEvent(
            new win.DragEvent('dragenter', { bubbles: true, dataTransfer: transfer }),
          );
          $el[0].dispatchEvent(
            new win.DragEvent('dragleave', {
              bubbles: true,
              cancelable: true,
              dataTransfer: transfer,
            }),
          );
        });
      cy.tick(2100);
      cy.get('[data-testid="target"] [data-testid="drag-view"]').should('have.text', 'month');
    });
    it('does not leave a hidden original when dragstart and dragend occur before the next timer', () => {
      cy.clock();
      cy.get('[data-testid="source"] .sd-calendar__event')
        .first()
        .then(($el) => {
          const element = $el[0],
            win = element.ownerDocument.defaultView!;
          const dataTransfer = new win.DataTransfer();
          element.dispatchEvent(new win.DragEvent('dragstart', { bubbles: true, dataTransfer }));
          element.dispatchEvent(new win.DragEvent('dragend', { bubbles: true, dataTransfer }));
        });
      cy.tick(0);
      cy.get('[data-testid="source"] .sd-calendar__event')
        .should('not.have.class', 'sd-calendar__event--dragging-original')
        .and('not.have.class', 'sd-calendar__event--dragging-ghost');
    });
  });
}

describe('Calendar external native drop destination', () => {
  for (const allDay of [true, false]) {
    it(`uses destination allDay=${allDay} for an external event`, () => {
      cy.visit('/calendar.html?fixture=special-hours&external');
      const destination = allDay ? '.sd-calendar__all-day' : '.sd-calendar__body';
      cy.get(`${destination} .sd-calendar__cell`)
        .first()
        .then(($cell) => {
          const cell = $cell[0];
          const win = cell.ownerDocument.defaultView!;
          const dataTransfer = new win.DataTransfer();
          dataTransfer.setData(
            'event',
            JSON.stringify({ title: 'External', duration: 60, allDay: !allDay }),
          );
          const rect = cell.getBoundingClientRect();
          cell.dispatchEvent(
            new win.DragEvent('drop', {
              bubbles: true,
              cancelable: true,
              dataTransfer,
              clientX: rect.left + 10,
              clientY: rect.top + rect.height / 8,
            }),
          );
        });
      cy.get('[data-testid="drops"]').should('have.text', '1');
      cy.get('[data-testid="dropped"]').should('have.text', `true:${allDay}`);
      cy.get('.sd-calendar__event-title').should('have.length', 1);
      cy.get(`${destination} .sd-calendar__event-title`).should('have.text', 'External');
    });
  }
});

export {};
