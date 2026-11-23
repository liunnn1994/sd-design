describe('Calendar complete root approval lifecycle', () => {
  beforeEach(() => cy.visit('/calendar.html?fixture=approval-lifecycle'));
  const propose = () => {
    cy.get('.sd-calendar__body > .sd-calendar__cell')
      .first()
      .then(($cell) => {
        const element = $cell[0],
          rect = element.getBoundingClientRect();
        const win = element.ownerDocument.defaultView!;
        const clientX = rect.left + rect.width / 2,
          clientY = rect.top + 40;
        element.dispatchEvent(new win.MouseEvent('mousedown', { bubbles: true, clientX, clientY }));
        element.ownerDocument.dispatchEvent(
          new win.MouseEvent('mousemove', { clientX, clientY: clientY + 80 }),
        );
        element.ownerDocument.dispatchEvent(
          new win.MouseEvent('mouseup', { clientX, clientY: clientY + 80 }),
        );
      });
    cy.get('[data-testid="pending"]').should('have.text', 'pending');
  };
  it('keeps the original dates when approval arrives after navigation and leaving-cell disposal', () => {
    propose();
    cy.contains('button', 'Navigate').click();
    cy.get('.sd-calendar__scrollable-wrap > [inert]').should('not.exist');
    cy.get('.sd-calendar__body > .sd-calendar__cell').should(
      'have.attr',
      'data-start',
      String(new Date(2026, 10, 4).getTime()),
    );
    cy.contains('button', 'Approve').click();
    cy.contains('button', 'Read store').click();
    cy.get('[data-testid="snapshot"]').invoke('text').should('match', /^3:/);
    cy.contains('button', 'Return').click();
    cy.get('.sd-calendar__event-title').should('have.text', 'Approved');
    cy.get('[data-testid="created"]').should('have.text', '1');
  });
  it('ignores approval after the whole Calendar unmounts', () => {
    propose();
    cy.contains('button', 'Mount').click();
    cy.get('.sd-calendar').should('not.exist');
    cy.contains('button', 'Approve').click();
    cy.contains('button', 'Read store').click();
    cy.get('[data-testid="snapshot"]').should('have.text', '');
    cy.get('[data-testid="created"]').should('have.text', '0');
  });
  it('rejects the pending proposal and removes its placeholder', () => {
    propose();
    cy.contains('button', 'Reject').click();
    cy.get('.sd-calendar__event-placeholder, .sd-calendar__event').should('not.exist');
    cy.contains('button', 'Read store').click();
    cy.get('[data-testid="snapshot"]').should('have.text', '');
  });
});

describe('Calendar complete root prop boundaries', () => {
  beforeEach(() => cy.visit('/calendar.html?fixture=prop-boundaries'));
  it('copies and normalizes the initial date without mutating the caller date', () => {
    cy.contains('button', 'Read dates').click();
    cy.get('[data-testid="snapshot"]').should('have.text', '0:0:12:100');
  });
  it('clears selection and synchronizes a later string date', () => {
    cy.get('.sd-calendar__cell--selected').should('have.length', 1);
    cy.contains('button', 'Clear selected').click();
    cy.get('.sd-calendar__cell--selected').should('not.exist');
    cy.contains('button', 'December').click();
    cy.get('.sd-calendar__scrollable-wrap > [inert]').should('not.exist');
    cy.get('.sd-calendar__title').should('contain.text', 'December 2026');
  });
  it('ignores unknown views and stays navigable when every weekday is hidden', () => {
    cy.contains('button', 'Unknown view key').click();
    cy.get('.sd-calendar__scrollable-wrap > [inert]').should('not.exist');
    cy.get('.sd-calendar__body > .sd-calendar__cell').should('have.length', 1);
    cy.contains('button', 'Hide all weekdays').click();
    cy.get('.sd-calendar__scrollable-wrap > [inert]').should('not.exist');
    cy.get('.sd-calendar__body > .sd-calendar__cell').should('have.length', 10);
    cy.contains('button', 'Next').click();
    cy.get('.sd-calendar__scrollable-wrap > [inert]').should('not.exist');
    cy.get('.sd-calendar__body > .sd-calendar__cell').should('have.length', 10);
  });
  for (const boundary of ['minimum', 'maximum']) {
    it(`honors an epoch-zero ${boundary} without emitting selection`, () => {
      cy.contains('button', `Epoch ${boundary}`).click();
      cy.get('.sd-calendar__scrollable-wrap > [inert]').should('not.exist');
      cy.get('.sd-calendar__body > .sd-calendar__cell')
        .should('have.class', 'sd-calendar__cell--disabled')
        .click({ force: true });
      cy.get('[data-testid="selected-count"]').should('have.text', '0');
    });
  }
});

