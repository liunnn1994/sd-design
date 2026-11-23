describe('React DatePicker composite panel', () => {
  for (const mode of ['date', 'week', 'month', 'quarter', 'year']) {
    it(`renders and selects the ${mode} panel`, () => {
      cy.visit(`/date-picker-composite.html?mode=${mode}`);
      cy.get(`.sd-panel-${mode}`).should('be.visible');
      cy.get('.sd-picker-body [role="gridcell"]').filter(':visible').first().click();
      cy.get('[data-testid="events"]').should('contain.text', 'date:');
      cy.get('.sd-picker-footer-extra-wrapper').should('have.text', 'Extra content');
    });
  }
  for (const position of ['left', 'bottom', 'right']) {
    it(`places shortcuts at ${position} and keeps factories deferred`, () => {
      cy.visit(`/date-picker-composite.html?shortcuts&position=${position}`);
      cy.get('[data-testid="calls"]').should('have.text', '0');
      const parent =
        position === 'bottom'
          ? '.sd-picker-footer-btn-wrapper'
          : `.sd-picker-container-shortcuts-placement-${position}`;
      cy.get(`${parent} .sd-picker-shortcuts button`).should('have.text', 'Deferred date').click();
      cy.get('[data-testid="events"]').should('contain.text', 'shortcut:2026-12-25');
      cy.get('[data-testid="calls"]').invoke('text').then(Number).should('be.greaterThan', 0);
    });
  }
  it('navigates local year headers and resynchronizes external headers before drilling to months', () => {
    cy.visit('/date-picker-composite.html?confirm');
    cy.get('.sd-picker-header-label').first().click();
    cy.get('.sd-panel-year').should('be.visible');
    cy.get('.sd-picker-footer').should('not.exist');
    cy.get('.sd-picker-header-icon').last().click();
    cy.get('.sd-picker-header-title').should('contain.text', '2030');
    cy.contains('button', 'External header').click();
    cy.get('.sd-picker-header-title').should('contain.text', '2040');
    cy.get('.sd-panel-year [role="gridcell"]')
      .contains(/^2044$/)
      .click();
    cy.get('.sd-panel-month').should('be.visible');
    cy.get('.sd-panel-month [role="gridcell"]').first().click();
    cy.get('.sd-panel-date').should('be.visible');
    cy.get('.sd-picker-footer').should('be.visible');
  });
  it('moves Now into shortcuts for confirmation and respects disabled confirmation', () => {
    cy.visit('/date-picker-composite.html');
    cy.get('.sd-picker-footer-now-wrapper').click();
    cy.get('[data-testid="events"]').should('contain.text', 'now:2026-11-08 09:30:00');
    cy.contains('button', 'Confirm mode').click();
    cy.get('.sd-picker-footer-now-wrapper').should('not.exist');
    cy.get('.sd-picker-shortcuts button').should('be.visible');
    cy.contains('button', 'Lock confirmation').click();
    cy.get('.sd-picker-btn-confirm').should('be.disabled');
    cy.contains('button', 'Lock confirmation').click();
    cy.get('.sd-picker-btn-confirm').click();
    cy.get('[data-testid="events"]').should('contain.text', 'confirm');
  });
  it('converts shortcut hover values at event time', () => {
    cy.visit('/date-picker-composite.html?shortcuts');
    cy.get('.sd-picker-shortcuts button').trigger('mouseover');
    cy.get('[data-testid="events"]').should('contain.text', 'enter:2026-12-25');
    cy.get('.sd-picker-shortcuts button').trigger('mouseout');
    cy.get('[data-testid="events"]').should('contain.text', 'leave:2026-12-25');
  });
  it('keeps controlled header navigation pending until writeback and reads external replacements', () => {
    cy.visit('/date-picker-composite.html?header&controlled');
    cy.contains('button', 'Next month').click();
    cy.get('[data-testid="header"]').should('have.text', '2026-11-08');
    cy.get('[data-testid="events"]').should('have.text', '2026-12-08');
    cy.contains('button', 'Accept').click();
    cy.contains('button', 'Next month').click();
    cy.get('[data-testid="header"]').should('have.text', '2026-12-08');
    cy.contains('button', 'External header').click();
    cy.get('[data-testid="header"]').should('have.text', '2028-02-02');
  });
  it('updates uncontrolled headers and silently restores their default', () => {
    cy.visit('/date-picker-composite.html?header');
    cy.contains('button', 'Next month').click();
    cy.get('[data-testid="header"]').should('have.text', '2026-12-08');
    cy.contains('button', 'Silent reset').click();
    cy.get('[data-testid="header"]').should('have.text', '2026-11-08');
    cy.get('[data-testid="events"]').should('have.text', '2026-12-08');
  });
});

