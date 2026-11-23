import InputMask from '../index';

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

  it('clears the preceding digit when backspacing a separator in the DOM', () => {
    cy.mount(InputMask, { props: { mask: '9999-99-99', maskChar: '_' } });
    // Typing 2026 leaves the cursor right after the auto-inserted '-' (offset 5),
    // so the next backspace hits the literal and should clear the preceding '6'
    // rather than restoring the literal (the old no-op behavior).
    cy.get('input')
      .type('2026')
      .then(($input) => {
        expect(($input[0] as HTMLInputElement).selectionStart).to.equal(5);
      });
    cy.get('input').type('{backspace}');
    cy.get('input').should('have.value', '202_-__-__');
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

  it('clears the next editable value when forward-deleting a separator', () => {
    cy.mount(InputMask, { props: { mask: '9999-99-99' } });
    cy.get('input')
      .type('2026-08-06')
      .then(($input) => {
        const el = $input[0] as HTMLInputElement;
        el.setSelectionRange(4, 4);
        // Notify the component's selection tracker synchronously so the
        // following {del} resolves against the new cursor, not a stale one.
        el.dispatchEvent(new Event('select'));
      })
      .type('{del}')
      .should('have.value', '2026-80-6_');
  });

  it('treats deleting an empty placeholder as a no-op', () => {
    cy.mount(InputMask, { props: { mask: '9999-99-99' } });
    // After typing 2026 the cursor sits at offset 5, right before an empty '_'.
    cy.get('input').type('2026{del}').should('have.value', '2026-__-__');
  });

  it('shows the mask template on focus and hides it on blur when empty', () => {
    cy.mount(InputMask, { props: { mask: '9999-99-99' } });

    cy.get('input')
      .should('have.value', '')
      .focus()
      .should('have.value', '____-__-__')
      .blur()
      .should('have.value', '');

    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('focus')).to.have.length(1);
      expect(wrapper.emitted('blur')).to.have.length(1);
    });
  });

  it('formats raw digits pasted into the input and filters invalid paste content', () => {
    cy.mount(InputMask, { props: { mask: '9999-99-99', maskChar: null } });
    const paste = ($input: JQuery<HTMLInputElement>, text: string) => {
      const el = $input[0] as HTMLInputElement;
      el.value = text;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    };

    cy.get('input').then(($input) => paste($input, '20260806'));
    cy.get('input').should('have.value', '2026-08-06');

    // Pasting an already masked string is idempotent.
    cy.get('input').then(($input) => paste($input, '2026-08-06'));
    cy.get('input').should('have.value', '2026-08-06');

    // Junk characters are stripped and the rest re-packed.
    cy.get('input').then(($input) => paste($input, '2x0-2/6 0806'));
    cy.get('input').should('have.value', '2026-08-06');

    cy.get('@vue').should(({ wrapper }) => {
      // complete fired exactly once even across repeated commits.
      expect(wrapper.emitted('complete')).to.deep.equal([['2026-08-06']]);
      const emitted = wrapper.emitted('update:modelValue');
      const last = emitted?.[emitted.length - 1]?.[0];
      expect(last).to.equal('2026-08-06');
    });
  });

  it('derives the placeholder from the preset and lets the prop override it', () => {
    cy.mount(InputMask, { props: { preset: 'date' } });
    cy.get('input').should('have.attr', 'placeholder', 'YYYY-MM-DD');

    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ placeholder: 'Birth date' })));
    cy.get('input').should('have.attr', 'placeholder', 'Birth date');
  });

  it('sets inputmode and data-mask-preset from the preset, overridable via inputAttrs', () => {
    cy.mount(InputMask, { props: { preset: 'ipv4' } });
    cy.get('input')
      .should('have.attr', 'inputmode', 'decimal')
      .and('have.attr', 'data-mask-preset', 'ipv4');

    cy.get('@vue').then(({ wrapper }) =>
      cy.wrap(wrapper.setProps({ inputAttrs: { inputmode: 'tel' } })),
    );
    cy.get('input').should('have.attr', 'inputmode', 'tel');
  });

  it('transforms the committed value through beforeMaskedValueChange', () => {
    cy.mount(InputMask, {
      props: {
        mask: 'aaa',
        maskChar: null,
        beforeMaskedValueChange: (next) => ({ ...next, value: next.value.toUpperCase() }),
      },
    });

    cy.get('input').type('abc').should('have.value', 'ABC');
    cy.get('@vue').should(({ wrapper }) => {
      const emitted = wrapper.emitted('update:modelValue');
      const last = emitted?.[emitted.length - 1]?.[0];
      expect(last).to.equal('ABC');
    });
  });

  it('passes disabled, readonly and error state through to the underlying input', () => {
    cy.mount(InputMask, { props: { mask: '99', maskChar: null, disabled: true } });
    cy.get('input').should('be.disabled');
    cy.get('.sd-input-mask').should('have.class', 'sd-input-disabled');

    cy.get('@vue').then(({ wrapper }) =>
      cy.wrap(wrapper.setProps({ disabled: false, readonly: true })),
    );
    cy.get('input').should('have.attr', 'readonly');

    cy.get('@vue').then(({ wrapper }) =>
      cy.wrap(wrapper.setProps({ readonly: false, error: true })),
    );
    cy.get('.sd-input-mask').should('have.class', 'sd-input-error');
  });

  it('ignores maxLength and showWordLimit when a mask manages the length', () => {
    cy.mount(InputMask, {
      props: { mask: '9999-99-99', maskChar: null, maxLength: 5, showWordLimit: true },
    });
    cy.get('.sd-input-word-limit').should('not.exist');
    cy.get('input').type('20260806').should('have.value', '2026-08-06');
  });

  it('supports custom formatChars tokens', () => {
    cy.mount(InputMask, {
      props: { mask: 'bb', maskChar: null, formatChars: { b: /[01]/ } },
    });
    cy.get('input').type('0119').should('have.value', '01');
  });

  it('truncates a multi-character maskChar to its first grapheme', () => {
    cy.mount(InputMask, {
      props: { mask: '99-99', maskChar: 'xy', alwaysShowMask: true },
    });
    cy.get('input').should('have.value', 'xx-xx').type('12').should('have.value', '12-xx');
  });

  it('echoes the normalized masked value back to v-model when modelValue changes', () => {
    cy.mount(InputMask, { props: { modelValue: '2026', mask: '9999-99-99', maskChar: null } });
    // 掩码模板会带出字面分隔符
    cy.get('input').should('have.value', '2026-');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ modelValue: '20260806' })));
    cy.get('@vue').should(({ wrapper }) => {
      // The watcher re-packs raw digits and echoes the masked form so a parent
      // that passed a raw string stays in sync.
      const emitted = wrapper.emitted('update:modelValue');
      const last = emitted?.[emitted.length - 1]?.[0];
      expect(last).to.equal('2026-08-06');
      expect(wrapper.emitted('complete')).to.deep.equal([['2026-08-06']]);
    });
    cy.get('input').should('have.value', '2026-08-06');
  });

  it('normalizes and groups IBAN input in uppercase', () => {
    cy.mount(InputMask, { props: { preset: 'iban' } });
    cy.get('input')
      .type('gb82west12345698765432')
      .should('have.value', 'GB82 WEST 1234 5698 7654 32');
  });

  it('does not leak maskChar placeholders into update:modelValue', () => {
    // Aligned with react-input-mask: the committed value contains only filled
    // editable characters plus literals, never the '_' placeholder characters
    // (the placeholder-filled form stays a display-only concern).
    cy.mount(InputMask, { props: { mask: '9999-99-99' } });
    cy.get('input').type('2026').should('have.value', '2026-__-__');
    cy.get('@vue').should(({ wrapper }) => {
      const emitted = wrapper.emitted('update:modelValue');
      const last = emitted?.[emitted.length - 1]?.[0];
      expect(last).to.equal('2026-');
    });
    cy.get('input').type('0806').should('have.value', '2026-08-06');
    cy.get('@vue').should(({ wrapper }) => {
      const emitted = wrapper.emitted('update:modelValue');
      const last = emitted?.[emitted.length - 1]?.[0];
      expect(last).to.equal('2026-08-06');
    });
  });

  it('emits complete on mount when the initial modelValue fills the mask', () => {
    cy.mount(InputMask, { props: { modelValue: '2026-08-06', mask: '9999-99-99' } });
    cy.get('input').should('have.value', '2026-08-06');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('complete')).to.deep.equal([['2026-08-06']]);
    });
  });

  it('resets to empty when modelValue becomes undefined', () => {
    cy.mount(InputMask, {
      props: { modelValue: '2026-08-06', mask: '9999-99-99', maskChar: null },
    });
    cy.get('input').should('have.value', '2026-08-06');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ modelValue: undefined })));
    cy.get('input').should('have.value', '');
    cy.get('@vue').should(({ wrapper }) => {
      const emitted = wrapper.emitted('update:modelValue');
      const last = emitted?.[emitted.length - 1]?.[0];
      expect(last).to.equal('');
    });
  });

  it('restores the cursor without drift when a mid-string insertion is rejected', () => {
    // The ipv4 preset normalization strips the 'x'; the restored cursor must sit
    // right after '1' (raw cursor minus the removed character), not drift to 2.
    cy.mount(InputMask, { props: { preset: 'ipv4' } });
    cy.get('input')
      .type('192.168.1.1')
      .then(($input) => {
        const el = $input[0] as HTMLInputElement;
        el.setSelectionRange(1, 1);
        el.dispatchEvent(new Event('select'));
      })
      .type('x')
      .then(($input) => {
        const el = $input[0] as HTMLInputElement;
        expect(el.value).to.equal('192.168.1.1');
        expect(el.selectionStart).to.equal(1);
      });
  });
});