describe('Calendar complete root horizontal week', () => {
  it('keeps weekdays when switching orientation and restores weekends in horizontal view', () => {
    cy.visit('/calendar.html?fixture=prop-boundaries');
    const body = '.sd-calendar__body';
    const cells = `${body} > .sd-calendar__cell`;
    const weekdays = [6, 7, 8, 9, 10].map((day) => String(new Date(2025, 0, day).getTime()));
    cy.contains('button', 'Horizontal weekdays').click();
    cy.get(body)
      .should('have.length', 1)
      .and(($body) => {
        expect($body[0].style.getPropertyValue('--sd-calendar-grid-columns')).to.equal('1');
        expect($body[0].style.getPropertyValue('--sd-calendar-grid-rows')).to.equal('5');
      });
    cy.get(cells).should(($cells) => {
      expect([...$cells].map((cell) => cell.getAttribute('data-start'))).to.deep.equal(weekdays);
    });
    cy.contains('button', 'Change orientation').click();
    cy.get(body)
      .should('have.length', 1)
      .and(($body) => {
        expect($body[0].style.getPropertyValue('--sd-calendar-grid-columns')).to.equal('5');
        expect($body[0].style.getPropertyValue('--sd-calendar-grid-rows')).to.equal('1');
      });
    cy.get(cells).should(($cells) => {
      expect([...$cells].map((cell) => cell.getAttribute('data-start'))).to.deep.equal(weekdays);
    });
    cy.contains('button', 'Change orientation').click();
    cy.contains('button', 'Show weekends').click();
    cy.get(cells).should('have.length', 7);
    cy.get(body).should(($body) => {
      expect($body[0].style.getPropertyValue('--sd-calendar-grid-rows')).to.equal('7');
    });
  });
});