describe('React DatePicker range composite panel', () => {
  for (const mode of ['date', 'week', 'month', 'quarter', 'year']) {
    it(`renders both ${mode} panels with endpoint render context and selection`, () => {
      cy.visit(`/date-picker-range-panel.html?mode=${mode}`);
      cy.get(`.sd-panel-${mode}`).should('have.length', 2);
      cy.get('[data-endpoint="start"]').should('exist');
      cy.get('[data-endpoint="end"]').should('exist');
      cy.get(`.sd-panel-${mode}`)
        .last()
        .find('[role="gridcell"]')
        .filter(':visible')
        .not('[aria-disabled="true"]')
        .first()
        .click();
      cy.get('[data-testid="events"]').should('contain.text', 'cell:');
    });
  }
  it('shares date/time view across endpoints and resets both on reopen', () => {
    cy.visit('/date-picker-range-panel.html?time');
    cy.get('.sd-panel-date-view-tabs').first().children().last().click();
    cy.get('.sd-timepicker-column').should('have.length', 6);
    cy.get('.sd-panel-date-inner').should('not.exist');
    cy.contains('button', 'Toggle visibility').click();
    cy.get('[data-testid="visible"]').should('have.text', 'false');
    cy.contains('button', 'Toggle visibility').click();
    cy.get('.sd-timepicker-column').should('not.exist');
    cy.get('.sd-panel-date-inner').should('have.length', 2);
  });
  it('preserves endpoint-specific disabled times and publishes the selected endpoint', () => {
    cy.visit('/date-picker-range-panel.html?time');
    cy.get('.sd-panel-date-view-tabs').first().children().last().click();
    cy.get('.sd-timepicker-column')
      .eq(0)
      .contains('li', /^10$/)
      .should('have.attr', 'aria-disabled', 'true');
    cy.get('.sd-timepicker-column')
      .eq(3)
      .contains('li', /^11$/)
      .should('have.attr', 'aria-disabled', 'true');
    cy.get('.sd-timepicker-column').eq(3).contains('li', /^18$/).click();
    cy.get('[data-testid="events"]').should('have.text', 'end:18:45:00');
    cy.contains('button', 'Lock').click();
    cy.get('.sd-timepicker-column').eq(0).contains('li', /^12$/).click();
    cy.get('[data-testid="events"]').should('have.text', 'end:18:45:00');
  });
  for (const mode of ['year', 'month']) {
    it(`keeps the footer while drilling into a ${mode} header`, () => {
      cy.visit('/date-picker-range-panel.html');
      cy.contains('button', mode === 'year' ? 'Year header' : 'Month header').click();
      cy.get(`.sd-panel-${mode}`).should('have.length', 1);
      cy.get('.sd-panel-date').should('not.exist');
      cy.get('.sd-picker-footer-extra-wrapper').should('have.text', 'Range footer');
      cy.get(`.sd-panel-${mode} [role="gridcell"]`).first().click();
      cy.get('[data-testid="events"]').should('contain.text', 'header:');
    });
  }
  for (const position of ['left', 'bottom', 'right']) {
    it(`places lazy range shortcuts at ${position}`, () => {
      cy.visit(`/date-picker-range-panel.html?shortcuts&position=${position}`);
      cy.get('[data-testid="calls"]').should('have.text', '0');
      const parent =
        position === 'bottom'
          ? '.sd-picker-footer-btn-wrapper'
          : `.sd-picker-range-container-shortcuts-placement-${position}`;
      cy.get(`${parent} .sd-picker-shortcuts button`).click();
      cy.get('[data-testid="events"]').should('contain.text', 'shortcut:2026-12-24,2026-12-25');
    });
  }
  it('refuses disabled confirmation and preserves enabled footer actions', () => {
    cy.visit('/date-picker-range-panel.html');
    cy.contains('button', 'Lock').click();
    cy.get('.sd-picker-btn-confirm').should('be.disabled');
    cy.contains('button', 'Lock').click();
    cy.get('.sd-picker-btn-confirm').click();
    cy.get('[data-testid="events"]').should('have.text', 'confirm');
  });
});

