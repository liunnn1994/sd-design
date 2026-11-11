describe('React Switch', () => {
  beforeEach(() => cy.visit('/'));

  it('cancels native scrolling for Slider touch drag and cleans up cancelled gestures', () => {
    cy.get('[data-testid="single-slider"] [role="slider"]').then(($handle) => {
      const event = new Event('touchstart', { bubbles: true, cancelable: true });
      $handle[0].dispatchEvent(event);
      expect(event.defaultPrevented).to.equal(true);
    });
    cy.get('[data-testid="single-slider"] .sd-slider-track').then(($track) => {
      const rect = $track[0].getBoundingClientRect();
      cy.window().then((win) => {
        const event = new Event('touchmove');
        Object.defineProperty(event, 'touches', {
          value: [{ clientX: rect.right, clientY: rect.top }],
        });
        win.dispatchEvent(event);
        win.dispatchEvent(new Event('touchcancel'));
      });
    });
    cy.get('[data-testid="slider-value"]').should('have.text', '95');
    cy.window().then((win) =>
      win.dispatchEvent(new MouseEvent('mousemove', { clientX: 0, clientY: 0 })),
    );
    cy.get('[data-testid="slider-value"]').should('have.text', '95');
  });

  it('renders Slider ticks and marks and maps negative vertical coordinates', () => {
    cy.get('[data-testid="single-slider"] .sd-slider-tick').should('have.length', 9);
    cy.get('[data-testid="single-slider"] .sd-slider-mark').should('have.length', 3);
    cy.get('[data-testid="vertical-slider"] .sd-slider-track')
      .scrollIntoView()
      .then(($track) => {
        const rect = $track[0].getBoundingClientRect();
        cy.wrap($track).trigger('click', {
          clientX: rect.left,
          clientY: rect.top + rect.height * 0.25,
        });
      });
    cy.get('[data-testid="vertical-slider"] [role="slider"]').should(
      'have.attr',
      'aria-valuenow',
      '30',
    );
    cy.get('[data-testid="vertical-slider"] .sd-slider-bar').should('have.css', 'bottom', '0px');
    cy.get('[data-testid="silent-slider"] [role="slider"]').trigger('mousedown');
    cy.get('.sd-tooltip-content').should('not.exist');
    cy.window().then((win) => win.dispatchEvent(new MouseEvent('mouseup')));
  });

  it('selects Rate half values, clears through provider defaults and validates the form', () => {
    cy.get('[aria-label="Model rating"] .sd-rate-character-left').eq(2).click({ force: true });
    cy.get('[data-testid="rate-value"]').should('have.text', '2.5');
    cy.get('[aria-label="Model rating"] [aria-checked="true"]').should(
      'have.attr',
      'aria-posinset',
      '5',
    );
    cy.get('[data-testid="rate-events"]').should('contain.text', 'value:2.5|change:2.5');
    cy.get('[aria-label="Model rating"] .sd-rate-character-left').eq(2).click({ force: true });
    cy.get('[data-testid="rate-value"]').should('have.text', '0');
    cy.contains('Score required').should('be.visible');
    cy.get('[aria-label="Model rating"] .sd-rate-character-right').eq(3).click({ force: true });
    cy.contains('Score required').should('not.exist');
    cy.get('[aria-label="No clear rating"] .sd-rate-character-right').eq(1).click({ force: true });
    cy.get('[aria-label="No clear rating"] [aria-checked="true"]').should(
      'have.attr',
      'aria-posinset',
      '2',
    );
  });

  it('applies Rate keyboard bounds, controlled rejection and dynamic half mode', () => {
    cy.get('[aria-label="Model rating"]').trigger('keydown', { key: 'ArrowRight' });
    cy.get('[data-testid="rate-value"]').should('have.text', '2.5');
    cy.get('[aria-label="Model rating"]').trigger('keydown', { key: 'End' });
    cy.get('[data-testid="rate-value"]').should('have.text', '5');
    cy.get('[aria-label="Model rating"]').trigger('keydown', { key: 'ArrowRight' });
    cy.get('[data-testid="rate-value"]').should('have.text', '5');
    cy.get('[aria-label="Model rating"]').trigger('keydown', { key: 'Home' });
    cy.get('[data-testid="rate-value"]').should('have.text', '0');
    cy.contains('button', 'Toggle rate half').click();
    cy.get('[aria-label="Model rating"] [role="radio"]').should('have.length', 5);
    cy.get('[aria-label="Model rating"]').trigger('keydown', { key: 'ArrowUp' });
    cy.get('[data-testid="rate-value"]').should('have.text', '1');
    cy.get('[aria-label="Locked rating"]').trigger('keydown', { key: 'End' });
    cy.get('[aria-label="Locked rating"] [aria-checked="true"]').should(
      'have.attr',
      'aria-posinset',
      '2',
    );
    cy.contains('button', 'Set rate externally').click();
    cy.get('[data-testid="rate-value"]').should('have.text', '4');
  });

  it('clears Rate hover on disable and displays readonly tips only when enabled', () => {
    cy.get('[aria-label="Model rating"] .sd-rate-character-right')
      .eq(4)
      .trigger('mouseover', { force: true });
    cy.get('[aria-label="Model rating"] .sd-rate-character-full').should('have.length', 5);
    cy.contains('button', 'Toggle rate disabled').click();
    cy.get('[aria-label="Model rating"] .sd-rate-character-full').should('have.length', 2);
    cy.get('[aria-label="Model rating"]').should('not.have.attr', 'tabindex');
    cy.get('[data-testid="rate-events"]').should('contain.text', 'hover:5|hover:0');
    cy.contains('button', 'Toggle rate readonly').click();
    cy.get('[aria-label="Model rating"] .sd-rate-character-right').eq(4).click({ force: true });
    cy.contains('.sd-tooltip-content', 'Rating is locked').should('not.exist');
    cy.contains('button', 'Toggle rate disabled').click();
    cy.get('[aria-label="Model rating"] .sd-rate-character-right').eq(4).click({ force: true });
    cy.contains('.sd-tooltip-content', 'Rating is locked').should('be.visible');
    cy.get('[data-testid="rate-value"]').should('have.text', '2');
  });

  it('renders Rate threshold colors, custom characters and grading faces', () => {
    cy.get('[aria-label="Model rating"] .sd-rate-character-right')
      .eq(0)
      .should('have.css', 'color', 'rgb(255, 0, 0)');
    cy.contains('button', 'Set rate externally').click();
    cy.get('[aria-label="Model rating"] .sd-rate-character-right')
      .eq(2)
      .should('have.css', 'color', 'rgb(0, 0, 255)');
    cy.get('[aria-label="Custom rating"] .sd-rate-character').should('have.length', 3);
    cy.get('[data-testid="rate-custom"]').first().should('have.text', '0');
    cy.contains('button', 'Toggle rate grading').click();
    cy.get('[aria-label="Grading rating"] .sd-rate-character').should('have.length', 5);
    cy.get('[aria-label="Grading rating"] .sd-icon-face-smile-fill').should('have.length', 10);
  });

  it('restores Checkbox indeterminate state and rejects controlled native toggles', () => {
    cy.get('[aria-label="Mixed check"]').should('have.prop', 'indeterminate', true);
    cy.get('[aria-label="Mixed check"]').click({ force: true });
    cy.get('[aria-label="Mixed check"]').should('have.prop', 'checked', true);
    cy.get('[aria-label="Mixed check"]').should('have.prop', 'indeterminate', true);
    cy.contains('button', 'Toggle mixed state').click();
    cy.get('[aria-label="Mixed check"]').should('have.prop', 'indeterminate', false);
    cy.get('[aria-label="Locked check"]').click({ force: true }).should('not.be.checked');
    cy.get('[aria-label="Locked check"]').focus().should('be.focused');
    cy.press(Cypress.Keyboard.Keys.SPACE);
    cy.get('[aria-label="Locked check"]').should('not.be.checked');
    cy.get('[aria-label="False check"]').should('be.checked');
    cy.get('[aria-label="Independent check"]').should('be.checked').and('not.be.disabled');
  });

  it('enforces Checkbox group limits while allowing removal and dynamic disabling', () => {
    cy.get('[data-testid="checks"] input').eq(0).should('be.checked');
    cy.get('[data-testid="checks"] label').eq(1).click();
    cy.get('[data-testid="check-values"]').should('have.text', '0,1');
    cy.get('[data-testid="checks"] input').eq(3).should('be.disabled');
    cy.get('[data-testid="checks"] label').eq(0).click();
    cy.get('[data-testid="checks"] input').eq(3).should('not.be.disabled');
    cy.get('[data-testid="checks"] input').eq(2).should('be.disabled');
    cy.contains('button', 'Toggle selection limit').click();
    cy.get('[data-testid="checks"] input').eq(0).should('be.disabled');
    cy.get('[data-testid="checks"] label').eq(1).click();
    cy.get('[data-testid="checks"] input').eq(0).should('not.be.disabled');
    cy.contains('button', 'Toggle choice disabled').click();
    cy.get('[data-testid="checks"] input').each((input) => cy.wrap(input).should('be.disabled'));
  });

  it('restores both controlled Radio peers on repeated rejected updates', () => {
    cy.get('[data-testid="locked-radios"] input').eq(0).should('be.checked');
    cy.get('[data-testid="locked-radios"] label').eq(1).click();
    cy.get('[data-testid="locked-radios"] input').eq(0).should('be.checked');
    cy.get('[data-testid="locked-radios"] input').eq(1).should('not.be.checked');
    cy.get('[data-testid="locked-radios"] label').eq(1).click();
    cy.get('[data-testid="locked-radios"] input').eq(0).should('be.checked');
    cy.get('[data-testid="choice-events"]').should('have.text', 'locked:b|locked:b');
  });

  it('navigates native Radio groups by keyboard and preserves values across option and type changes', () => {
    cy.get('[data-testid="radios"] input').eq(0).focus().should('be.focused');
    cy.press(Cypress.Keyboard.Keys.RIGHT);
    cy.get('[data-testid="radio-value"]').should('have.text', '1');
    cy.contains('button', 'Toggle radio type').click();
    cy.get('[data-testid="radios"] .sd-radio-button').should('have.length', 3);
    cy.contains('button', 'Replace radio options').click();
    cy.get('[data-testid="radios"] input:checked').should('not.exist');
    cy.get('[data-testid="radios"] label').eq(0).click();
    cy.get('[data-testid="radio-value"]').should('have.text', '2');
    cy.get('[data-testid="boolean-radios"] input').eq(0).should('be.checked');
    cy.get('[data-testid="boolean-radios"] label').eq(1).click();
    cy.get('[data-testid="boolean-radios"] input').eq(1).should('be.checked');
    cy.contains('button', 'Toggle choice disabled').click();
    cy.get('[data-testid="radios"] input').each((input) => cy.wrap(input).should('be.disabled'));
  });

  it('renders choice custom indicators and labels and validates Checkbox form changes', () => {
    cy.get('[data-testid="custom-check"]').should('have.text', 'true');
    cy.contains('.sd-checkbox-label', 'Custom 0').should('be.visible');
    cy.get('[data-testid="custom-radio"]').should('have.text', 'true');
    cy.get('[aria-label="Form check"]').click({ force: true });
    cy.get('[aria-label="Form check"]').click({ force: true });
    cy.contains('Accept required').should('be.visible');
    cy.get('[aria-label="Form check"]').click({ force: true });
    cy.contains('Accept required').should('not.exist');
  });

  it('commits number drafts on blur, clamps bounds and restores stepping after clear', () => {
    cy.get('[aria-label="Model number"]').clear().type('8');
    cy.get('[data-testid="number-value"]').should('have.text', '2');
    cy.get('[aria-label="Model number"]').blur().should('have.value', '5');
    cy.get('[data-testid="number-value"]').should('have.text', '5');
    cy.get('[data-testid="number-fixture"] .sd-form [aria-label="增加"]').should('be.disabled');
    cy.contains('button', 'Clear number events').click();
    cy.get('[aria-label="Model number"]').focus();
    cy.get('[data-testid="number-fixture"] .sd-input-clear-btn').focus().type('{enter}');
    cy.get('[aria-label="Model number"]').should('have.value', '');
    cy.get('[data-testid="number-events"]').should(
      'have.text',
      'blur|value:5|value:undefined|change:undefined|clear',
    );
    cy.get('[aria-label="Model number"]').type('{upArrow}').should('have.value', '0');
    cy.get('[aria-label="Model number"]').type('{upArrow}').should('have.value', '1');
  });

  it('preserves exact numeric strings and updates formatting, modes and external values', () => {
    cy.get('[aria-label="Exact number"]')
      .type('{upArrow}')
      .should('have.value', '9007199254740993.126');
    cy.get('[aria-label="Exact number"]').should(
      'have.attr',
      'aria-valuenow',
      '9007199254740993.126',
    );
    cy.contains('button', 'Toggle number formatter').click();
    cy.get('[aria-label="Formatted number"]')
      .should('have.value', '$12')
      .clear()
      .type('20')
      .blur()
      .should('have.value', '$20');
    cy.contains('button', 'Toggle number formatter').click();
    cy.get('[aria-label="Formatted number"]').should('have.value', '20');
    cy.contains('button', 'Toggle number mode').click();
    cy.get('[data-testid="number-fixture"] .sd-form .sd-input-number-mode-button').should('exist');
    cy.get('[data-testid="number-fixture"] .sd-form [aria-label="增加"]')
      .trigger('mousedown')
      .trigger('mouseup');
    cy.get('[aria-label="Model number"]').should('have.value', '3');
    cy.contains('button', 'Toggle number max').click();
    cy.get('[aria-label="Model number"]').should('have.value', '1');
    cy.contains('button', 'Toggle number max').click();
    cy.contains('button', 'Set number externally').click();
    cy.get('[aria-label="Model number"]').should('have.value', '3');
    cy.contains('button', 'Focus number ref').click();
    cy.get('[aria-label="Model number"]').should('be.focused');
  });

  it('rejects invalid number text, supports live input and prevents readonly or cancelled steps', () => {
    cy.get('[aria-label="Model number"]').type('x').should('have.value', '2');
    cy.get('[aria-label="Live number"]').clear().type('7');
    cy.get('[data-testid="number-events"]').should('contain.text', 'live:7');
    cy.get('[aria-label="Prevented number"]').type('{upArrow}').should('have.value', '1');
    cy.contains('button', 'Toggle number readonly').click();
    cy.get('[aria-label="Model number"]')
      .trigger('keydown', { key: 'ArrowUp' })
      .should('have.value', '2');
    cy.contains('button', 'Toggle number readonly').click();
    cy.get('[aria-label="Model number"]').type('{downArrow}').should('have.value', '1');
  });

  it('repeats held numeric steps and cancels the pending timer after unmount', () => {
    cy.clock();
    cy.get('[aria-label="Repeat number"]')
      .parent()
      .find('[aria-label="增加"]')
      .trigger('mousedown');
    cy.get('[aria-label="Repeat number"]').should('have.value', '1');
    cy.tick(800);
    cy.get('[aria-label="Repeat number"]').should('have.value', '2');
    cy.tick(150);
    cy.get('[aria-label="Repeat number"]').should('have.value', '3');
    cy.contains('button', 'Toggle repeat number').click();
    cy.tick(1200);
    cy.get('[data-testid="number-events"]').should('have.text', 'repeat:1|repeat:2|repeat:3');
  });

  it('publishes Textarea input and blur/change in Vue order and supports keyboard clearing', () => {
    cy.get('[data-testid="textarea-fixture"]').within(() => {
      cy.get('[aria-label="Model textarea"]').type('a');
      cy.get('[data-testid="textarea-events"]').should('have.text', 'value:a|input:a');
      cy.get('[aria-label="Model textarea"]').blur();
      cy.get('[data-testid="textarea-events"]').should(
        'have.text',
        'value:a|input:a|blur|change:a',
      );
      cy.contains('button', 'Clear textarea events').click();
      cy.get('[aria-label="Model textarea"]').focus();
      cy.get('.sd-form .sd-textarea-clear-btn').should('be.visible').focus().type('{enter}');
      cy.get('[data-testid="textarea-events"]').should('have.text', 'blur|value:|change:|clear');
      cy.get('[aria-label="Model textarea"]').should('have.value', '');
      cy.contains('button', 'Focus textarea ref').click();
      cy.get('[aria-label="Model textarea"]').should('be.focused');
    });
  });

  it('preserves Textarea composition drafts, controlled rejection and grapheme limits', () => {
    cy.get('[data-testid="textarea-fixture"]').within(() => {
      cy.get('[aria-label="Locked textarea"]').type('x').should('have.value', 'fixed');
      cy.get('[aria-label="Model textarea"]')
        .trigger('compositionstart')
        .invoke('val', '中文')
        .trigger('input', { inputType: 'insertCompositionText' });
      cy.get('[data-testid="textarea-value"]').should('have.text', '');
      cy.get('[aria-label="Model textarea"]').trigger('compositionend', { data: '中文' });
      cy.get('[data-testid="textarea-value"]').should('have.text', '中文');
      cy.get('[aria-label="Limited textarea"]')
        .invoke('val', '😀ab')
        .trigger('input', { inputType: 'insertFromPaste' })
        .should('have.value', '😀a');
      cy.get('[aria-label="Limited textarea"]')
        .parent()
        .find('.sd-textarea-word-limit')
        .should('have.text', '2/2');
      cy.get('[aria-label="Fit textarea"]')
        .invoke('outerWidth')
        .then((width) => {
          cy.get('[aria-label="Fit textarea"]')
            .type(' longer content')
            .invoke('outerWidth')
            .should('be.greaterThan', width);
        });
    });
    cy.get('[aria-label="Readonly textarea"]').trigger('keydown', { key: 'x' });
    cy.contains('.sd-tooltip-content', 'Textarea cannot be edited').should('be.visible');
  });

  it('measures Textarea row limits and parent resize and restores native resize', () => {
    cy.get('[data-testid="textarea-fixture"]').within(() => {
      cy.get('[aria-label="Auto textarea"]')
        .should('have.css', 'resize', 'none')
        .invoke('outerHeight')
        .should('be.greaterThan', 100);
      cy.contains('button', 'Toggle textarea maximum').click();
      cy.get('[aria-label="Auto textarea"]').invoke('outerHeight').should('be.lessThan', 80);
      cy.get('[aria-label="Auto textarea"]').should('have.css', 'overflow-y', 'auto');
      cy.contains('button', 'Toggle textarea maximum').click();
      cy.get('[aria-label="Auto textarea"]').clear().type('One');
      cy.get('[aria-label="Auto textarea"]')
        .invoke('outerHeight')
        .then((height) => {
          cy.contains('button', 'Toggle textarea minimum').click();
          cy.get('[aria-label="Auto textarea"]')
            .invoke('outerHeight')
            .should('be.greaterThan', height);
        });
      cy.contains('button', 'Toggle textarea minimum').click();
      cy.get('[aria-label="Auto textarea"]')
        .clear()
        .type('A long sentence that will wrap when the parent becomes narrow');
      cy.get('[aria-label="Auto textarea"]')
        .invoke('outerHeight')
        .then((height) => {
          cy.contains('button', 'Resize textarea parent').click();
          cy.get('[aria-label="Auto textarea"]')
            .invoke('outerHeight')
            .should('be.greaterThan', height);
        });
      cy.contains('button', 'Toggle textarea auto size').click();
      cy.get('[aria-label="Auto textarea"]').should('have.css', 'resize', 'vertical');
      cy.get('.sd-textarea-mirror').should('not.exist');
      cy.contains('button', 'Toggle textarea mount').click();
      cy.get('[aria-label="Auto textarea"]').should('not.exist');
      cy.contains('button', 'Toggle textarea mount').click();
      cy.get('[aria-label="Auto textarea"]').should('exist');
    });
  });

  it('publishes Input value/input before commit change and clears through the keyboard', () => {
    cy.get('[data-testid="input-fixture"]').within(() => {
      cy.get('[aria-label="Model input"]').type('a');
      cy.get('[data-testid="input-events"]').should('have.text', 'value:a|input:a');
      cy.get('[aria-label="Model input"]').type('{enter}');
      cy.get('[data-testid="input-events"]').should('have.text', 'value:a|input:a|change:a|enter');
      cy.contains('button', 'Clear input events').click();
      cy.get('[aria-label="Model input"]').focus();
      cy.get('.sd-form .sd-input-clear-btn').should('be.visible').focus().type(' ');
      cy.get('[data-testid="input-events"]').should('have.text', 'value:|change:|clear');
      cy.get('[aria-label="Model input"]').should('have.value', '');
      cy.contains('button', 'Focus input ref').click();
      cy.get('[aria-label="Model input"]').should('be.focused');
    });
  });

  it('restores controlled Input values, counts graphemes and marks error-only limits', () => {
    cy.get('[data-testid="input-fixture"]').within(() => {
      cy.get('[aria-label="Locked input"]').type('x').should('have.value', 'fixed');
      cy.get('[aria-label="Limited input"]')
        .invoke('val', '😀😀😀')
        .trigger('input', { inputType: 'insertFromPaste' })
        .should('have.value', '😀😀');
      cy.get('[aria-label="Limited input"]')
        .parent()
        .find('.sd-input-word-limit')
        .should('have.text', '2/2');
      cy.get('[aria-label="Error limit input"]')
        .type('abc')
        .should('have.value', 'abc')
        .and('have.attr', 'aria-invalid', 'true');
      cy.get('[aria-label="Global clear input"]')
        .parent()
        .find('.sd-input-clear-btn')
        .should('exist');
      cy.get('[aria-label="No clear input"]')
        .parent()
        .find('.sd-input-clear-btn')
        .should('not.exist');
    });
  });

  it('keeps Input composition drafts and updates outer layout and fit width', () => {
    cy.get('[data-testid="input-fixture"]').within(() => {
      cy.get('[aria-label="Model input"]')
        .trigger('compositionstart')
        .invoke('val', '中文')
        .trigger('input', { inputType: 'insertCompositionText' });
      cy.get('[data-testid="input-model"]').should('have.text', '');
      cy.get('[aria-label="Model input"]').trigger('compositionend', { data: '中文' });
      cy.get('[data-testid="input-model"]').should('have.text', '中文');
      cy.contains('button', 'Toggle input outer').click();
      cy.get('.sd-form .sd-input-outer')
        .should('contain.text', 'https://')
        .and('contain.text', 'suffix');
      cy.get('[aria-label="Model input"]').should('have.value', '中文');
      cy.get('[aria-label="Numeric affix input"]')
        .closest('.sd-input-outer')
        .find('.sd-input-prepend, .sd-input-append, .sd-input-prefix, .sd-input-suffix')
        .should('have.length', 4)
        .each(($node) => expect($node.text()).to.equal('0'));
      cy.get('[aria-label="Numeric affix input"]').type('a');
      cy.get('[data-testid="input-event-target"]').should('have.text', 'INPUT');
      cy.get('[aria-label="Fit input"]')
        .invoke('outerWidth')
        .then((width) => {
          cy.get('[aria-label="Fit input"]')
            .type('longer value')
            .invoke('outerWidth')
            .should('be.greaterThan', width);
        });
    });
  });

  it('toggles password masking and blocks disabled search overrides', () => {
    cy.get('[data-testid="input-fixture"]').within(() => {
      cy.get('[aria-label="Password input"]').should('have.attr', 'type', 'password');
      cy.get('[aria-label="Password input"]').type('2');
      cy.get('[aria-label="Show password"]').click();
      cy.get('[aria-label="Password input"]')
        .should('have.attr', 'type', 'text')
        .and('have.value', 'password2')
        .and('be.focused');
      cy.contains('button', 'Run search').click();
      cy.get('[data-testid="input-searches"]').should('have.text', 'query');
      cy.contains('button', 'Disable input search').click();
      cy.contains('button', 'Run search').should('be.disabled');
      cy.get('[aria-label="Search input"]').should('be.disabled');
    });
    cy.get('[aria-label="Readonly input"]').trigger('keydown', { key: 'x' });
    cy.contains('.sd-tooltip-content', 'Cannot edit this value').should('be.visible');
    cy.get('[aria-label="Readonly input"]').should('have.value', 'secret');
  });

  it('validates Form controls after model commits and propagates nested errors and disabled state', () => {
    cy.get('[data-testid="form-fixture"]').within(() => {
      cy.contains('button', 'Validate form').click();
      cy.contains('[role="alert"]', 'Name required').should('be.visible');
      cy.contains('[role="alert"]', 'Name required').should(
        'not.have.class',
        'form-blink-enter-active',
      );
      cy.get('[data-testid="nested-form-item"] [role="alert"]').should(
        'have.text',
        'Agreement required',
      );
      cy.get('input').type('Ada');
      cy.contains('[role="alert"]', 'Name required').should('not.exist');
      cy.get('[aria-label="Form agreement"]').click();
      cy.get('[data-testid="nested-form-item"] [role="alert"]').should('not.exist');
      cy.get('label')
        .contains('Name')
        .invoke('attr', 'for')
        .then((id) => cy.get('input').should('have.attr', 'id', id));
      cy.get('[data-testid="form-inherited-button"]').should('have.class', 'sd-btn-size-small');
      cy.contains('button', 'Disable form').click();
      cy.get('input').should('be.disabled');
      cy.get('[role="switch"]').should('be.disabled');
      cy.get('[data-testid="form-inherited-button"]').should('be.disabled');
      cy.contains('button', 'Disable form').click();
      cy.contains('button', 'Submit form').click();
      cy.get('[data-testid="form-events"]').should('have.text', 'success,submit');
    });
  });

  it('accumulates Form setFields writeback and resets all initial snapshots', () => {
    cy.get('[data-testid="form-fixture"]').within(() => {
      cy.contains('button', 'Set form fields').click();
      cy.get('[data-testid="form-model"]').should(
        'have.text',
        '{"first":"set first","second":"set second","agree":true}',
      );
      cy.contains('[role="alert"]', 'Server first').should('be.visible');
      cy.contains('button', 'Reset form').click();
      cy.get('[data-testid="form-model"]').should(
        'have.text',
        '{"first":"","second":"initial","agree":false}',
      );
      cy.get('[role="alert"]').should('not.exist');
      cy.contains('button', 'Rename form field').click();
      cy.get('input').should('have.value', 'initial').clear().type('changed');
      cy.contains('button', 'Reset form').click();
      cy.get('input').should('have.value', 'initial');
    });
  });

  it('cleans up nested Form errors and registration on unmount', () => {
    cy.get('[data-testid="form-fixture"]').within(() => {
      cy.contains('button', 'Validate form').click();
      cy.get('[data-testid="nested-form-item"] [role="alert"]').should('exist');
      cy.contains('button', 'Toggle nested field').click();
      cy.get('[data-testid="nested-form-item"] [role="alert"]').should('not.exist');
      cy.get('input').type('Valid');
      cy.contains('button', 'Validate form').click();
      cy.get('[data-testid="form-result"]').should('have.text', 'null');
    });
  });

  it('invalidates late Form validation UI while preserving the validation result and submit snapshot', () => {
    cy.get('[data-testid="form-fixture"]').within(() => {
      cy.get('input').type('Original');
      cy.contains('button', 'Slow form validator').click();
      cy.contains('button', 'Validate name').click();
      cy.contains('button', 'Clear form').click();
      cy.contains('button', 'Finish form validator').click();
      cy.get('[data-testid="form-result"]').should('contain.text', 'Late error');
      cy.contains('[role="alert"]', 'Late error').should('not.exist');
      cy.contains('button', 'Submit form').click();
      cy.get('input').clear().type('Changed');
      cy.contains('button', 'Finish form validator').click();
      cy.get('[data-testid="form-result"]').should('contain.text', 'Original');
      cy.get('[data-testid="form-events"]').should('have.text', 'failed,submit');
    });
  });

  it('renders a single Watermark layer in StrictMode and updates props, body theme and child content', () => {
    cy.contains('button', 'Mount Watermark').click();
    cy.get('[data-testid="watermark"] > div')
      .should('have.length', 1)
      .and('have.css', 'pointer-events', 'none')
      .and('have.css', 'z-index', '9');
    cy.get('[data-testid="watermark"] > div').should('have.css', 'background-size', '200px auto');
    cy.get('[data-testid="watermark"] > div')
      .invoke('css', 'background-image')
      .then((initial) => {
        cy.contains('button', 'Update Watermark text').click();
        cy.get('[data-testid="watermark"] > div')
          .should('have.css', 'background-image')
          .and('not.equal', initial);
      });
    cy.get('[data-testid="watermark"] > div')
      .invoke('css', 'background-image')
      .then((initial) => {
        cy.document().then((doc) => doc.body.setAttribute('sd-theme', 'dark'));
        cy.get('[data-testid="watermark"] > div')
          .should('have.css', 'background-image')
          .and('not.equal', initial);
      });
    cy.contains('button', 'Watermark child 0').click();
    cy.contains('button', 'Watermark child 1').should('exist');
    cy.get('[data-testid="watermark"] > div').should('have.length', 1);
    cy.contains('button', 'Toggle Watermark offset').click();
    cy.get('[data-testid="watermark"] > div')
      .should('have.css', 'left', '30px')
      .and('have.css', 'top', '35px');
    cy.contains('button', 'Toggle Watermark repeat').click();
    cy.get('[data-testid="watermark"] > div')
      .should('have.css', 'background-repeat', 'no-repeat')
      .and('have.css', 'background-size', '100px auto');
    cy.contains('button', 'Read Watermark ref').click();
    cy.get('[data-testid="watermark-ref"]').should('have.text', 'DIV');
  });

  it('restores tampered Watermark layers, allows protection opt-out and removes owned nodes on unmount', () => {
    cy.contains('button', 'Mount Watermark').click();
    cy.get('[data-testid="watermark"] > div').then(($layer) => {
      $layer[0].remove();
    });
    cy.get('[data-testid="watermark"] > div').should('have.length', 1);
    cy.get('[data-testid="watermark"] > div').then(($layer) => {
      $layer[0].style.opacity = '0';
    });
    cy.get('[data-testid="watermark"] > div').should('have.css', 'opacity', '1');
    cy.contains('button', 'Toggle Watermark protection').click();
    cy.get('[data-testid="watermark"] > div').then(($layer) => {
      $layer[0].remove();
    });
    cy.contains('button', 'Watermark child 0').click();
    cy.get('[data-testid="watermark"] > div').should('not.exist');
    cy.contains('button', 'Toggle Watermark protection').click();
    cy.get('[data-testid="watermark"]').then(($root) => {
      cy.get('[data-testid="watermark"] > div').should('have.length', 1);
      cy.contains('button', 'Unmount Watermark').click();
      cy.then(() => expect($root[0].querySelectorAll('div')).to.have.length(0));
    });
  });

  it('draws image Watermarks with equal staggered alpha and converts the real canvas to grayscale', () => {
    cy.contains('button', 'Toggle Watermark image').click();
    cy.contains('button', 'Mount Watermark').click();
    const pixels = (gray: boolean) =>
      cy
        .get('[data-testid="watermark"] > div')
        .should('have.css', 'background-image')
        .then((background) => {
          cy.window().then(
            (win) =>
              new Cypress.Promise<void>((resolve, reject) => {
                const img = new win.Image();
                img.onerror = reject;
                img.onload = () => {
                  const canvas = win.document.createElement('canvas');
                  canvas.width = img.width;
                  canvas.height = img.height;
                  const ctx = canvas.getContext('2d')!;
                  ctx.drawImage(img, 0, 0);
                  const ratio = win.devicePixelRatio || 1;
                  const first = ctx.getImageData(30 * ratio, 25 * ratio, 1, 1).data;
                  const second = ctx.getImageData(130 * ratio, 85 * ratio, 1, 1).data;
                  expect(first[3]).to.be.within(126, 129);
                  expect(second[3]).to.equal(first[3]);
                  if (gray) {
                    expect(first[0]).to.equal(first[1]);
                    expect(first[1]).to.equal(first[2]);
                  } else {
                    expect(first[0]).to.equal(255);
                    expect(first[1]).to.equal(0);
                  }
                  resolve();
                };
                img.src = String(background).slice(5, -2);
              }),
          );
        });
    pixels(false);
    cy.contains('button', 'Toggle Watermark grayscale').click();
    pixels(true);
  });

  it('opens TagGroup hidden items by keyboard focus and forwards close without removing controlled tags', () => {
    cy.contains('button', 'Mount TagGroup').click();
    cy.get('[data-testid="tag-group-fixed"] .sd-tag-group-item-counter')
      .should('have.text', '+2')
      .and('have.attr', 'aria-haspopup', 'true');
    cy.get('[data-testid="tag-group-fixed"] .sd-tag-close-btn').click();
    cy.get('[data-testid="tag-group-fixed"] .sd-tag-group-item-content').should(
      'have.class',
      'custom-group-tag',
    );
    cy.get('[data-testid="tag-group-close"]').should('have.text', '1');
    cy.get('[data-testid="tag-group-fixed"]').should('contain.text', 'Closable');
    cy.get('[data-testid="tag-group-fixed"] .sd-tag-group-counter-content').focus();
    cy.get('.sd-tag-group-popover:visible')
      .should('contain.text', 'Hidden one')
      .and('contain.text', 'Hidden two');
    cy.contains('button', 'Toggle TagGroup limit').click();
    cy.get('[data-testid="tag-group-fixed"] .sd-tag-group-item-counter').should('not.exist');
    cy.get('[data-testid="tag-group-fixed"] .sd-tag-group-item').should('have.length', 3);
    cy.contains('button', 'Read TagGroup ref').click();
    cy.get('[data-testid="tag-group-ref"]').should('have.text', 'SPAN');
    cy.contains('button', 'Empty TagGroup').click();
    cy.get('[data-testid="tag-group-fixed"]')
      .should('have.class', 'sd-tag-group-empty')
      .and('have.text', 'No tags');
  });

  it('recomputes responsive TagGroup counters on width and option changes', () => {
    cy.contains('button', 'Mount TagGroup').click();
    cy.get('[data-testid="tag-group-responsive"] .sd-tag-group-item-counter:visible').should(
      'have.text',
      '+1',
    );
    cy.contains('button', 'Append TagGroup option').click();
    cy.get('[data-testid="tag-group-responsive"] .sd-tag-group-item-counter:visible').should(
      'have.text',
      '+2',
    );
    cy.get('[data-testid="tag-group-responsive"] [data-part="item"]:visible').should(
      'have.length',
      2,
    );
    cy.contains('button', 'Resize TagGroup').click();
    cy.get('[data-testid="tag-group-responsive"] [data-part="item"]:visible').should(
      'have.length',
      4,
    );
    cy.get('[data-testid="tag-group-responsive"] .sd-tag-group-item-counter').should('not.exist');
    cy.get('[data-testid="tag-group-responsive"] [role="listitem"]').should('have.length', 4);
    cy.get('[data-testid="tag-group-responsive"] [data-part="content"]').should(($content) => {
      expect(parseFloat(getComputedStyle($content[0]).columnGap)).to.be.greaterThan(0);
      const items = $content.find('[data-part="item"]:visible').toArray();
      expect(new Set(items.map((item) => item.getBoundingClientRect().top)).size).to.equal(1);
    });
    cy.contains('button', 'Resize TagGroup').click();
    cy.get('[data-testid="tag-group-responsive"] .sd-tag-group-item-counter:visible').should(
      'have.text',
      '+2',
    );
  });

  it('preserves TagGroup mapped fields and custom item, label and counter render functions', () => {
    cy.contains('button', 'Mount TagGroup').click();
    cy.get('[data-testid="tag-group-custom"] a')
      .should('have.attr', 'href', '#docs')
      .and('have.attr', 'data-context', 'docs:0:false:false');
    cy.contains('[data-testid="tag-group-custom"] button', 'More 1').focus();
    cy.get('.sd-tag-group-popover:visible a')
      .should('have.attr', 'href', '#help')
      .and('have.attr', 'data-context', 'help:1:false:false');
    cy.get('[data-testid="tag-group-label"]').should('contain.text', 'First label');
    cy.contains('button', 'Toggle TagGroup label').click();
    cy.get('[data-testid="tag-group-label"] b').should('contain.text', 'Custom function');
    cy.contains('button', 'Unmount TagGroup').click();
    cy.get('.sd-tag-group-popover').should('not.exist');
  });

  it('renders Progress line dimensions, gradients, animation, custom text and native refs', () => {
    cy.contains('button', 'Mount Progress').click();
    cy.get('[data-testid="progress-line"] [role="progressbar"]').should(
      'have.attr',
      'aria-valuenow',
      '25',
    );
    cy.get('[data-testid="progress-line"] .sd-progress-line')
      .should('have.css', 'width', '160px')
      .and('have.css', 'height', '4px');
    cy.get('[data-testid="progress-line"] .sd-progress-line-bar')
      .should('have.class', 'sd-progress-line-bar-animate')
      .and('have.css', 'background-image')
      .and('include', 'linear-gradient');
    cy.contains('button', 'Toggle Progress width').click();
    cy.get('[data-testid="progress-line"] .sd-progress-line')
      .should('have.css', 'height', '8px')
      .and('have.attr', 'style')
      .and('include', '75%');
    cy.contains('button', 'Toggle Progress text').click();
    cy.get('[data-testid="progress-line"] .sd-progress-line-text').should(
      'have.text',
      'Value 0.25',
    );
    cy.contains('button', 'Toggle Progress visibility').click();
    cy.get('[data-testid="progress-line"] .sd-progress-line-text').should('not.exist');
    cy.contains('button', 'Read Progress ref').click();
    cy.get('[data-testid="progress-ref"]').should('have.text', 'DIV');
  });

  it('isolates Progress SVG gradients and updates circle geometry and status icons', () => {
    cy.contains('button', 'Mount Progress').click();
    cy.get('.sd-progress-circle-svg')
      .should('have.length', 2)
      .then(($svgs) => {
        const ids = [...$svgs].map((svg) => svg.querySelector('linearGradient')!.id);
        expect(new Set(ids).size).to.equal(2);
        [...$svgs].forEach((svg, index) =>
          expect(
            (svg.querySelector('.sd-progress-circle-bar') as SVGElement).style.stroke.replace(
              /["']/g,
              '',
            ),
          ).to.equal(`url(#${ids[index]})`),
        );
      });
    cy.contains('button', 'Toggle Progress width').click();
    cy.get('[data-testid="progress-circle"] [role="progressbar"]').should(
      'have.css',
      'width',
      '96px',
    );
    cy.get('[data-testid="progress-circle"] circle').first().should('have.attr', 'r', '46');
    cy.contains('button', 'Toggle Progress percent').click();
    cy.get('[data-testid="progress-circle"]').should('have.class', 'sd-progress-status-success');
    cy.get('[data-testid="progress-circle"] .sd-icon-check').should('exist');
    cy.contains('button', 'Toggle Progress danger').click();
    cy.get('[data-testid="progress-circle"] .sd-icon-exclamation').should('exist');
    cy.contains('button', 'Toggle Progress gradient').click();
    cy.get('[data-testid="progress-circle"] linearGradient').should('not.exist');
    cy.get('[data-testid="progress-circle"] .sd-progress-circle-bar').should(
      'have.css',
      'stroke',
      'rgb(0, 255, 0)',
    );
  });

  it('switches Progress mini and steps modes while preserving type precedence and text slots', () => {
    cy.contains('button', 'Mount Progress').click();
    cy.contains('button', 'Toggle Progress mini').click();
    cy.contains('button', 'Toggle Progress percent').click();
    cy.get('[data-testid="progress-line"] .sd-progress-circle-svg').should('exist');
    cy.get('[data-testid="progress-circle"] .sd-progress-circle-svg').should('not.exist');
    cy.get('[data-testid="progress-circle"] .sd-icon-check').should('exist');
    cy.contains('button', 'Toggle Progress steps').click();
    cy.get('[data-testid="progress-circle"]').should('have.class', 'sd-progress-type-steps');
    cy.get('[data-testid="progress-circle"] .sd-progress-steps-item-active').should(
      'have.length',
      4,
    );
    cy.contains('button', 'Toggle Progress percent').click();
    cy.get('[data-testid="progress-circle"] .sd-progress-steps-item-active').should(
      'have.length',
      1,
    );
    cy.contains('button', 'Toggle Progress danger').click();
    cy.get('[data-testid="progress-circle"] .sd-icon-exclamation-circle-fill').should('exist');
    cy.contains('button', 'Toggle Progress text').click();
    cy.get('[data-testid="progress-circle"] .sd-progress-steps-text').should(
      'have.text',
      'Value 0.25',
    );
    cy.get('[data-testid="progress-circle"] .sd-icon-exclamation-circle-fill').should('not.exist');
  });

  it('formats statistics and updates placeholders, date values and animation start', () => {
    cy.contains('button', 'Mount statistics').click();
    cy.get('[data-testid="statistic-number"] .sd-number-flow').should(
      'have.attr',
      'aria-label',
      '1,234.50',
    );
    cy.get('[data-testid="statistic-number"] .sd-statistic-value').should(
      'have.css',
      'color',
      'rgb(1, 2, 3)',
    );
    cy.get('[data-testid="statistic-date"]').should('contain.text', '2026-01-02');
    cy.get('[data-testid="statistic-start"] .sd-number-flow').should(
      'have.attr',
      'aria-label',
      '2',
    );
    cy.contains('button', 'Toggle statistic start').click();
    cy.get('[data-testid="statistic-start"] .sd-number-flow').should(
      'have.attr',
      'aria-label',
      '10',
    );
    cy.contains('button', 'Toggle statistic value').click();
    cy.get('[data-testid="statistic-number"]').should('contain.text', 'Pending');
    cy.get('[data-testid="statistic-number"] .sd-statistic-prefix').should('not.exist');
    cy.contains('button', 'Toggle statistic value').click();
    cy.get('[data-testid="statistic-number"] .sd-number-flow').should(
      'have.attr',
      'aria-label',
      '2,345.75',
    );
  });

  it('resumes expired countdowns once, restarts changed deadlines and cleans up timers', () => {
    cy.clock(10000);
    cy.contains('button', 'Mount statistics').click();
    cy.get('[data-testid="statistic-countdown"] .sd-number-flow').should(
      'have.attr',
      'aria-label',
      '02',
    );
    cy.tick(3000);
    cy.get('[data-testid="statistic-finishes"]').should('have.text', '0');
    cy.contains('button', 'Toggle statistic start').click();
    cy.get('[data-testid="statistic-finishes"]').should('have.text', '1');
    cy.get('[data-testid="statistic-countdown"] .sd-number-flow').should(
      'have.attr',
      'aria-label',
      '00',
    );
    cy.contains('button', 'Toggle statistic start').click();
    cy.contains('button', 'Toggle statistic start').click();
    cy.get('[data-testid="statistic-finishes"]').should('have.text', '1');
    cy.contains('button', 'Reset countdown deadline').click();
    cy.tick(1000);
    cy.get('[data-testid="statistic-countdown"] .sd-number-flow').should(
      'have.attr',
      'aria-label',
      '02',
    );
    cy.contains('button', 'Toggle countdown format').click();
    cy.get('[data-testid="statistic-countdown"] .sd-number-flow').should('have.length', 2);
    cy.tick(2100);
    cy.get('[data-testid="statistic-finishes"]').should('have.text', '2');
    cy.contains('button', 'Reset countdown deadline').click();
    cy.contains('button', 'Toggle countdown mount').click();
    cy.tick(4000);
    cy.get('[data-testid="statistic-finishes"]').should('have.text', '2');
  });

  it('freezes a paused countdown and refreshes its changed format when resumed', () => {
    cy.clock(20000);
    cy.contains('button', 'Mount statistics').click();
    cy.contains('button', 'Toggle countdown format').click();
    cy.get('[data-testid="statistic-countdown"] .sd-number-flow').should('have.length', 1);
    cy.tick(500);
    cy.contains('button', 'Toggle statistic start').click();
    cy.tick(100);
    cy.get('[data-testid="statistic-countdown"] .sd-number-flow')
      .should('have.length', 2)
      .last()
      .should('have.attr', 'aria-label', '01');
    cy.contains('button', 'Toggle statistic start').click();
    cy.tick(3000);
    cy.get('[data-testid="statistic-countdown"] .sd-number-flow')
      .last()
      .should('have.attr', 'aria-label', '01');
    cy.get('[data-testid="statistic-finishes"]').should('have.text', '0');
    cy.contains('button', 'Toggle countdown mount').click();
    cy.contains('button', 'Toggle countdown mount').click();
    cy.get('[data-testid="statistic-finishes"]').should('have.text', '1');
  });

  it('switches Tabs by keyboard, skips disabled panes and preserves update/change/click order', () => {
    cy.contains('button', 'Mount Tabs').click();
    cy.contains('[data-testid="tabs-basic"] [role="tab"]', 'Basic zero')
      .focus()
      .type('{rightarrow}');
    cy.contains('[data-testid="tabs-basic"] [role="tab"]', 'Basic two').should(
      'have.attr',
      'aria-selected',
      'true',
    );
    cy.get('[data-testid="tabs-events"]').should(
      'have.text',
      'update:number:2|change:number:2|click:number:2',
    );
    cy.contains('[data-testid="tabs-basic"] [role="tab"]', 'Basic disabled').click();
    cy.get('[data-testid="tabs-events"]').should(
      'have.text',
      'update:number:2|change:number:2|click:number:2',
    );
    cy.contains('[data-testid="tabs-basic"] [role="tab"]', 'Basic two').focus().type('{end}');
    cy.focused().should('contain.text', 'Basic three').type('{home}');
    cy.focused().should('contain.text', 'Basic zero');
    cy.contains('button', 'Toggle Tabs RTL').click();
    cy.contains('[data-testid="tabs-basic"] [role="tab"]', 'Basic zero')
      .focus()
      .type('{leftarrow}');
    cy.focused().should('contain.text', 'Basic two');
    cy.get('[data-testid="tabs-basic"] [role="tabpanel"]').each(($panel) => {
      const tab = $panel[0].ownerDocument.getElementById($panel.attr('aria-labelledby')!);
      expect(tab?.getAttribute('aria-controls')).to.equal($panel.attr('id'));
    });
    cy.contains('button', 'Tabs extra').click();
    cy.contains('[data-testid="tabs-basic"] [role="tab"]', 'Basic two').should(
      'have.attr',
      'aria-selected',
      'true',
    );
  });

  it('keeps controlled numeric and string Tabs keys distinct and supports hover activation', () => {
    cy.contains('button', 'Mount Tabs').click();
    cy.contains('[data-testid="tabs-controlled"] [role="tab"]', 'Controlled string')
      .click()
      .should('have.attr', 'aria-selected', 'false');
    cy.get('[data-testid="tabs-events"]').should('have.text', 'request:string:0');
    cy.contains('button', 'Allow Tabs writeback').click();
    cy.contains('[data-testid="tabs-controlled"] [role="tab"]', 'Controlled string')
      .click()
      .should('have.attr', 'aria-selected', 'true');
    cy.contains('[data-testid="tabs-controlled"] [role="tab"]', 'Controlled number').should(
      'have.attr',
      'aria-selected',
      'false',
    );
    cy.contains('[data-testid="tabs-hover"] [role="tab"]', 'Hover B')
      .trigger('mouseover')
      .should('have.attr', 'aria-selected', 'true');
    cy.contains('[data-testid="tabs-hover"] [role="tab"]', 'Hover A')
      .focus()
      .type(' ')
      .should('have.attr', 'aria-selected', 'true');
  });
});

export {};