describe('Calendar complete root resize lifecycle', () => {
  beforeEach(() => cy.visit('/calendar.html?fixture=resize-lifecycle'));
  const move = (fractions: number[], release?: number) =>
    cy.get('.sd-calendar__event-resizer').then(($resizer) => {
      const element = $resizer[0],
        cell = element.closest('.sd-calendar__cell')!;
      const rect = cell.getBoundingClientRect(),
        win = element.ownerDocument.defaultView!;
      const clientX = rect.left + rect.width / 2;
      element.dispatchEvent(
        new win.MouseEvent('mousedown', {
          bubbles: true,
          clientX,
          clientY: rect.top + rect.height * 0.4,
        }),
      );
      for (const fraction of fractions)
        element.ownerDocument.dispatchEvent(
          new win.MouseEvent('mousemove', {
            bubbles: true,
            cancelable: true,
            clientX,
            clientY: rect.top + rect.height * fraction,
          }),
        );
      if (release)
        element.ownerDocument.dispatchEvent(
          new win.MouseEvent('mouseup', {
            bubbles: true,
            clientX,
            clientY: rect.top + rect.height * release,
          }),
        );
    });
  it('keeps the newest approved move when promises resolve out of order', () => {
    move([0.6, 0.8]);
    cy.get('[data-testid="requests"]').should('have.text', '2');
    cy.contains('button', 'Approve second').then(($button) => $button[0].click());
    cy.get('.sd-calendar__event-end').should('contain.text', '13:00');
    cy.contains('button', 'Approve first').then(($button) => $button[0].click());
    cy.contains('button', 'Read event').then(($button) => $button[0].click());
    cy.get('[data-testid="snapshot"]').should('have.text', '13:0:13:00');
  });
  it('ignores pending move approval after mouseup finalizes another position', () => {
    move([0.6], 0.8);
    cy.get('[data-testid="requests"]').should('have.text', '1');
    cy.get('.sd-calendar').should('not.have.class', 'sd-calendar--resizing-event');
    cy.contains('button', 'Read event').then(($button) => $button[0].click());
    cy.get('[data-testid="snapshot"]')
      .invoke('text')
      .then((final) => {
        cy.contains('button', 'Approve first').then(($button) => $button[0].click());
        cy.contains('button', 'Read event').then(($button) => $button[0].click());
        cy.get('[data-testid="snapshot"]').should('have.text', final);
      });
  });
  it('cancels a touch gesture without accepting a pending resize or emitting resize-end', () => {
    cy.get('.sd-calendar__event-resizer').then(($resizer) => {
      const element = $resizer[0],
        rect = element.getBoundingClientRect();
      const point = { target: element, clientX: rect.left + rect.width / 2, clientY: rect.top };
      cy.wrap($resizer).trigger('touchstart', { force: true, touches: [point] });
      cy.document().trigger('touchmove', { touches: [{ ...point, clientY: rect.top + 60 }] });
    });
    cy.get('[data-testid="requests"]').should('have.text', '1');
    cy.document().trigger('touchcancel');
    cy.get('.sd-calendar').should('not.have.class', 'sd-calendar--resizing-event');
    cy.contains('button', 'Approve first').then(($button) => $button[0].click());
    cy.contains('button', 'Read event').then(($button) => $button[0].click());
    cy.get('[data-testid="snapshot"]').should('have.text', '11:0:11:00');
    cy.get('[data-testid="ends"]').should('have.text', '0');
  });
  for (const end of [false, true]) {
    it(`ignores pending ${end ? 'end' : 'move'} approval after whole-calendar unmount`, () => {
      if (end) cy.contains('button', 'Defer end').click();
      move([0.6], end ? 0.8 : undefined);
      cy.get('[data-testid="requests"]').should('have.text', '1');
      cy.contains('button', 'Mount').then(($button) => $button[0].click());
      cy.get('.sd-calendar').should('not.exist');
      cy.contains('button', 'Read event').then(($button) => $button[0].click());
      cy.get('[data-testid="snapshot"]')
        .invoke('text')
        .then((before) => {
          cy.contains('button', 'Approve first').then(($button) => $button[0].click());
          cy.contains('button', 'Read event').then(($button) => $button[0].click());
          cy.get('[data-testid="snapshot"]').should('have.text', before);
        });
    });
  }
});