describe('React DatePicker range header adapter', () => {
  for (const [mode, end] of [
    ['date', '2026-12-08'],
    ['week', '2026-12-08'],
    ['month', '2027-11-08'],
    ['quarter', '2027-11-08'],
    ['year', '2036-11-08'],
  ]) {
    it(`initializes distinct ${mode} panels using the shared span`, () => {
      cy.visit(`/date-picker-range-header.html?mode=${mode}`);
      cy.get('[data-testid="headers"]').should('have.text', `2026-11-08,${end}`);
      cy.get('[data-testid="events"]').should('have.text', '');
    });
  }
  it('sorts selected dates before initializing range headers', () => {
    cy.visit('/date-picker-range-header.html?selected');
    cy.get('[data-testid="headers"]').should('have.text', '2026-01-01,2027-03-01');
  });
  it('prevents adjacent panels from crossing and restores inward navigation after widening', () => {
    cy.visit('/date-picker-range-header.html');
    cy.contains('button', 'Start next').should('be.disabled');
    cy.contains('button', 'End previous').should('be.disabled');
    cy.contains('button', 'End next').click();
    cy.get('[data-testid="headers"]').should('have.text', '2026-11-08,2027-01-08');
    cy.contains('button', 'Start next').should('not.be.disabled').click();
    cy.get('[data-testid="headers"]').should('have.text', '2026-12-08,2027-01-08');
    cy.contains('button', 'Start next').should('be.disabled');
  });
  it('preserves rejected controlled navigation then accepts writeback and external values', () => {
    cy.visit('/date-picker-range-header.html?controlled');
    cy.contains('button', 'End next').click();
    cy.get('[data-testid="headers"]').should('have.text', '2026-11-08,2026-12-08');
    cy.get('[data-testid="events"]').should('have.text', '2026-11-08,2027-01-08');
    cy.contains('button', 'Accept').click();
    cy.contains('button', 'End next').click();
    cy.get('[data-testid="headers"]').should('have.text', '2026-11-08,2027-01-08');
    cy.contains('button', 'External headers').click();
    cy.get('[data-testid="headers"]').should('have.text', '2028-02-01,2028-06-01');
  });
  it('reads the latest selection after a batched reset request', () => {
    cy.visit('/date-picker-range-header.html');
    cy.contains('button', 'Replace selection and reset').click();
    cy.get('[data-testid="headers"]').should('have.text', '2030-08-01,2030-09-01');
    cy.get('[data-testid="events"]').should('have.text', '2030-08-01,2030-09-01');
  });
  it('cancels a pending reset when its owner unmounts', () => {
    cy.visit('/date-picker-range-header.html?selected');
    cy.contains('button', 'Reset and unmount').click();
    cy.get('[data-testid="headers"]').should('not.exist');
    cy.get('[data-testid="events"]').should('have.text', '');
  });
  it('publishes a single combined change and suppresses equivalent updates', () => {
    cy.visit('/date-picker-range-header.html');
    cy.contains('button', 'Set both').click();
    cy.get('[data-testid="headers"]').should('have.text', '2028-02-01,2028-04-01');
    cy.contains('button', 'Set both').click();
    cy.get('[data-testid="events"]').should('have.text', '2028-02-01,2028-04-01');
  });
});

