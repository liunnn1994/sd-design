describe('React DatePicker public value and popup lifecycle', () => {
  for (const range of [false, true]) {
    const name = range ? 'range' : 'date';
    const panel = range ? '.sd-picker-range-container' : '.sd-picker-container';
    const inputs = '.sd-picker input';
    const events = '[data-testid="events"]';
    const visit = (query: string) =>
      range
        ? cy.visit(`/date-picker-range-root.html?${query}`)
        : cy.visit(`/date-picker-root.html?${query}`);
    const clickDay = (date: string) =>
      cy.get(`[role="gridcell"][aria-label="${date}"]`).filter(':visible').first().click();

    it(`updates a mounted ${name} panel header icon without disrupting navigation`, () => {
      visit('inline&icons');
      cy.get('[data-testid="next-icon"]').should('not.exist');
      cy.contains('button', 'Toggle header icon').click();
      cy.get('[data-testid="next-icon"]').should('be.visible').first().click();
      cy.get('.sd-picker-header-title').should('contain.text', '2027');
      cy.contains('button', 'Toggle header icon').click();
      cy.get('[data-testid="next-icon"]').should('not.exist');
      cy.get('.sd-picker-header-title').should('contain.text', '2027');
    });

    it(`replaces and clears an unconfirmed ${name} from the parent`, () => {
      visit('controlled&confirm&draft');
      cy.get(panel).should('be.visible');
      clickDay('2026-11-20');
      cy.get(inputs).first().should('have.value', '2026-11-20');
      cy.contains('button', 'External value').click();
      cy.get(inputs).first().should('have.value', '2028-02-02');
      if (range) cy.get(inputs).eq(1).should('have.value', '2028-03-03');
      const selectedCell = cy
        .get('[role="gridcell"][aria-label="2028-02-02"]')
        .filter(':visible')
        .first();
      if (range) selectedCell.should('have.class', 'sd-picker-cell-range-start');
      else selectedCell.should('have.attr', 'aria-selected', 'true');
      clickDay('2028-02-12');
      cy.get(inputs).first().should('have.value', '2028-02-12');
      cy.contains('button', 'Clear external value').click();
      cy.get(inputs).each(($input) => cy.wrap($input).should('have.value', ''));
      cy.get(events).should('not.contain.text', 'value:').and('not.contain.text', 'change:');
    });

    it(`discards an unconfirmed ${name} on outside click and removes its popup on unmount`, () => {
      visit('confirm&lifecycle');
      cy.get(panel).should('be.visible');
      clickDay('2026-11-20');
      cy.get(inputs).first().should('have.value', '2026-11-20');
      cy.contains('button', 'Outside picker').click();
      cy.get(panel).should('not.exist');
      cy.get(inputs).first().should('have.value', '2026-11-08').click();
      cy.get(panel).should('be.visible');
      cy.get(inputs).first().should('have.value', '2026-11-08');
      if (range) cy.get(inputs).eq(1).should('have.value', '2026-12-18');
      cy.get(events).should('not.contain.text', 'change:');
      cy.contains('button', 'Toggle picker').click();
      cy.get(inputs).should('not.exist');
      cy.get(panel).should('not.exist');
    });

    it(`renders an epoch-zero ${name} in UTC and follows a later timestamp`, () => {
      visit('epoch');
      cy.get(inputs).first().should('have.value', '1970-01-01 00:00:00');
      if (range) cy.get(inputs).eq(1).should('have.value', '1970-01-02 00:00:00');
      cy.contains('button', 'External value').click();
      cy.get(inputs).first().should('have.value', '1970-01-02 00:00:00');
      if (range) cy.get(inputs).eq(1).should('have.value', '1970-01-03 00:00:00');
      cy.get(events).should('be.empty');
    });
  }
});

describe('React DatePicker native input and period restrictions', () => {
  it('updates native input attributes without replacing the selected date', () => {
    cy.visit('/date-picker-root.html?input-props');
    cy.get('input[aria-label="Appointment"]').should('have.attr', 'maxlength', '10');
    cy.contains('button', 'Update input attributes').click();
    cy.get('input[aria-label="Appointment"]').should('not.exist');
    cy.get('input[aria-label="Updated appointment"]')
      .should('have.value', '2026-11-08')
      .and('not.have.attr', 'maxlength');
  });

  it('preserves endpoint disabled and readonly state ahead of native input attributes', () => {
    cy.visit('/date-picker-range-root.html?locked');
    cy.contains('button', 'Readonly').click();
    cy.get('input[aria-label="Start"]').should('be.disabled').and('have.prop', 'readOnly', true);
    cy.get('input[aria-label="End"]').should('not.be.disabled').and('have.prop', 'readOnly', true);
  });

  for (const [mode, expected] of [
    ['month', '2027-07,2027-08'],
    ['quarter', '2027-07,2027-10'],
    ['year', '2027,2028'],
  ]) {
    it(`commits a ${mode} range shortcut when only the first day of each period is disabled`, () => {
      cy.visit(`/date-picker-range-root.html?inline&mode=${mode}`);
      cy.contains('.sd-picker-shortcuts button', 'Period range').click();
      cy.get('[data-testid="events"]').should('have.text', `value:${expected}|change:${expected}`);
    });
  }
});

