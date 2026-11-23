import { inputMaskPresetCases } from '../../../web-core/tests/fixtures/input-mask-presets';

describe('React input-mask', () => {
  beforeEach(() => cy.visit('/input-mask.html'));

  it('formats InputMask, emits completion once in StrictMode and clears empty masks', () => {
    cy.get('[data-testid="mask-events"]').should('have.text', 'initial:12');
    cy.get('[data-testid="mask-main"] input')
      .should('have.value', '12-__')
      .focus()
      .type('34')
      .blur()
      .should('have.value', '12-34');
    cy.get('[data-testid="mask-value"]').should('have.text', '12-34');
    cy.get('[data-testid="mask-events"]').should('contain.text', 'complete:12-34');
    cy.get('[data-testid="mask-main"] .sd-input-word-limit').should('not.exist');
    cy.get('[data-testid="mask-main"] .sd-input-clear-btn').click({ force: true });
    cy.get('[data-testid="mask-main"] input').blur().should('have.value', '');
    cy.get('[data-testid="mask-main"] .sd-input-clear-btn').should('not.exist');
    cy.get('[data-testid="mask-main"] input')
      .focus()
      .should('have.value', '__-__')
      .type('56')
      .should('have.value', '56-__');
  });

  it('synchronizes external InputMask resets and mask removal without retaining placeholders', () => {
    cy.contains('button', 'Toggle mask').click();
    cy.get('[data-testid="mask-main"] input').should('have.value', '12-');
    cy.contains('button', 'Toggle mask').click();
    cy.get('[data-testid="mask-main"] input').should('have.value', '12-__');
    cy.contains('button', 'Set raw mask').click();
    cy.get('[data-testid="mask-main"] input').should('have.value', '98-76');
    cy.get('[data-testid="mask-value"]').should('have.text', '98-76');
    cy.get('[data-testid="mask-events"]').should('contain.text', 'update:98-76|complete:98-76');
    cy.contains('button', 'Reset mask').click();
    cy.get('[data-testid="mask-main"] input').should('have.value', '');
    cy.contains('button', 'Focus mask').click();
    cy.get('[data-testid="mask-main"] input').should('be.focused').and('have.value', '__-__');
    cy.contains('button', 'Blur mask').click();
    cy.get('[data-testid="mask-main"] input').should('not.be.focused').and('have.value', '');
  });

  it('restores the same caret after rejecting a character inside an IPv4 value', () => {
    const input = () => cy.get<HTMLInputElement>('[data-testid="mask-ipv4"] input');
    input().type('192.168.1.1').should('have.value', '192.168.1.1');
    input().then(([$input]) => {
      $input.setSelectionRange(1, 1);
      $input.dispatchEvent(new Event('select', { bubbles: true }));
    });
    input().type('x').should('have.value', '192.168.1.1');
    input().should('be.focused').and('have.prop', 'selectionStart', 1);
    input().should('have.prop', 'selectionEnd', 1);
  });

  it('forwards disabled, readonly and error to the native Input while preserving its value', () => {
    const root = '[data-testid="mask-ipv4"]';
    const input = () => cy.get(`${root} input`);
    const state = () => cy.get('select[aria-label="Mask input state"]');
    input().type('127.0.0.1');
    state().select('disabled');
    input().should('be.disabled').and('have.value', '127.0.0.1');
    cy.get(root).should('have.class', 'sd-input-disabled');
    state().select('readonly');
    input().should('be.enabled').and('have.attr', 'readonly');
    input().should('have.value', '127.0.0.1');
    state().select('error');
    input().should('not.have.attr', 'readonly');
    input().should('have.attr', 'aria-invalid', 'true');
    cy.get(root).should('have.class', 'sd-input-error');
    input().should('have.value', '127.0.0.1');
  });

  it('switches InputMask presets, preserves native overrides and handles array literals', () => {
    cy.get('[data-testid="mask-preset"] input')
      .type('20261107')
      .should('have.value', '2026-11-07')
      .and('have.attr', 'inputmode', 'numeric');
    cy.contains('button', 'Change mask preset').click();
    cy.get('[data-testid="mask-preset"] input')
      .clear()
      .type('name@example.com')
      .should('have.value', 'name@example.com')
      .and('have.attr', 'inputmode', 'email');
    cy.contains('button', 'Change mask preset').click();
    cy.get('[data-testid="mask-preset"] input').should('not.have.attr', 'inputmode');
    cy.get('[data-testid="mask-preset"] input').should('not.have.attr', 'data-mask-preset');
    cy.get('[data-testid="mask-array"] input').type('12').should('have.value', '+86 12');
    cy.get('[data-testid="mask-native"] input').should('have.attr', 'inputmode', 'tel');
    cy.get('[data-testid="mask-placeholder"] input').should('have.value', '😀😀');
  });

  it('respects InputMask callback rejection and keeps a usable cursor after remount', () => {
    cy.get('[data-testid="mask-reject"] input').type('12').should('have.value', '1_');
    cy.get('[data-testid="mask-events"]')
      .should('contain.text', 'reject-update:1')
      .and('not.contain.text', 'reject-update:12')
      .and('not.contain.text', 'reject-complete:12');
    cy.get('[data-testid="mask-reject"] input').type('3').should('have.value', '13');
    cy.get('[data-testid="mask-events"]').should('contain.text', 'reject-complete:13');
    cy.contains('button', 'Toggle mask mount').click();
    cy.contains('button', 'Toggle mask mount').click();
    cy.get('[data-testid="mask-main"] input').focus().type('34').should('have.value', '12-34');
    cy.get<HTMLInputElement>('[data-testid="mask-main"] input')
      .then(($input) => {
        $input[0].setSelectionRange(1, 2);
        $input[0].dispatchEvent(new Event('select', { bubbles: true }));
      })
      .type('9')
      .should('have.value', '19-34');
  });

  it('emits completion once with the value supplied by the edit callback', () => {
    const input = () => cy.get('[data-testid="mask-supply"] input');
    input().type('1').should('have.value', '12').and('have.prop', 'selectionStart', 2);
    input().blur().focus().should('have.value', '12');
    cy.get('[data-testid="mask-events"]').should(
      'have.text',
      'initial:12|supplied-update:12|supplied-complete:12',
    );
  });

  it('removes an emptied fixed mask on blur after deleting with the keyboard', () => {
    const input = () => cy.get('[data-testid="mask-main"] input');
    cy.contains('button', 'Set raw mask').click();
    input().should('have.value', '98-76').type('{selectall}{backspace}');
    cy.get('[data-testid="mask-value"]').should('be.empty');
    cy.get('[data-testid="mask-main"] .sd-input-clear-btn').should('not.exist');
    input().blur().should('have.value', '');
    input().focus().should('have.value', '__-__').type('56');
    input().should('have.value', '56-__');
  });

  it('deletes editable digits on both sides of a separator and restores the caret', () => {
    const input = () => cy.get<HTMLInputElement>('[data-testid="mask-date"] input');
    input().type('2026').should('have.prop', 'selectionStart', 5);
    input().type('{backspace}').should('have.value', '202_-__-__');
    input().should('have.prop', 'selectionStart', 3);
    input()
      .type('60806')
      .should('have.value', '2026-08-06')
      .then(($input) => {
        $input[0].setSelectionRange(4, 4);
        $input[0].dispatchEvent(new Event('select', { bubbles: true }));
      });
    input().type('{del}').should('have.value', '2026-80-6_');
    input().should('have.prop', 'selectionStart', 5);
  });

  it('normalizes raw and formatted paste inputs and reports completion only once', () => {
    const input = () => cy.get<HTMLInputElement>('[data-testid="mask-date"] input');
    input().focus();
    for (const value of ['20260806', '2026-08-06', '2x0-2/6 0806']) {
      input().then(([$input]) => {
        $input.value = value;
        $input.dispatchEvent(
          new InputEvent('input', { bubbles: true, inputType: 'insertFromPaste', data: value }),
        );
      });
      input().should('have.value', '2026-08-06');
    }
    cy.get('[data-testid="mask-events"]').should(
      'have.text',
      'initial:12|date-complete:2026-08-06',
    );
  });
});

describe('React InputMask preset typing', () => {
  for (const [preset, value, expected] of inputMaskPresetCases) {
    it(`formats ${preset} through the native input and publishes the normalized model`, () => {
      cy.visit(`/input-mask.html?preset=${preset}`);
      cy.get('[data-testid="mask-preset"] input').type(value).blur().should('have.value', expected);
      cy.get('[data-testid="mask-events"]')
        .invoke('text')
        .should((events) => {
          expect(events.split('|').at(-1)).to.equal(`preset-update:${expected}`);
        });
    });
  }
});