describe('React DatePicker time value adapters', () => {
  it('initializes independent endpoint defaults', () => {
    cy.visit('/date-picker-time-state.html');
    cy.get('[data-testid="single"]').should('have.text', '09:15:30');
    cy.get('[data-testid="range"]').should('have.text', '09:15:30,17:45:20');
  });
  it('follows selected values and keeps clocks on selection removal until reset', () => {
    cy.visit('/date-picker-time-state.html');
    cy.contains('button', 'Select').click();
    cy.get('[data-testid="single"]').should('have.text', '12:00:00');
    cy.get('[data-testid="range"]').should('have.text', '12:00:00,19:00:00');
    cy.contains('button', 'Reset').click();
    cy.get('[data-testid="range"]').should('have.text', '12:00:00,19:00:00');
    cy.contains('button', 'Clear selection').click();
    cy.get('[data-testid="range"]').should('have.text', '12:00:00,19:00:00');
    cy.contains('button', 'Reset').click();
    cy.get('[data-testid="single"]').should('have.text', '09:15:30');
    cy.get('[data-testid="range"]').should('have.text', '09:15:30,17:45:20');
  });
  it('uses updated defaults only when resetting pending clocks', () => {
    cy.visit('/date-picker-time-state.html');
    cy.contains('button', 'New defaults').click();
    cy.get('[data-testid="range"]').should('have.text', '09:15:30,17:45:20');
    cy.contains('button', 'Reset').click();
    cy.get('[data-testid="single"]').should('have.text', '08:00:00');
    cy.get('[data-testid="range"]').should('have.text', '08:00:00,20:00:00');
  });
  it('preserves omitted endpoints and ignores undefined assignments', () => {
    cy.visit('/date-picker-time-state.html');
    cy.contains('button', 'Partial update').click();
    cy.get('[data-testid="single"]').should('have.text', '15:00:00');
    cy.get('[data-testid="range"]').should('have.text', '09:15:30,21:00:00');
    cy.contains('button', 'Undefined update').click();
    cy.get('[data-testid="single"]').should('have.text', '15:00:00');
    cy.get('[data-testid="range"]').should('have.text', '09:15:30,21:00:00');
  });
  it('parses twelve-hour defaults using the shared time format', () => {
    cy.visit('/date-picker-time-state.html?twelve');
    cy.get('[data-testid="single"]').should('have.text', '13:15:30');
    cy.get('[data-testid="range"]').should('have.text', '13:15:30,17:45:20');
  });
  it('falls back from a format without time columns', () => {
    cy.visit('/date-picker-time-state.html?invalid');
    cy.get('[data-testid="range"]').should('have.text', '09:15:30,17:45:20');
  });
});