describe('React RangePicker endpoint validation', () => {
  for (const outcome of ['reject', 'accept']) {
    it(`${outcome}s a reversed shortcut using the sorted endpoint roles`, () => {
      cy.visit(`/date-picker-range-root.html?inline&sorted=${outcome}`);
      cy.contains('.sd-picker-shortcuts button', 'Reversed range').click();
      cy.get('[data-testid="events"]').should(
        'have.text',
        outcome === 'accept' ? 'value:2026-11-15,2026-12-15|change:2026-11-15,2026-12-15' : '',
      );
    });
  }

  for (const locked of ['start', 'end']) {
    for (const action of ['crossing click', 'shortcut']) {
      it(`preserves the locked ${locked} endpoint after a ${action}`, () => {
        cy.visit(`/date-picker-range-root.html?boundary=${locked}`);
        const start = () => cy.get('input[aria-label="Start"]');
        const end = () => cy.get('input[aria-label="End"]');
        cy.get(`input[aria-label="${locked === 'start' ? 'Start' : 'End'}"]`).should('be.disabled');
        if (action === 'shortcut') {
          cy.contains('.sd-picker-shortcuts button', 'Replace both dates').click();
        } else {
          const date = locked === 'start' ? '2026-11-01' : '2026-12-25';
          cy.get(`[role="gridcell"][aria-label="${date}"]:visible`).first().click();
        }
        start().should('have.value', '2026-11-08');
        end().should('have.value', '2026-12-18');
        cy.get('[data-testid="events"]').should('not.contain.text', 'value:');
        cy.get('[data-testid="events"]').should('not.contain.text', 'change:');
      });
    }
  }
});