describe('Calendar root special-hours boundaries', () => {
  const visit = (horizontal: boolean, extra = '') =>
    cy.visit(`/calendar.html?fixture=special-hours${horizontal ? '&horizontal' : ''}${extra}`);
  const point = (rect: DOMRect, horizontal: boolean, hour: number) => ({
    bubbles: true,
    cancelable: true,
    clientX: rect.left + rect.width * (horizontal ? (hour - 9) / 8 : 0.5),
    clientY: rect.top + rect.height * (horizontal ? 0.5 : (hour - 9) / 8),
  });
  for (const horizontal of [false, true]) {
    for (const backwards of [false, true]) {
      it(`clamps ${horizontal ? 'horizontal' : 'vertical'} ${backwards ? 'backward' : 'forward'} creation`, () => {
        visit(horizontal);
        cy.get('.sd-calendar__body > .sd-calendar__cell')
          .first()
          .then(($cell) => {
            const cell = $cell[0];
            const rect = cell.getBoundingClientRect();
            const win = cell.ownerDocument.defaultView!;
            expect(horizontal ? rect.width : rect.height).to.be.greaterThan(100);
            cell.dispatchEvent(
              new win.MouseEvent('mousedown', point(rect, horizontal, backwards ? 14 : 10)),
            );
            cell.ownerDocument.dispatchEvent(
              new win.MouseEvent('mousemove', point(rect, horizontal, backwards ? 10 : 14)),
            );
            cell.ownerDocument.dispatchEvent(
              new win.MouseEvent('mouseup', point(rect, horizontal, backwards ? 10 : 14)),
            );
          });
        cy.get('.sd-calendar__event').should('have.length', 1);
        cy.get('.sd-calendar__event-start').should('have.text', backwards ? '13:00' : '10:00');
        cy.get('.sd-calendar__event-end').should('contain.text', backwards ? '14:00' : '12:00');
      });
    }
    for (const hour of [10, 11, 12, 13]) {
      it(`${horizontal ? 'horizontal' : 'vertical'} drop at ${hour}:00 respects blocked hours`, () => {
        visit(horizontal);
        cy.get('.sd-calendar__body > .sd-calendar__cell')
          .first()
          .then(($cell) => {
            const rect = $cell[0].getBoundingClientRect();
            expect(horizontal ? rect.width : rect.height).to.be.greaterThan(100);
            const transfer = new DataTransfer();
            transfer.setData('event', JSON.stringify({ title: 'Dropped', duration: 60 }));
            cy.wrap($cell).trigger('drop', {
              ...point(rect, horizontal, hour),
              dataTransfer: transfer,
              force: true,
            });
          });
        if (hour === 12) {
          cy.get('[data-testid="drops"]').should('have.text', '0');
          cy.get('.sd-calendar__event').should('not.exist');
        } else {
          cy.get('[data-testid="drops"]').should('have.text', '1');
          cy.get('.sd-calendar__event-start').should('have.text', `${hour}:00`);
          cy.get('.sd-calendar__event-end').should('contain.text', `${hour + 1}:00`);
        }
      });
    }
    it(`clamps ${horizontal ? 'horizontal' : 'vertical'} resizing at a blocked range`, () => {
      visit(horizontal, '&resize');
      cy.get('.sd-calendar__event-resizer')
        .should('be.visible')
        .then(($resizer) => {
          const resizer = $resizer[0];
          const rect = resizer.closest('.sd-calendar__cell')!.getBoundingClientRect();
          const win = resizer.ownerDocument.defaultView!;
          expect(horizontal ? rect.width : rect.height).to.be.greaterThan(100);
          resizer.dispatchEvent(new win.MouseEvent('mousedown', point(rect, horizontal, 11)));
          resizer.ownerDocument.dispatchEvent(
            new win.MouseEvent('mousemove', point(rect, horizontal, 13.5)),
          );
          resizer.ownerDocument.dispatchEvent(
            new win.MouseEvent('mouseup', point(rect, horizontal, 13.5)),
          );
        });
      cy.get('.sd-calendar__event-start').should('have.text', '10:00');
      cy.get('.sd-calendar__event-end').should('contain.text', '12:00');
      cy.get('.sd-calendar').should('not.have.class', 'sd-calendar--resizing-event');
    });
  }
  for (const schedule of [1, 2]) {
    it(`applies the special-hours override for schedule ${schedule}`, () => {
      visit(false, '&schedules');
      cy.get(`.sd-calendar__schedule--cell[data-schedule="${schedule}"]`).then(($schedule) => {
        const rect = $schedule[0].getBoundingClientRect();
        expect(rect.height).to.be.greaterThan(100);
        const transfer = new DataTransfer();
        transfer.setData('event', JSON.stringify({ title: 'Scheduled', duration: 60 }));
        cy.wrap($schedule).trigger('drop', {
          ...point(rect, false, 12),
          dataTransfer: transfer,
          force: true,
        });
      });
      cy.get('[data-testid="drops"]').should('have.text', schedule === 1 ? '0' : '1');
      if (schedule === 1) cy.get('.sd-calendar__event').should('not.exist');
      else
        cy.get('.sd-calendar__schedule--cell[data-schedule="2"] .sd-calendar__event-start').should(
          'have.text',
          '12:00',
        );
    });
  }
});