describe('React DatePicker single state adapter', () => {
  it('commits immediate selections with ordered value and Date payloads', () => {
    cy.visit('/date-picker-state.html');
    cy.contains('button', 'Select date').click();
    cy.get('[data-testid="value"]').should('have.text', '2026-12-20');
    cy.get('[data-testid="events"]').should(
      'have.text',
      'value:2026-12-20|change:2026-12-20:true:2026-12-20',
    );
  });
  it('keeps confirmation selections pending and publishes ok after change', () => {
    cy.visit('/date-picker-state.html?confirm');
    cy.contains('button', 'Select date').click();
    cy.get('[data-testid="value"]').should('have.text', '2026-11-08');
    cy.get('[data-testid="panel"]').should('have.text', '2026-12-20');
    cy.get('[data-testid="events"]').should('have.text', 'select:2026-12-20');
    cy.contains('button', 'Confirm').click();
    cy.get('[data-testid="value"]').should('have.text', '2026-12-20');
    cy.get('[data-testid="events"]').should(
      'contain.text',
      'value:2026-12-20|change:2026-12-20:true:2026-12-20|ok:2026-12-20',
    );
  });
  it('restores rejected controlled commits and accepts external replacement and release', () => {
    cy.visit('/date-picker-state.html?controlled');
    cy.contains('button', 'Select date').click();
    cy.get('[data-testid="value"]').should('have.text', '2026-11-08');
    cy.contains('button', 'Accept').click();
    cy.contains('button', 'Select date').click();
    cy.get('[data-testid="value"]').should('have.text', '2026-12-20');
    cy.contains('button', 'External value').click();
    cy.get('[data-testid="panel"]').should('have.text', '2028-02-02');
    cy.contains('button', 'Release value').click();
    cy.get('[data-testid="value"]').should('have.text', '');
  });
  it('keeps controlled popup requests pending until accepted', () => {
    cy.visit('/date-picker-state.html?popup');
    cy.contains('button', 'Open').click();
    cy.get('[data-testid="popup"]').should('have.text', 'false');
    cy.get('[data-testid="events"]').should('contain.text', 'popup:true');
    cy.contains('button', 'Accept').click();
    cy.contains('button', 'Open').click();
    cy.get('[data-testid="popup"]').should('have.text', 'true');
  });
  it('clears invalid drafts and pending values when closing', () => {
    cy.visit('/date-picker-state.html?confirm');
    cy.contains('button', 'Open').click();
    cy.contains('button', 'Select date').click();
    cy.get('input').type('invalid');
    cy.contains('button', 'Close').click();
    cy.get('input').should('have.value', '');
    cy.get('[data-testid="panel"]').should('have.text', '2026-11-08');
  });
  it('commits a valid typed draft with Enter', () => {
    cy.visit('/date-picker-state.html?confirm');
    cy.get('input').type('2026-12-20{enter}');
    cy.get('[data-testid="value"]').should('have.text', '2026-12-20');
    cy.get('[data-testid="popup"]').should('have.text', 'false');
  });
  it('blocks disabled dates and refuses pending confirmation after readonly changes', () => {
    cy.visit('/date-picker-state.html?confirm');
    cy.contains('button', 'Select date').click();
    cy.contains('button', 'Readonly').click();
    cy.contains('button', 'Confirm').click();
    cy.get('[data-testid="value"]').should('have.text', '2026-11-08');
    cy.contains('button', 'Readonly').click();
    cy.contains('button', 'Disabled date').click();
    cy.get('[data-testid="confirm-disabled"]').should('have.text', 'true');
    cy.contains('button', 'Confirm').click();
    cy.get('[data-testid="value"]').should('have.text', '2026-11-08');
  });
  it('previews shortcuts without committing and clears the preview after its delay', () => {
    cy.clock();
    cy.visit('/date-picker-state.html');
    cy.contains('button', 'Preview').click();
    cy.get('[data-testid="panel"]').should('have.text', '2026-12-25');
    cy.get('[data-testid="value"]').should('have.text', '2026-11-08');
    cy.contains('button', 'Leave preview').click();
    cy.tick(99);
    cy.get('[data-testid="panel"]').should('have.text', '2026-12-25');
    cy.tick(1);
    cy.get('[data-testid="panel"]').should('have.text', '2026-11-08');
  });
  it('publishes shortcut before committing and clear after model change', () => {
    cy.visit('/date-picker-state.html');
    cy.contains('button', 'Shortcut').click();
    cy.get('[data-testid="events"]').should(
      'contain.text',
      'shortcut:Holiday|value:2026-12-25|change:2026-12-25:true:2026-12-25',
    );
    cy.contains('button', 'Clear').click();
    cy.get('[data-testid="value"]').should('have.text', '');
    cy.get('[data-testid="events"]').should(
      'contain.text',
      'value:undefined|change:undefined:false:undefined|clear',
    );
  });
  it('merges selected time with the panel date before confirmation', () => {
    cy.visit('/date-picker-state.html?time');
    cy.contains('button', 'Select date').click();
    cy.contains('button', 'Select time').click();
    cy.get('[data-testid="panel"]').should('have.text', '2026-12-20 18:45:20');
    cy.contains('button', 'Confirm').click();
    cy.get('[data-testid="value"]').should('have.text', '2026-12-20 18:45:20');
  });
  it('drills year then month without committing the selected date', () => {
    cy.visit('/date-picker-state.html');
    cy.contains('button', 'Year header').click();
    cy.contains('button', 'Select header').click();
    cy.get('[data-testid="header-mode"]').should('have.text', 'month');
    cy.contains('button', 'Select header').click();
    cy.get('[data-testid="header-mode"]').should('have.text', '');
    cy.get('[data-testid="header"]').should('have.text', '2030-03-08');
    cy.get('[data-testid="value"]').should('have.text', '2026-11-08');
  });
});