describe('React DatePicker single root adapter', () => {
  it('opens the real popup and commits a date cell', () => {
    cy.visit('/date-picker-root.html');
    cy.get('.sd-picker input').should('have.value', '2026-11-08').click();
    cy.get('.sd-picker-container').should('be.visible');
    cy.get('[role="gridcell"][aria-label="2026-11-20"]').click();
    cy.get('.sd-picker input').should('have.value', '2026-11-20');
    cy.get('[data-testid="events"]').should('have.text', 'value:2026-11-20|change:2026-11-20');
    cy.get('body').find('.sd-picker-container:visible').should('not.exist');
  });
  it('keeps selections pending until the footer confirms', () => {
    cy.visit('/date-picker-root.html?confirm');
    cy.get('.sd-picker input').click();
    cy.get('[role="gridcell"][aria-label="2026-11-20"]').click();
    cy.get('[data-testid="events"]').should('have.text', 'select:2026-11-20');
    cy.get('.sd-picker-btn-confirm').click();
    cy.get('[data-testid="events"]').should(
      'contain.text',
      'value:2026-11-20|change:2026-11-20|ok:2026-11-20',
    );
  });
  it('supports typed Enter submission through the actual input', () => {
    cy.visit('/date-picker-root.html?confirm');
    cy.get('.sd-picker input').clear().type('2026-12-20{enter}');
    cy.get('.sd-picker input').should('have.value', '2026-12-20');
    cy.get('[data-testid="events"]').should('contain.text', 'change:2026-12-20');
  });
  it('restores rejected controlled input and accepts writeback and external values', () => {
    cy.visit('/date-picker-root.html?controlled&confirm');
    cy.get('.sd-picker input').clear().type('2026-12-20{enter}');
    cy.get('.sd-picker input').should('have.value', '2026-11-08');
    cy.contains('button', 'Accept').click();
    cy.get('.sd-picker input').clear().type('2026-12-20{enter}');
    cy.get('.sd-picker input').should('have.value', '2026-12-20');
    cy.contains('button', 'External value').click();
    cy.get('.sd-picker input').should('have.value', '2028-02-02');
  });
  it('forwards native attributes, layout and imperative focus/blur', () => {
    cy.visit('/date-picker-root.html');
    cy.get('#root-picker').should('have.class', 'custom-root').and('have.css', 'width', '300px');
    cy.get('input[aria-label="Appointment"]').should('have.attr', 'title', 'Native date input');
    cy.contains('button', 'Focus input').click();
    cy.get('.sd-picker input').should('be.focused');
    cy.contains('button', 'Blur input').click();
    cy.get('.sd-picker input').should('not.be.focused');
  });
  it('keeps readonly feedback and native disabled state', () => {
    cy.visit('/date-picker-root.html');
    cy.contains('button', 'Readonly').click();
    cy.get('.sd-picker input').should('have.attr', 'readonly');
    cy.get('.sd-picker input').focus().trigger('keydown', { key: 'Backspace' });
    cy.get('.sd-tooltip-content').should('contain.text', 'Locked date');
    cy.get('.sd-picker-clear-icon').should('not.exist');
    cy.contains('button', 'Disabled').click();
    cy.get('.sd-picker input').should('be.disabled');
  });
  it('makes functional display formatting readonly while allowing panel selection', () => {
    cy.visit('/date-picker-root.html?format');
    cy.get('.sd-picker input').should('have.value', 'Date 2026').and('have.attr', 'readonly');
    cy.get('.sd-picker input').click();
    cy.get('[role="gridcell"][aria-label="2026-11-20"]').click();
    cy.get('[data-testid="events"]').should('contain.text', 'change:2026-11-20');
  });
  it('supports inline panel attributes and custom panel rendering', () => {
    cy.visit('/date-picker-root.html?inline&panel');
    cy.get('.sd-picker input').should('not.exist');
    cy.get('[data-testid="custom-panel"] #root-picker').should(
      'have.class',
      'sd-picker-container-panel-only',
    );
    cy.get('#root-picker').should('have.class', 'custom-root').and('have.css', 'width', '300px');
    cy.get('[role="gridcell"][aria-label="2026-11-20"]').click();
    cy.get('[data-testid="events"]').should('contain.text', 'change:2026-11-20');
    cy.get('[data-testid="clicks"]').should('have.text', '1');
  });
  it('uses custom trigger state and updates its committed display', () => {
    cy.visit('/date-picker-root.html?custom');
    cy.get('[data-testid="custom"]').should('have.text', '2026-11-08|false').click();
    cy.get('[data-testid="custom"]').should('have.text', '2026-11-08|true');
    cy.get('[role="gridcell"][aria-label="2026-11-20"]').click();
    cy.get('[data-testid="custom"]').should('have.text', '2026-11-20|false');
  });
  it('applies local locale labels and disables keyboard editing independently', () => {
    cy.visit('/date-picker-root.html?locale&confirm&noinput');
    cy.get('.sd-picker input')
      .should('have.attr', 'placeholder', 'Pick a date')
      .and('have.attr', 'readonly');
    cy.get('.sd-picker input').click();
    cy.get('.sd-picker-btn-confirm').should('have.text', 'Confirm custom');
    cy.get('.sd-picker-footer-extra-wrapper').should('have.text', 'Extra footer');
  });
  it('rejects disabled cells and commits pending time from the embedded clock', () => {
    cy.visit('/date-picker-root.html?time');
    cy.get('.sd-picker input').click();
    cy.get('[role="gridcell"][aria-label="2026-11-21"]').click();
    cy.get('[data-testid="events"]').should('have.text', '');
    cy.get('.sd-timepicker-column').first().contains('li', /^18$/).click();
    cy.get('.sd-picker-btn-confirm').click();
    cy.get('.sd-picker input').should('have.value', '2026-11-08 18:30:00');
  });
});

