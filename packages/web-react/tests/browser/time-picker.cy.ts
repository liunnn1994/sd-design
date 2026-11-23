describe('React TimePicker panel adapters', () => {
  it('keeps selections pending until confirmation and synchronizes external values', () => {
    cy.visit('/time-picker-panel.html');
    cy.get('.sd-timepicker-column').first().contains('li', /^11$/).click();
    cy.get('[data-testid="selected"]').should('have.text', '11:15:30');
    cy.get('[data-testid="confirmed"]').should('have.text', '');
    cy.get('.sd-timepicker-footer-btn-wrapper button').last().click();
    cy.get('[data-testid="confirmed"]').should('have.text', '11:15:30');
    cy.contains('button', 'External value').click();
    cy.get('.sd-timepicker-column')
      .first()
      .find('[aria-selected="true"]')
      .should('have.text', '18');
    cy.get('.sd-timepicker-footer-extra-wrapper').should('have.text', 'Extra footer');
  });
  it('locks all choices and footer actions when disabled', () => {
    cy.visit('/time-picker-panel.html');
    cy.contains('button', 'Disabled').click();
    cy.get('.sd-timepicker-column li').should('have.attr', 'aria-disabled', 'true');
    cy.get('.sd-timepicker-column').first().contains('li', /^11$/).click();
    cy.get('[data-testid="selected"]').should('have.text', '');
    cy.get('.sd-timepicker-footer-btn-wrapper button').should('be.disabled');
  });
  it('maps twelve hour selections through AM and PM and hides disabled options', () => {
    cy.visit('/time-picker-panel.html?12');
    cy.get('.sd-timepicker-column').last().contains('li', 'PM').click();
    cy.get('[data-testid="selected"]').should('have.text', '21:15:30');
    cy.get('.sd-timepicker-column').first().contains('li', /^12$/).click();
    cy.get('[data-testid="selected"]').should('have.text', '12:15:30');
    cy.get('.sd-timepicker-column').last().contains('li', 'AM').click();
    cy.contains('button', 'Hide disabled').click();
    cy.get('.sd-timepicker-column').first().find('li').should('have.length', 11);
  });
  for (const step of ['0', '-1', 'NaN', 'Infinity', '0.5', '1.5']) {
    it(`normalizes invalid step ${step}`, () => {
      cy.visit(`/time-picker-panel.html?step=${step}`);
      cy.get('.sd-timepicker-column').eq(0).find('li').should('have.length', 24);
      cy.get('.sd-timepicker-column').eq(1).find('li').should('have.length', 60);
      cy.get('.sd-timepicker-column').eq(2).find('li').should('have.length', 60);
    });
  }
  it('moves confirmation to the missing range endpoint before committing', () => {
    cy.visit('/time-picker-panel.html?range');
    cy.get('.sd-timepicker-footer-btn-wrapper button').click();
    cy.get('[data-testid="index"]').should('have.text', '1');
    cy.get('[data-testid="confirmed"]').should('have.text', '');
    cy.get('.sd-timepicker-column').first().contains('li', /^14$/).click();
    cy.get('.sd-timepicker-footer-btn-wrapper button').click();
    cy.get('[data-testid="confirmed"]').should('have.text', '09:15:30|14:00:00');
  });
  it('does not scroll to a removed option', () => {
    cy.visit('/time-picker-panel.html?column');
    cy.get('.sd-timepicker-column').should(($column) =>
      expect($column[0].scrollTop).to.be.greaterThan(0),
    );
    cy.contains('button', 'Remove option').click();
    cy.contains('button', 'Select 29').click();
    cy.get('.sd-timepicker-column').should(($column) =>
      expect($column[0].scrollTop).to.equal(29 * 32),
    );
    cy.contains('button', 'Select 30').click();
    cy.wait(200);
    cy.get('.sd-timepicker-column').should(($column) =>
      expect($column[0].scrollTop).to.equal(29 * 32),
    );
  });
});