describe('React DatePicker range state adapter', () => {
  it('sorts a replacement endpoint and commits a complete range', () => {
    cy.visit('/date-picker-range-state.html');
    cy.contains('button', 'Select 20').click();
    cy.get('[data-testid="value"]').should('have.text', '2026-11-18,2026-11-20');
    cy.get('[data-testid="events"]').should(
      'contain.text',
      'value:2026-11-18,2026-11-20|change:2026-11-18,2026-11-20',
    );
  });
  it('keeps complete ranges pending until confirmation', () => {
    cy.visit('/date-picker-range-state.html?confirm');
    cy.contains('button', 'Select 20').click();
    cy.get('[data-testid="value"]').should('have.text', '2026-11-08,2026-11-18');
    cy.get('[data-testid="panel"]').should('have.text', '2026-11-18,2026-11-20');
    cy.contains('button', 'Confirm').click();
    cy.get('[data-testid="events"]').should(
      'contain.text',
      'change:2026-11-18,2026-11-20|ok:2026-11-18,2026-11-20',
    );
  });
  it('preserves rejected controlled values and accepts writeback and replacement', () => {
    cy.visit('/date-picker-range-state.html?controlled');
    cy.contains('button', 'Select 20').click();
    cy.get('[data-testid="value"]').should('have.text', '2026-11-08,2026-11-18');
    cy.contains('button', 'Accept').click();
    cy.contains('button', 'Select 20').click();
    cy.get('[data-testid="value"]').should('have.text', '2026-11-18,2026-11-20');
    cy.contains('button', 'External value').click();
    cy.get('[data-testid="panel"]').should('have.text', '2028-02-02,2028-03-03');
  });
  it('switches the active endpoint for an incomplete range and commits after its second date', () => {
    cy.visit('/date-picker-range-state.html?empty');
    cy.contains('button', 'Select 20').click();
    cy.get('[data-testid="index"]').should('have.text', '1');
    cy.get('[data-testid="value"]').should('have.text', '');
    cy.contains('button', 'Select 25').click();
    cy.get('[data-testid="value"]').should('have.text', '2026-11-20,2026-11-25');
  });
  it('focuses the enabled endpoint and protects the locked endpoint against clearing', () => {
    cy.visit('/date-picker-range-state.html?locked');
    cy.contains('button', 'Open').click();
    cy.get('input[aria-label="Draft 1"]').should('be.focused');
    cy.contains('button', 'Select 20').click();
    cy.get('[data-testid="value"]').should('have.text', '2026-11-08,2026-11-20');
    cy.contains('button', 'Clear').click();
    cy.get('[data-testid="value"]').should('have.text', '2026-11-08,2026-11-20');
  });
  it('rejects readonly confirmation and restores pending values when closing', () => {
    cy.visit('/date-picker-range-state.html?confirm');
    cy.contains('button', 'Open').click();
    cy.contains('button', 'Select 20').click();
    cy.contains('button', 'Readonly').click();
    cy.contains('button', 'Confirm').click();
    cy.get('[data-testid="value"]').should('have.text', '2026-11-08,2026-11-18');
    cy.contains('button', 'Close').click();
    cy.get('[data-testid="panel"]').should('have.text', '2026-11-08,2026-11-18');
  });
  for (const [flags, clocks] of [
    ['', ['18:00:00', '09:00:00']],
    ['&noexchange', ['09:00:00', '18:00:00']],
    ['&noexchange&fixed', ['18:00:00', '09:00:00']],
  ]) {
    it(`applies shared time ordering with flags=${flags}`, () => {
      cy.visit(`/date-picker-range-state.html?time${flags}`);
      cy.contains('button', 'Reverse shortcut').click();
      cy.get('[data-testid="value"]').should(
        'have.text',
        `2026-11-01 ${clocks[0]},2026-11-20 ${clocks[1]}`,
      );
    });
  }
  it('commits a typed endpoint and sorts the range on Enter', () => {
    cy.visit('/date-picker-range-state.html');
    cy.get('input[aria-label="Draft 0"]').click().type('2026-11-25{enter}');
    cy.get('[data-testid="value"]').should('have.text', '2026-11-18,2026-11-25');
    cy.get('[data-testid="popup"]').should('have.text', 'false');
  });
  it('previews a shortcut without changing the committed range and clears after leaving', () => {
    cy.clock();
    cy.visit('/date-picker-range-state.html');
    cy.contains('button', 'Preview').click();
    cy.get('[data-testid="panel"]').should('have.text', '2027-01-01,2027-02-01');
    cy.get('[data-testid="value"]').should('have.text', '2026-11-08,2026-11-18');
    cy.contains('button', 'Leave preview').click();
    cy.tick(100);
    cy.get('[data-testid="panel"]').should('have.text', '2026-11-08,2026-11-18');
  });
  it('starts a fresh incomplete range when clearRangeOnReselect is enabled', () => {
    cy.visit('/date-picker-range-state.html?reselect');
    cy.contains('button', 'Select 20').click();
    cy.get('[data-testid="panel"]').should('have.text', '2026-11-20');
    cy.get('[data-testid="value"]').should('have.text', '2026-11-08,2026-11-18');
    cy.contains('button', 'Select 25').click();
    cy.get('[data-testid="value"]').should('have.text', '2026-11-20,2026-11-25');
  });
});

