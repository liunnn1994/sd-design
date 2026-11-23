describe('React InputNumber', () => {
  beforeEach(() => cy.visit('/input-number.html'));

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

  it('shows the custom readonly tip for editing and supports imperative focus and blur', () => {
    const input = () => cy.get('[aria-label="Model number"]');
    cy.contains('button', 'Toggle number readonly').click();
    cy.contains('button', 'Focus number ref').click();
    input().should('be.focused').and('have.attr', 'readonly');
    cy.press(Cypress.Keyboard.Keys.LEFT);
    cy.contains('.sd-tooltip-content', 'Number cannot be edited').should('not.exist');
    input().trigger('keydown', { eventConstructor: 'KeyboardEvent', key: '3' });
    cy.contains('.sd-tooltip-content', 'Number cannot be edited').should('be.visible');
    input().should('have.value', '2');
    cy.contains('button', 'Blur number ref').click();
    input().should('not.be.focused');
    cy.get('[data-testid="number-events"]').should('have.text', 'blur');
  });

  it('publishes spinbutton bounds and rounds committed drafts using step precision', () => {
    const input = () => cy.get('[role="spinbutton"][aria-label="Decimal number"]');
    input().should('have.attr', 'aria-valuemin', '0');
    input().should('have.attr', 'aria-valuemax', '4');
    input().should('have.value', '').type('{upArrow}').should('have.value', '0.00');
    input().type('{upArrow}').should('have.value', '0.01');
    input().clear().type('3.14159').blur().should('have.value', '3.14');
    input().should('have.attr', 'aria-valuenow', '3.14');
    cy.get('[data-testid="number-events"]').should('contain.text', 'decimal:3.14');
  });

  it('rejects a pasted non-finite draft without publishing input or change', () => {
    const input = () => cy.get('[aria-label="Decimal number"]');
    input().should('have.value', '');
    input().invoke('val', 'Infinity').trigger('input', { inputType: 'insertFromPaste' });
    input().should('have.value', '');
    cy.get('[data-testid="number-events"]').should('be.empty');
  });

  it('stops a held step when the step controls are hidden', () => {
    cy.clock();
    const input = () => cy.get('[aria-label="Repeat number"]');
    const increase = () => input().parent().find('[aria-label="增加"]');
    increase().trigger('mousedown');
    input().should('have.value', '1');
    cy.contains('button', 'Toggle repeat buttons').click();
    increase().should('not.exist');
    cy.tick(1000);
    input().should('have.value', '1');
    cy.get('[data-testid="number-events"]').should('have.text', 'repeat:1');
  });

  it('stops held steps on mouse release and when the pointer leaves the button', () => {
    cy.clock();
    const input = () => cy.get('[aria-label="Repeat number"]');
    const step = (name: string) => input().parent().find(`[aria-label="${name}"]`);
    step('增加').trigger('mousedown');
    cy.tick(800);
    input().should('have.value', '2');
    step('增加').trigger('mouseup');
    cy.tick(1000);
    input().should('have.value', '2');
    step('减少').trigger('mousedown');
    step('减少').trigger('mouseout', { eventConstructor: 'MouseEvent', relatedTarget: null });
    cy.tick(1000);
    input().should('have.value', '1');
    cy.get('[data-testid="number-events"]').should('have.text', 'repeat:1|repeat:2|repeat:1');
  });

  it('keeps both exact range boundaries and refreshes button availability after each blur', () => {
    const input = () => cy.get('[aria-label="Tight range"]');
    const root = () => input().closest('.sd-input-number');
    const step = (name: string) => root().find(`[aria-label="${name}"]`);
    root().should(([$root]) =>
      expect($root.style.getPropertyValue('--sd-fit-width')).to.equal('2ch'),
    );
    input().type('9').blur().should('have.value', '1.26');
    root().should(([$root]) =>
      expect($root.style.getPropertyValue('--sd-fit-width')).to.match(/^\d+(?:\.\d+)?px$/),
    );
    input().should('have.attr', 'aria-valuenow', '1.26');
    step('增加').should('be.disabled');
    step('减少').should('be.enabled');
    input().clear().type('0').blur().should('have.value', '1.24');
    input().should('have.attr', 'aria-valuenow', '1.24');
    step('减少').should('be.disabled');
    step('增加').should('be.enabled');
    cy.get('[data-testid="number-events"]').should('have.text', 'bound:1.26|bound:1.24');
  });

  it('synchronizes adjacent controlled strings and preserves suffix formatting and decimal digits', () => {
    const input = () => cy.get('[aria-label="Exact weight"]');
    input().should('have.value', '9007199254740992 kg');
    cy.contains('button', 'Set adjacent exact weight').click();
    input().should('have.value', '9007199254740993 kg');
    input().type('{upArrow}').should('have.value', '9007199254740994 kg');
    input().should('have.attr', 'aria-valuenow', '9007199254740994');
    cy.get('[data-testid="exact-weight"]').should('have.text', '"9007199254740994"');
    cy.contains('button', 'Set trailing-zero weight').click();
    input().should('have.value', '5.100 kg');
    input()
      .focus()
      .then(([$input]) => {
        ($input as HTMLInputElement).setSelectionRange(5, 5);
      });
    input().type('2').blur().should('have.value', '5.1002 kg');
    cy.get('[data-testid="exact-weight"]').should('have.text', '"5.1002"');
    cy.get('[data-testid="number-events"]').should(
      'have.text',
      'weight:"9007199254740994"|weight:"5.1002"',
    );
    input().should('have.attr', 'aria-valuetext', '5.1002 kg');
    input().clear().blur().should('have.value', '');
    input().should('not.have.attr', 'aria-valuenow');
    cy.get('[data-testid="exact-weight"]').should('have.text', '""');
    cy.get('[data-testid="number-events"]').should('contain.text', 'weight:""');
  });

  it('disables all numeric controls with the Form and restores editing when enabled', () => {
    const input = () => cy.get('[aria-label="Model number"]');
    const form = () => cy.get('[data-testid="number-fixture"] .sd-form');
    const toggle = () => cy.contains('button', 'Toggle number form disabled').click();
    toggle();
    input().should('be.disabled');
    form().find('.sd-input-number-step-button').should('be.disabled');
    form().find('.sd-input-clear-btn').should('not.exist');
    input().trigger('keydown', { eventConstructor: 'KeyboardEvent', key: 'ArrowUp', force: true });
    input().should('have.value', '2');
    cy.get('[data-testid="number-events"]').should('be.empty');
    toggle();
    input().should('be.enabled');
    input().type('{upArrow}').should('have.value', '3');
    cy.get('[data-testid="number-value"]').should('have.text', '3');
  });
});