describe('React shared picker input adapter', () => {
  it('renders formatted values and forwards native input attributes', () => {
    cy.visit('/picker-input.html');
    cy.get('input').should('have.value', '09:15:30').and('have.attr', 'title', 'Native title');
    cy.get('input').clear().type('draft').should('have.value', 'draft');
    cy.get('.sd-picker-prefix').should('have.text', 'Time');
    cy.get('.sd-picker-suffix-icon').should('have.text', 'Clock');
  });
  it('supports keyboard clearing and imperative focus and blur', () => {
    cy.visit('/picker-input.html');
    cy.contains('button', 'Focus input').click();
    cy.get('input').should('be.focused');
    cy.get('.sd-picker').then(($picker) => {
      const rect = $picker[0].getBoundingClientRect();
      return Cypress.automation('remote:debugger:protocol', {
        command: 'Runtime.evaluate',
        params: {
          expression: `(() => { const frame = document.querySelector('iframe.aut-iframe'); const rect = frame.getBoundingClientRect(); return { left: rect.left, top: rect.top, scale: rect.width / frame.clientWidth }; })()`,
          returnByValue: true,
        },
      }).then(({ result: { value: frame } }) =>
        Cypress.automation('remote:debugger:protocol', {
          command: 'Input.dispatchMouseEvent',
          params: {
            type: 'mouseMoved',
            x: frame.left + (rect.left + rect.width / 2) * frame.scale,
            y: frame.top + (rect.top + rect.height / 2) * frame.scale,
          },
        }),
      );
    });
    cy.get('.sd-picker-clear-icon').focus().trigger('keydown', { key: 'Enter' });
    cy.get('[data-testid="clears"]').should('have.text', '1');
    cy.contains('button', 'Blur input').click();
    cy.get('input').should('not.be.focused');
    cy.contains('button', 'Mount input').click();
    cy.get('.sd-picker').should('not.exist');
    cy.contains('button', 'Focus input').click();
  });
  it('shows readonly feedback for modification keys and disables the native input', () => {
    cy.visit('/picker-input.html');
    cy.contains('button', 'Readonly').click();
    cy.get('input').should('have.attr', 'readonly');
    cy.get('input').focus().trigger('keydown', { key: 'Backspace' });
    cy.get('.sd-tooltip-content').should('contain.text', 'Locked picker');
    cy.get('.sd-picker-clear-icon').should('not.exist');
    cy.contains('button', 'Disabled').click();
    cy.get('input').should('be.disabled');
  });
  it('measures fit width after draft changes', () => {
    cy.visit('/picker-input.html');
    cy.contains('button', 'Fit width').click();
    cy.get('.sd-picker-input').then(($input) => {
      const before = $input[0].getBoundingClientRect().width;
      cy.get('input').clear().type('longer time input value');
      cy.get('.sd-picker-input').should(($next) =>
        expect($next[0].getBoundingClientRect().width).to.be.greaterThan(before),
      );
    });
  });
  it('tracks range focus and isolates disabled endpoints', () => {
    cy.visit('/picker-input.html?range');
    cy.get('input').eq(0).should('have.value', '09:15:30');
    cy.get('input').eq(1).should('have.value', '11:15:30').click().clear().type('13:00:00');
    cy.get('[data-testid="index"]').should('have.text', '1');
    cy.get('.sd-picker-input-active input').should('have.value', '13:00:00');
    cy.contains('button', 'Disabled').click();
    cy.get('input').eq(0).should('not.be.disabled');
    cy.get('input').eq(1).should('be.disabled');
    cy.contains('button', 'Focus input').click();
    cy.get('input').eq(1).should('not.be.focused');
  });
});

