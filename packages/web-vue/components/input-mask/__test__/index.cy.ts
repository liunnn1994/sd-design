import InputMask, { inputMaskPresets } from '../index';
import { defaultInputMaskFormatChars, formatInputMask, resolveDeletion } from '../mask-engine';

describe('InputMask', () => {
  it('formats a fixed numeric mask and emits the completed value', () => {
    cy.mount(InputMask, {
      props: { mask: '9999-99-99', maskChar: null },
    });

    cy.get('input').type('20260806').should('have.value', '2026-08-06');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).to.equal('2026-08-06');
      expect(wrapper.emitted('complete')).to.deep.equal([['2026-08-06']]);
    });
  });

  it('shows the default placeholder character only when requested', () => {
    cy.mount(InputMask, {
      props: { mask: '99/99', alwaysShowMask: true },
    });

    cy.get('input').should('have.value', '__/__').type('12').should('have.value', '12/__');
  });

  it('supports built-in Chinese and English mask tokens', () => {
    cy.mount(InputMask, {
      props: { mask: 'HH-aa-999', maskChar: null },
    });

    cy.get('input').type('中文ab123').should('have.value', '中文-ab-123');
  });

  it('supports RegExp tokens in an array mask', () => {
    cy.mount(InputMask, {
      props: {
        mask: [/\p{Script=Han}/u, /[A-Z]/, '-', /\d/, /\d/] as const,
        maskChar: null,
      },
    });

    cy.get('input').type('数A12').should('have.value', '数A-12');
  });

  it('accepts variable-length Semantic Versioning syntax', () => {
    cy.mount(InputMask, { props: { preset: 'semver' } });

    cy.get('input')
      .type('1.2.3-beta.1+build.7', { parseSpecialCharSequences: false })
      .should('have.value', '1.2.3-beta.1+build.7');
  });

  it('rejects input that cannot continue the selected preset', () => {
    cy.mount(InputMask, { props: { preset: 'ipv4' } });

    cy.get('input').type('999').should('have.value', '99');
  });

  it('keeps URL path, query and fragment characters', () => {
    cy.mount(InputMask, { props: { preset: 'url' } });

    cy.get('input')
      .type('https://example.com/a?q=中文#top', { parseSpecialCharSequences: false })
      .should('have.value', 'https://example.com/a?q=#top');
  });

  it('rejects non-URL Chinese text from the URL preset', () => {
    cy.mount(InputMask, { props: { preset: 'url' } });

    cy.get('input').type('阿斯顿').should('have.value', '');
  });

  it('inherits Input clear behavior and slots', () => {
    cy.mount(InputMask, {
      props: { defaultValue: '1.2.3', preset: 'semver', allowClear: true },
      slots: { prefix: 'v' },
    });

    cy.get('.sd-input-prefix').should('contain.text', 'v');
    cy.get('.sd-input-clear-btn').click({ force: true });
    cy.get('input').should('have.value', '');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('clear')).to.have.length(1);
      expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).to.equal('');
    });
  });

  it('exposes only mask-useful validator formats as presets', () => {
    expect(inputMaskPresets).to.have.property('ip');
    expect(inputMaskPresets).to.have.property('url');
    expect(inputMaskPresets).to.have.property('semver');
    expect(inputMaskPresets).not.to.have.property('md5');
    expect(inputMaskPresets).not.to.have.property('port');
  });

  it('deletes the adjacent editable value when backspacing a separator', () => {
    // mask 9999-99-99, focused value 2026-__-__, cursor right after the '-' (offset 5).
    // Backspace removes the literal '-'; resolveDeletion should clear the preceding
    // '6' instead of restoring the literal (the old no-op behavior).
    const result = resolveDeletion(
      '2026-__-__',
      { start: 5, end: 5 },
      '2026__-__',
      4,
      '9999-99-99',
      defaultInputMaskFormatChars,
      '_',
    );
    expect(result).to.not.equal(null);
    expect(result?.value).to.equal('202_-__-__');
    expect(result?.cursor).to.equal(3);
  });

  it('clears the preceding digit when backspacing a separator in the DOM', () => {
    cy.mount(InputMask, { props: { mask: '9999-99-99', maskChar: '_' } });
    // Typing 2026 leaves the cursor right after the auto-inserted '-' (offset 5),
    // so the next backspace hits the literal and should clear the preceding '6'
    // rather than restoring the literal (the old no-op behavior).
    cy.get('input').type('2026{backspace}');
    cy.get('input').should('have.value', '202_-__-__');
  });

  it('treats combining sequences and astral characters as single graphemes', () => {
    // é = e + combining acute accent: one grapheme, two code points. The old
    // code-point iteration would drop the accent and keep only 'e'.
    const combining = formatInputMask('é', 2, 'L', { maskChar: null, showMask: true });
    expect(combining.value).to.equal('é');

    // 𠀀 (CJK Extension B) is one grapheme but two UTF-16 code units. Cursor
    // math must not split the surrogate pair.
    const astral = formatInputMask('𠀀', 2, 'H', { maskChar: null, showMask: true });
    expect(astral.value).to.equal('𠀀');
    expect(astral.complete).to.equal(true);
  });

  it('propagates the re-normalized value when the mask changes', () => {
    cy.mount(InputMask, {
      props: { modelValue: '2026-08-06', mask: '9999-99-99', maskChar: null },
    });
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ mask: '99/99/99' })));
    cy.get('@vue').should(({ wrapper }) => {
      // The mask switch re-packs the 8 digits into 6 slots and emits the result,
      // keeping v-model in sync instead of silently keeping the old value.
      expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).to.equal('20/26/08');
    });
  });

  it('treats a null modelValue as empty without throwing', () => {
    cy.mount(InputMask, {
      props: { modelValue: null as unknown as string, mask: '9999-99-99', maskChar: null },
    });
    cy.get('input').should('have.value', '');
  });

  it('enforces rgb() / hsl() structure instead of a bare character whitelist', () => {
    const rgb = inputMaskPresets['rgb-color'];
    expect(rgb.accepts?.('rgb(22, 119, 255)')).to.equal(true);
    expect(rgb.accepts?.('rgba(22, 119, 255, 0.5)')).to.equal(true);
    expect(rgb.accepts?.('xyz')).to.equal(false);
    expect(rgb.accepts?.('22, 119, 255')).to.equal(false);

    const hsl = inputMaskPresets['hsl'];
    expect(hsl.accepts?.('hsl(210, 100%, 50%)')).to.equal(true);
    expect(hsl.accepts?.('hsla(210, 100%, 50%, 0.5)')).to.equal(true);
    expect(hsl.accepts?.('210 100 50')).to.equal(false);
  });

  it('differentiates datetime (space separator) from rfc3339 (T only)', () => {
    const datetime = inputMaskPresets['datetime'];
    const rfc3339 = inputMaskPresets['rfc3339'];
    expect(datetime.accepts?.('2026-08-06 10:30:00')).to.equal(true);
    expect(rfc3339.accepts?.('2026-08-06 10:30:00')).to.equal(false);
    expect(rfc3339.accepts?.('2026-08-06T10:30:00')).to.equal(true);
  });

  it('inserts datetime and RFC 3339 separators while typing digits', () => {
    cy.mount(InputMask, { props: { preset: 'datetime', maskChar: null } });
    cy.get('input').type('20260806103000').should('have.value', '2026-08-06 10:30:00');

    cy.mount(InputMask, { props: { preset: 'rfc3339', maskChar: null } });
    cy.get('input').type('20260806103000').should('have.value', '2026-08-06T10:30:00');
  });

  it('limits IPv6 input to four hexadecimal characters per segment', () => {
    cy.mount(InputMask, { props: { preset: 'ip' } });
    cy.get('input').type('11111111111111111111111111111111').should('have.value', '1111');

    cy.mount(InputMask, { props: { preset: 'ipv6' } });
    cy.get('input')
      .type('11111111111111111111111111111111')
      .should('have.value', '1111')
      .clear()
      .type('2001:db8::1')
      .should('have.value', '2001:db8::1');
  });

  it('enforces ip-range structure with a bounded prefix', () => {
    const ipRange = inputMaskPresets['ip-range'];
    expect(ipRange.accepts?.('192.168.1.0/24')).to.equal(true);
    expect(ipRange.accepts?.('192.168.1.0')).to.equal(true);
    expect(ipRange.accepts?.('192.168.1.0/33')).to.equal(false);
    expect(ipRange.accepts?.('192.168.1.0/abc')).to.equal(false);
  });
});