describe('React RangePicker root adapter', () => {
  it('opens two real panels and commits a clicked endpoint', () => {
    cy.visit('/date-picker-range-root.html');
    cy.get('input[aria-label="Start"]').click();
    cy.get('.sd-panel-date').should('have.length', 2);
    cy.get('[role="gridcell"][aria-label="2026-11-20"]').filter(':visible').first().click();
    cy.get('input[aria-label="Start"]').should('have.value', '2026-11-20');
    cy.get('input[aria-label="End"]').should('have.value', '2026-12-18');
    cy.get('[data-testid="events"]').should('contain.text', 'change:2026-11-20,2026-12-18');
  });
  it('keeps a clicked range pending until confirmation', () => {
    cy.visit('/date-picker-range-root.html?confirm');
    cy.get('input[aria-label="Start"]').click();
    cy.get('[role="gridcell"][aria-label="2026-11-20"]').filter(':visible').first().click();
    cy.get('[data-testid="events"]').should('not.contain.text', 'change:');
    cy.get('.sd-picker-btn-confirm').click();
    cy.get('[data-testid="events"]').should(
      'contain.text',
      'change:2026-11-20,2026-12-18|ok:2026-11-20,2026-12-18',
    );
  });
  it('replaces typed text and sorts range endpoints on Enter', () => {
    cy.visit('/date-picker-range-root.html');
    cy.get('input[aria-label="Start"]').click().type('{selectall}2027-01-20{enter}');
    cy.get('input[aria-label="Start"]').should('have.value', '2026-12-18');
    cy.get('input[aria-label="End"]').should('have.value', '2027-01-20');
  });
  it('keeps an empty editing draft until blur or confirmation', () => {
    cy.visit('/date-picker-range-root.html');
    cy.get('input[aria-label="Start"]').click().clear().should('have.value', '');
    cy.get('[data-testid="events"]').should('not.contain.text', 'change:');
  });
  it('restores rejected controlled edits and accepts parent writeback', () => {
    cy.visit('/date-picker-range-root.html?controlled');
    cy.get('input[aria-label="Start"]').click().type('{selectall}2026-11-20{enter}');
    cy.get('input[aria-label="Start"]').should('have.value', '2026-11-08');
    cy.contains('button', 'Accept').click();
    cy.get('input[aria-label="Start"]').click().type('{selectall}2026-11-20{enter}');
    cy.get('input[aria-label="Start"]').should('have.value', '2026-11-20');
    cy.contains('button', 'External value').click();
    cy.get('input[aria-label="End"]').should('have.value', '2028-03-03');
  });
  it('focuses the enabled endpoint while protecting a locked start', () => {
    cy.visit('/date-picker-range-root.html?locked');
    cy.get('input[aria-label="Start"]').should('be.disabled');
    cy.get('input[aria-label="End"]').click().should('be.focused');
    cy.get('[role="gridcell"][aria-label="2026-12-20"]').filter(':visible').last().click();
    cy.get('input[aria-label="Start"]').should('have.value', '2026-11-08');
    cy.get('input[aria-label="End"]').should('have.value', '2026-12-20');
  });
  it('forwards layout, native attributes, separators and endpoint focus refs', () => {
    cy.visit('/date-picker-range-root.html');
    cy.get('#range-root').should('have.class', 'native-range').and('have.css', 'width', '450px');
    cy.get('.sd-picker-separator').should('have.text', 'to');
    cy.get('input[aria-label="End"]').should('have.attr', 'title', 'Native end');
    cy.contains('button', 'Focus end').click();
    cy.get('input[aria-label="End"]').should('be.focused');
    cy.contains('button', 'Blur inputs').click();
    cy.get('input[aria-label="End"]').should('not.be.focused');
  });
  it('preserves inline panel attributes and endpoint cell render context', () => {
    cy.visit('/date-picker-range-root.html?inline&panel');
    cy.get('input').should('not.exist');
    cy.get('[data-testid="custom-panel"] #range-root').should(
      'have.class',
      'sd-picker-range-container-panel-only',
    );
    cy.get('#range-root [data-endpoint="start"]').should('exist');
    cy.get('#range-root [data-endpoint="end"]').should('exist');
  });
  it('updates custom trigger context after a panel commit', () => {
    cy.visit('/date-picker-range-root.html?custom');
    cy.get('[data-testid="custom"]').click().should('contain.text', '|true');
    cy.get('[role="gridcell"][aria-label="2026-11-20"]').filter(':visible').first().click();
    cy.get('[data-testid="custom"]').should('have.text', '2026-11-20,2026-12-18|false');
  });
  it('localizes range placeholders and footer actions', () => {
    cy.visit('/date-picker-range-root.html?locale&confirm');
    cy.get('input[aria-label="Start"]').should('have.attr', 'placeholder', 'From custom');
    cy.get('input[aria-label="End"]').should('have.attr', 'placeholder', 'To custom').click();
    cy.get('.sd-picker-btn-confirm').should('have.text', 'Confirm range');
  });
  it('commits an end clock selection from the shared time view', () => {
    cy.visit('/date-picker-range-root.html?time');
    cy.get('input[aria-label="End"]').click();
    cy.get('.sd-panel-date-view-tabs').last().children().last().click();
    cy.get('.sd-timepicker-column').eq(3).contains('li', /^19$/).click();
    cy.get('.sd-picker-btn-confirm').click();
    cy.get('input[aria-label="End"]').should('have.value', '2026-12-18 19:45:00');
  });
  it('disables confirmation when an inline range becomes readonly', () => {
    cy.visit('/date-picker-range-root.html?inline&confirm');
    cy.contains('button', 'Readonly').click();
    cy.get('.sd-picker-btn-confirm').should('be.disabled');
    cy.get('[role="gridcell"][aria-label="2026-11-20"]').filter(':visible').first().click();
    cy.get('[data-testid="events"]').should('have.text', '');
  });
});