describe('React TimePicker root', () => {
  it('commits a typed value with Enter and closes the popup', () => {
    cy.visit('/time-picker-root.html?open');
    cy.get('.sd-timepicker-container').should('be.visible');
    cy.get('.sd-picker input').clear().type('12:30:00{enter}');
    cy.get('.sd-picker input').should('have.value', '12:30:00');
    cy.get('[data-testid="events"]').should('contain.text', 'value:12:30:00|change:12:30:00');
    cy.get('.sd-timepicker-container').should('not.exist');
  });
  it('keeps panel choices pending until confirmation', () => {
    cy.visit('/time-picker-root.html?open');
    cy.get('.sd-timepicker-column').first().contains('li', /^11$/).click();
    cy.get('.sd-picker input').should('have.value', '11:00:00');
    cy.get('[data-testid="events"]')
      .should('contain.text', 'select:11:00:00')
      .and('not.contain.text', 'change:');
    cy.get('.sd-timepicker-footer-btn-wrapper button').last().click();
    cy.get('[data-testid="events"]').should('contain.text', 'value:11:00:00|change:11:00:00');
  });
  it('restores rejected controlled commits and accepts external replacements', () => {
    cy.visit('/time-picker-root.html?controlled&reject');
    cy.get('.sd-picker input').clear().type('12:30:00{enter}');
    cy.get('.sd-picker input').should('have.value', '09:00:00');
    cy.contains('button', 'Accept').click();
    cy.get('.sd-picker input').clear().type('12:30:00{enter}');
    cy.get('.sd-picker input').should('have.value', '12:30:00');
    cy.contains('button', 'External value').click();
    cy.get('.sd-picker input').should('have.value', '18:00:00');
  });
  it('keeps controlled popup requests closed until the parent accepts', () => {
    cy.visit('/time-picker-root.html?popup&reject&custom');
    cy.get('.sd-picker').should('not.exist');
    cy.get('[data-testid="custom"]').should('have.attr', 'aria-haspopup', 'dialog');
    cy.get('[data-testid="custom"]').click().should('contain.text', '|false');
    cy.get('[data-testid="custom"]').should('have.attr', 'aria-expanded', 'false');
    cy.get('[data-testid="custom"]').should('not.have.attr', 'aria-controls');
    cy.get('[data-testid="events"]').should('contain.text', 'popup:true');
    cy.contains('button', 'External popup').click();
    cy.get('[data-testid="custom"]').should('contain.text', '|true');
    cy.get('[data-testid="custom"]').should('have.attr', 'aria-expanded', 'true');
    cy.get('[data-testid="custom"]').should(([$trigger]) => {
      const popup = $trigger.ownerDocument.getElementById($trigger.getAttribute('aria-controls')!);
      expect(Boolean(popup?.querySelector('.sd-timepicker-container'))).to.equal(true);
    });
    cy.get('.sd-timepicker-container').should('be.visible');
  });
  for (const lock of ['Disabled', 'Readonly']) {
    it(`blocks direct selection when an open picker becomes ${lock.toLowerCase()}`, () => {
      cy.visit('/time-picker-root.html?popup&open&instant&reject');
      const hour = () => cy.get('.sd-timepicker-column').first().contains('li', /^11$/);
      hour().should('be.visible');
      cy.contains('button', lock).click();
      hour().click({ force: true });
      cy.get('.sd-picker input').should('have.value', '09:00:00');
      cy.get('[data-testid="events"]')
        .invoke('text')
        .should('not.match', /(?:^|\|)(?:select|value|change):/);
      cy.contains('button', lock).click();
      hour().click();
      cy.get('[data-testid="events"]').should(
        'contain.text',
        'select:11:00:00|value:11:00:00|change:11:00:00',
      );
    });

    it(`disables both localized footer actions when an open picker becomes ${lock.toLowerCase()}`, () => {
      cy.visit('/time-picker-root.html?popup&open');
      const footer = () => cy.get('.sd-timepicker-footer-btn-wrapper');
      footer().contains('button', '此刻').should('be.enabled');
      footer().contains('button', '确定').should('be.enabled');
      cy.contains('button', lock).click();
      footer()
        .find('button')
        .should('have.length', 2)
        .each(($button) => cy.wrap($button).should('be.disabled'));
      cy.get('[data-testid="events"]')
        .invoke('text')
        .should('not.match', /(?:^|\|)(?:select|value|change):/);
    });
  }
  it('locks an open panel and refuses pending confirmation after readonly changes', () => {
    cy.visit('/time-picker-root.html?open');
    cy.get('.sd-timepicker-column').first().contains('li', /^11$/).click();
    cy.contains('button', 'Readonly').click();
    cy.get('.sd-picker input').should('have.attr', 'readonly');
    cy.get('.sd-picker input').focus().trigger('keydown', { key: 'Enter' });
    cy.get('[data-testid="events"]').should('not.contain.text', 'change:');
    cy.get('.sd-timepicker-footer-btn-wrapper button').should('be.disabled');
  });
  it('commits range endpoints in chronological order', () => {
    cy.visit('/time-picker-root.html?range');
    cy.get('.sd-picker input').eq(0).click().clear().type('20:00:00{enter}');
    cy.get('.sd-picker input').eq(0).should('have.value', '17:00:00');
    cy.get('.sd-picker input').eq(1).should('have.value', '20:00:00');
    cy.get('[data-testid="events"]').should(
      'contain.text',
      'value:17:00:00,20:00:00|change:17:00:00,20:00:00',
    );
  });
  it('clears a single value and emits clear after change', () => {
    cy.visit('/time-picker-root.html');
    cy.get('.sd-picker').then(($picker) => {
      const rect = $picker[0].getBoundingClientRect();
      return Cypress.automation('remote:debugger:protocol', {
        command: 'Runtime.evaluate',
        params: {
          expression: `(() => { const frame = document.querySelector('iframe.aut-iframe'); const rect = frame.getBoundingClientRect(); return { left: rect.left, top: rect.top, scale: rect.width / frame.clientWidth }; })()`,
          returnByValue: true,
        },
      }).then(({ result: { value: frame } }) =>
        Cypress.automation('remote:debugger:protocol', {
          command: 'Input.dispatchMouseEvent',
          params: {
            type: 'mouseMoved',
            x: frame.left + (rect.left + rect.width / 2) * frame.scale,
            y: frame.top + (rect.top + rect.height / 2) * frame.scale,
          },
        }),
      );
    });
    cy.get('.sd-picker-clear-icon').click();
    cy.get('.sd-picker input').should('have.value', '');
    cy.get('[data-testid="events"]').should(
      'contain.text',
      'value:undefined|change:undefined|clear',
    );
  });
  it('immediately commits panel selection with disableConfirm', () => {
    cy.visit('/time-picker-root.html?instant&open');
    cy.get('.sd-timepicker-column').first().contains('li', /^11$/).click();
    cy.get('[data-testid="events"]').should(
      'contain.text',
      'select:11:00:00|value:11:00:00|change:11:00:00',
    );
    cy.get('.sd-timepicker-footer-btn-wrapper').should('not.exist');
    cy.get('.sd-timepicker-container').should('be.visible');
  });
});