describe('Calendar complete root locale controls', () => {
  beforeEach(() => cy.visit('/calendar.html?fixture=locale-root'));
  it('keeps English and Chinese instances independent after navigation', () => {
    cy.get('#provider .sd-calendar__title').should('contain.text', '一月');
    cy.get('#english .sd-calendar__title').should('contain.text', 'January');
    cy.get('#english .sd-calendar__nav--next').click();
    cy.get('#english .sd-calendar__title').should('have.length', 1).and('contain.text', 'February');
    cy.get('#provider .sd-calendar__nav--next').click();
    cy.get('#provider .sd-calendar__title').should('have.length', 1).and('contain.text', '二月');
    cy.get('#english .sd-calendar__title').should('contain.text', 'February');
  });
  it('refreshes provider messages without changing the locale name', () => {
    cy.get('#provider .sd-calendar__nav--today').should('have.text', '今天');
    cy.contains('button', 'Provider message').click();
    cy.get('#provider .sd-calendar__nav--today').should('have.text', '回到今天');
    cy.get('#english .sd-calendar__nav--today').should('have.text', 'Today');
  });
  it('refreshes the active global language pack without overriding provider messages', () => {
    cy.contains('button', 'Global language').click();
    cy.get('#global .sd-calendar__nav--today').should('have.text', '今天');
    cy.contains('button', 'Global message').click();
    cy.get('#global .sd-calendar__nav--today').should('have.text', '返回当天');
    cy.get('#provider .sd-calendar__nav--today').should('have.text', '今天');
    cy.get('#english .sd-calendar__nav--today').should('have.text', 'Today');
  });
  for (const alias of [false, true]) {
    it(`updates full, short and extra-short labels with ${alias ? 'en' : 'en-us'}`, () => {
      if (alias) cy.contains('button', 'English alias').click();
      cy.get('#english .sd-calendar__view-button').contains('Week').click();
      cy.get('#english .sd-calendar__nav--today').should('have.text', 'Today');
      cy.get('#english .sd-calendar__view-button').should('contain.text', 'Month');
      cy.get('#english .sd-calendar__weekday-day').first().should('have.text', 'Monday');
      cy.contains('button', 'Smaller').click();
      cy.get('#english .sd-calendar__weekday-day').first().should('have.text', 'Mon');
      cy.contains('button', 'Smaller').click();
      cy.get('#english .sd-calendar__weekday-day').first().should('have.text', 'Mo');
      cy.contains('button', 'Chinese').click();
      cy.get('#english .sd-calendar__nav--today').should('have.text', '今天');
    });
  }
});

describe('Calendar complete root week navigation', () => {
  beforeEach(() => cy.visit('/calendar.html?fixture=locale-root&week'));

  it('renders the ISO week rollover in both English and Chinese titles', () => {
    for (const id of ['english', 'provider']) {
      const calendar = `#${id}`;
      cy.get(`${calendar} .sd-calendar__title small`).should('contain.text', '53');
      cy.get(`${calendar} .sd-calendar__nav--next`).click();
      cy.get(`${calendar} .sd-calendar__title small`)
        .should('have.length', 1)
        .and(($title) => expect($title.text().trim()).to.match(/\s1$/));
    }
  });

  it('keeps Monday and Sunday starts independent after both calendars navigate', () => {
    const monday = '#english';
    const sunday = '#global';
    cy.get(`${monday} .sd-calendar__nav--next`).click();
    cy.get(`${sunday} .sd-calendar__nav--next`).click();
    for (const [calendar, day] of [
      [monday, 4],
      [sunday, 3],
    ] as const) {
      cy.get(`${calendar} .sd-calendar__body`).should('have.length', 1);
      cy.get(`${calendar} .sd-calendar__cell`)
        .first()
        .should('have.attr', 'data-start', String(new Date(2021, 0, day).getTime()));
    }
  });
});

export {};