describe('React DatePicker provider defaults', () => {
  for (const range of [false, true]) {
    const query = range ? 'range&' : '';
    it(`updates inherited weekday and shortcuts for ${range ? 'ranges' : 'dates'}`, () => {
      cy.visit(`/date-picker-provider.html?${query}`);
      cy.get('.sd-picker-week-list-item').first().should('have.text', '一');
      cy.contains('.sd-picker-shortcuts button', 'Configured').should('be.visible');
      cy.get(`.sd-picker-${range ? 'range-' : ''}container`).should(
        'have.class',
        `sd-picker-${range ? 'range-' : ''}container-shortcuts-placement-left`,
      );
      cy.get('.sd-picker-btn-confirm').should('exist');
      cy.contains('button', 'Update provider').click();
      cy.get('.sd-picker-week-list-item').first().should('have.text', '二');
      cy.contains('.sd-picker-shortcuts button', 'Configured').should('not.exist');
    });
    it(`preserves explicit local defaults for ${range ? 'ranges' : 'dates'}`, () => {
      cy.visit(`/date-picker-provider.html?${query}local`);
      cy.get('.sd-picker-week-list-item').first().should('have.text', '日');
      cy.contains('.sd-picker-shortcuts button', 'Configured').should('not.exist');
      cy.get('.sd-picker-btn-confirm').should('not.exist');
      cy.contains('button', 'Update provider').click();
      cy.get('.sd-picker-week-list-item').first().should('have.text', '日');
    });
    it(`disables configured shortcut preview for ${range ? 'ranges' : 'dates'}`, () => {
      cy.visit(`/date-picker-provider.html?${query}preview`);
      cy.get('.sd-picker input').first().click();
      cy.contains('.sd-picker-shortcuts button', 'Configured').trigger('mouseover');
      cy.get('.sd-picker input').first().should('have.value', '2026-11-08');
    });
  }
  it('updates configured Now visibility and respects a local true value', () => {
    cy.visit('/date-picker-provider.html');
    cy.get('.sd-picker-shortcuts button').should('have.length', 1);
    cy.contains('button', 'Update provider').click();
    cy.get('.sd-picker-shortcuts button').should('have.length', 1);
    cy.visit('/date-picker-provider.html?local');
    cy.get('.sd-picker-footer-now-wrapper').should('be.visible');
  });
  it('inherits full month names and accepts a local abbreviation override', () => {
    cy.visit('/date-picker-provider.html?month');
    cy.get('.sd-panel-month .sd-picker-date-value').first().should('have.text', 'January');
    cy.visit('/date-picker-provider.html?month&local');
    cy.get('.sd-panel-month .sd-picker-date-value').first().should('have.text', 'Jan');
  });
});

describe('React DatePicker public package', () => {
  for (const mode of ['date', 'week', 'month', 'quarter', 'year']) {
    it(`exports the ${mode} picker with its matching panel and imperative ref`, () => {
      cy.visit(`/date-picker-public.html?mode=${mode}`);
      cy.get('[data-testid="compound"]').should('have.text', 'true');
      cy.contains('button', 'Focus').click();
      cy.get('.sd-picker input').should('be.focused').click();
      cy.get(`.sd-panel-${mode}`).should('be.visible');
      if (mode === 'week') cy.get('.sd-picker-week-list-item').eq(1).should('have.text', '一');
      cy.get('.sd-picker-body [role="gridcell"]')
        .filter(':visible')
        .not('[aria-disabled="true"]')
        .first()
        .click();
      cy.get('[data-testid="public-value"]').should('not.have.text', '');
    });
  }
  for (const query of ['', '&noexchange', '&localoff']) {
    it(`honors global and local time exchange rules ${query || 'enabled'}`, () => {
      cy.visit(`/date-picker-public.html?range${query}`);
      cy.get('.sd-picker input').first().click().type('{selectall}2027-01-20 09:30:00{enter}');
      cy.get('.sd-picker input')
        .first()
        .should('have.value', query ? '2026-12-18 09:30:00' : '2026-12-18 17:45:00');
      cy.get('.sd-picker input')
        .last()
        .should('have.value', query ? '2027-01-20 17:45:00' : '2027-01-20 09:30:00');
    });
  }
});