describe('React TimePicker Vue contract boundaries', () => {
  for (const range of [false, true]) {
    it(`preserves layout and click attributes for range=${range}`, () => {
      cy.visit(`/time-picker-boundaries.html?layout${range ? '&range' : ''}`);
      cy.get('.sd-picker')
        .should('have.class', 'picker-layout')
        .and('have.css', 'width', '194px')
        .and('have.css', 'margin-right', '24px')
        .and('have.css', 'margin-bottom', '20px')
        .click();
      cy.get('[data-testid="clicks"]').should('have.text', '1');
    });
  }
  it('emits Date payloads for every selected unit and a single confirmation', () => {
    cy.visit('/time-picker-boundaries.html');
    cy.get('.sd-timepicker-column').eq(0).contains('li', /^10$/).click();
    cy.get('.sd-timepicker-column').eq(1).contains('li', /^45$/).click();
    cy.get('.sd-timepicker-column').eq(2).contains('li', /^20$/).click();
    cy.get('[data-testid="events"]').should(
      'have.text',
      'select:10:30:00|date:true|select:10:45:00|date:true|select:10:45:20|date:true',
    );
    cy.get('.sd-picker input').type('{enter}');
    cy.get('[data-testid="events"]').should('contain.text', 'change:10:45:20|date:true');
  });
  it('uses twelve hour columns with twenty four hour output', () => {
    cy.visit('/time-picker-boundaries.html?12');
    cy.get('.sd-timepicker-column').should('have.length', 4);
    cy.get('.sd-timepicker-column').eq(0).find('[aria-selected="true"]').should('have.text', '01');
    cy.get('.sd-timepicker-column').eq(3).find('[aria-selected="true"]').should('have.text', 'pm');
    cy.get('.sd-timepicker-column').eq(1).contains('li', /^45$/).click();
    cy.get('.sd-timepicker-footer-btn-wrapper button').last().click();
    cy.get('.sd-picker input').should('have.value', '13:45:00');
  });

  it('switches AM and PM when the format alone implies a twelve-hour clock', () => {
    cy.visit('/time-picker-boundaries.html?meridiem');
    cy.get('.sd-timepicker-column').should('have.length', 4);
    cy.get('.sd-picker input').should('have.value', '01:30:00 pm');
    cy.get('.sd-timepicker-column').eq(3).contains('li', /^am$/).click();
    cy.get('.sd-timepicker-footer-btn-wrapper').contains('button', '确定').click();
    cy.get('.sd-picker input').should('have.value', '01:30:00 am');
    cy.get('[data-testid="events"]').should('contain.text', 'change:01:30:00 am|date:true');
  });
  for (const hide of [false, true]) {
    it(`normalizes disabled hours through AM and PM with hide=${hide}`, () => {
      cy.visit(`/time-picker-boundaries.html?12&disabled${hide ? '&hide' : ''}`);
      for (const hour of ['02', '12']) {
        if (hide)
          cy.get('.sd-timepicker-column')
            .eq(0)
            .contains('li', new RegExp(`^${hour}$`))
            .should('not.exist');
        else
          cy.get('.sd-timepicker-column')
            .eq(0)
            .contains('li', new RegExp(`^${hour}$`))
            .should('have.attr', 'aria-disabled', 'true');
      }
      cy.get('.sd-timepicker-column').eq(3).contains('li', /^am$/).click();
      cy.get('.sd-timepicker-column')
        .eq(0)
        .contains('li', /^02$/)
        .should('not.have.attr', 'aria-disabled');
    });
  }
  it('passes twenty four hour arguments to dependent disabled callbacks', () => {
    cy.visit('/time-picker-boundaries.html?12&callbacks');
    cy.get('.sd-timepicker-column')
      .eq(1)
      .contains('li', /^45$/)
      .should('have.attr', 'aria-disabled', 'true');
    cy.get('.sd-timepicker-column')
      .eq(2)
      .contains('li', /^20$/)
      .should('have.attr', 'aria-disabled', 'true');
    cy.get('.sd-timepicker-column').eq(3).contains('li', /^am$/).click();
    cy.get('.sd-timepicker-column')
      .eq(1)
      .contains('li', /^45$/)
      .should('not.have.attr', 'aria-disabled');
    cy.get('.sd-timepicker-column')
      .eq(2)
      .contains('li', /^20$/)
      .should('not.have.attr', 'aria-disabled');
  });
  it('ignores bracketed format literals when building columns', () => {
    cy.visit('/time-picker-boundaries.html?literal');
    cy.get('.sd-timepicker-column').should('have.length', 2);
    cy.get('.sd-picker input').should('have.value', '13:30 seconds');
  });
  it('applies independent discrete step intervals', () => {
    cy.visit('/time-picker-boundaries.html?step');
    for (const [index, length] of [
      [0, 12],
      [1, 6],
      [2, 4],
    ])
      cy.get('.sd-timepicker-column').eq(index).find('li').should('have.length', length);
  });
  it('preserves timestamp zero as a real time', () => {
    cy.visit('/time-picker-boundaries.html?epoch');
    cy.window().then((win) => {
      const epoch = new win.Date(0);
      const expected = [epoch.getHours(), epoch.getMinutes(), epoch.getSeconds()]
        .map((value) => String(value).padStart(2, '0'))
        .join(':');
      cy.get('.sd-picker input').should('have.value', expected);
    });
  });
});

export {};
