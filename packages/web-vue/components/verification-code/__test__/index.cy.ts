import { h } from 'vue';

import VerificationCode from '../index';

describe('VerificationCode', () => {
  it('marks the field group and gives each cell an accessible name', () => {
    cy.mount(VerificationCode, { props: { length: 4 } });
    cy.get('.sd-verification-code').should('have.attr', 'role', 'group');
    cy.get('.sd-verification-code').should('have.attr', 'aria-label', '验证码');
    cy.get('input').eq(0).should('have.attr', 'aria-label', '第 1 个字符,共 4 个');
    cy.get('input').eq(3).should('have.attr', 'aria-label', '第 4 个字符,共 4 个');
  });

  it('renders one cell per length and pads or truncates the initial value', () => {
    cy.mount(VerificationCode, { props: { length: 4, defaultValue: 'abcdef' } });
    cy.get('input').should('have.length', 4);
    cy.get('input').eq(0).should('have.value', 'a');
    cy.get('input').eq(1).should('have.value', 'b');
    cy.get('input').eq(2).should('have.value', 'c');
    cy.get('input').eq(3).should('have.value', 'd');
  });

  it('emits update:modelValue, change and input as characters are typed', () => {
    cy.mount(VerificationCode);
    cy.get('input').eq(0).type('a');
    cy.focused().type('b');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')).to.deep.equal([['a'], ['ab']]);
      expect(wrapper.emitted('change')).to.deep.equal([['a'], ['ab']]);
      const inputs = wrapper.emitted('input') ?? [];
      expect(inputs).to.have.length(2);
      const first = inputs[0] ?? [];
      expect(first[0]).to.equal('a');
      expect(first[1]).to.equal(0);
      expect(first[2] instanceof Event).to.equal(true);
      const second = inputs[1] ?? [];
      expect(second[0]).to.equal('b');
      expect(second[1]).to.equal(1);
    });
  });

  it('emits finish once the code reaches the configured length', () => {
    cy.mount(VerificationCode, { props: { length: 4 } });
    cy.get('input').eq(0).type('a');
    cy.focused().type('b');
    cy.focused().type('c');
    cy.focused().type('d');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('finish')).to.deep.equal([['abcd']]);
    });
  });

  it('moves focus to the first empty cell and pulls it back when an empty cell is clicked', () => {
    cy.mount(VerificationCode, { props: { length: 4 } });
    cy.get('input').eq(0).type('a');
    cy.get('input').eq(1).should('be.focused');
    cy.get('input').eq(3).click();
    cy.get('input').eq(1).should('be.focused');
  });

  it('keeps focus and puts the caret at the end when a filled cell is clicked', () => {
    cy.mount(VerificationCode, { props: { length: 4 } });
    cy.get('input').eq(0).type('a');
    cy.get('input').eq(0).click();
    cy.get('input').eq(0).should('be.focused');
    cy.get('input')
      .eq(0)
      .then(($el) => {
        const el = $el[0] as HTMLInputElement;
        expect(el.selectionStart).to.equal(1);
      });
  });

  it('backspace on an empty cell clears the previous cell and refocuses it', () => {
    cy.mount(VerificationCode, { props: { length: 4 } });
    cy.get('input').eq(0).type('a');
    cy.focused().type('b');
    cy.focused().type('{backspace}');
    cy.get('input').eq(0).should('have.value', 'a');
    cy.get('input').eq(1).should('have.value', '');
    cy.get('input').eq(1).should('be.focused');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.deep.equal([['a'], ['ab'], ['a']]);
    });
  });

  it('arrow keys navigate between cells and never skip an empty cell', () => {
    cy.mount(VerificationCode, { props: { length: 4 } });
    cy.get('input').eq(0).type('a');
    cy.focused().type('b');
    cy.focused().type('{rightarrow}');
    cy.get('input').eq(2).should('be.focused');
    cy.focused().type('{leftarrow}');
    cy.get('input').eq(1).should('be.focused');
    cy.focused().type('{leftarrow}');
    cy.get('input').eq(0).should('be.focused');
    cy.focused().type('{rightarrow}');
    cy.get('input').eq(1).should('be.focused');
  });

  it('paste fills the cells from the target index and emits the joined value', () => {
    cy.mount(VerificationCode, { props: { length: 4 } });
    cy.get('input')
      .eq(0)
      .then(($el) => {
        const input = $el[0] as HTMLInputElement;
        const data = new DataTransfer();
        data.setData('text/plain', '12');
        input.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, clipboardData: data }));
      });
    cy.get('input').eq(0).should('have.value', '1');
    cy.get('input').eq(1).should('have.value', '2');
    cy.get('input').eq(2).should('have.value', '');
    cy.get('input').eq(3).should('have.value', '');
    cy.get('input').eq(2).should('be.focused');
    cy.get('@vue').should(({ wrapper }) => {
      const emissions = wrapper.emitted('update:modelValue') ?? [];
      const last = emissions[emissions.length - 1] ?? [];
      expect(last[0]).to.equal('12');
    });
  });

  it('formatter transforms each stored character', () => {
    cy.mount(VerificationCode, {
      props: {
        length: 4,
        formatter: (value: string) => value.toUpperCase(),
      },
    });
    cy.get('input').eq(0).type('a');
    cy.get('input').eq(0).should('have.value', 'A');
    cy.get('@vue').should(({ wrapper }) => {
      const changes = wrapper.emitted('change') ?? [];
      const last = changes[changes.length - 1] ?? [];
      expect(last[0]).to.equal('A');
    });
  });

  it('formatter can reject characters without emitting a change', () => {
    cy.mount(VerificationCode, { props: { length: 4, formatter: () => false } });
    cy.get('input').eq(0).type('a');
    cy.get('input').eq(0).should('have.value', '');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('input')).to.have.length(1);
      expect(wrapper.emitted('change')).to.equal(undefined);
      expect(wrapper.emitted('update:modelValue')).to.equal(undefined);
    });
  });

  it('renders masked cells as password inputs', () => {
    cy.mount(VerificationCode, { props: { masked: true, defaultValue: 'ab' } });
    cy.get('input').eq(0).should('have.attr', 'type', 'password');
    cy.get('input').eq(1).should('have.attr', 'type', 'password');
  });

  it('renders disabled cells', () => {
    cy.mount(VerificationCode, { props: { disabled: true } });
    cy.get('input').first().should('be.disabled');
  });

  it('renders readonly cells', () => {
    cy.mount(VerificationCode, { props: { readonly: true } });
    cy.get('input').first().should('have.attr', 'readonly');
  });

  it('applies error and size styles to the cells', () => {
    cy.mount(VerificationCode, { props: { error: true, size: 'small' } });
    cy.get('.sd-verification-code .sd-input-error').should('exist');
    cy.get('.sd-verification-code .sd-input-size-small').should('exist');
    cy.get('input').first().should('have.attr', 'aria-invalid', 'true');
  });

  it('renders a separator after every cell, including the last one', () => {
    cy.mount(VerificationCode, {
      props: {
        length: 3,
        separator: (index: number) => h('span', { class: 'vcode-sep' }, `#${index}`),
      },
    });
    cy.get('.vcode-sep').should('have.length', 3);
    cy.get('.vcode-sep').eq(0).should('have.text', '#0');
    cy.get('.vcode-sep').eq(2).should('have.text', '#2');
  });

  it('syncs cells when modelValue changes from outside', () => {
    cy.mount(VerificationCode, { props: { modelValue: 'ab' } });
    cy.get('input').eq(0).should('have.value', 'a');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ modelValue: 'cd' }));
    cy.get('input').eq(0).should('have.value', 'c');
    cy.get('input').eq(1).should('have.value', 'd');
  });

  it('does not persist typed characters when the parent ignores update:modelValue (controlled)', () => {
    cy.mount(VerificationCode, { props: { modelValue: 'ab' } });
    cy.get('input').eq(0).type('9');
    // 受控：prop 未被写回时输入不留存，格子还原为 props 值
    cy.get('input').eq(0).should('have.value', 'a');
    cy.get('input').eq(1).should('have.value', 'b');
    cy.get('@vue').should(({ wrapper }) => {
      const emissions = wrapper.emitted('update:modelValue') ?? [];
      expect(emissions).to.have.length(1);
      const first = emissions[0] ?? [];
      expect(first[0]).to.equal('9b');
    });
  });

  it('takes the last non-space character when a cell value arrives padded (trim fix)', () => {
    cy.mount(VerificationCode, { props: { length: 4 } });
    cy.get('input')
      .eq(0)
      .then(($el) => {
        const input = $el[0] as HTMLInputElement;
        input.value = ' 1';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });
    // 旧实现 value.trim().charAt(value.length-1) 取到空串，格子被清空；应取 '1'
    cy.get('input').eq(0).should('have.value', '1');
    cy.get('@vue').should(({ wrapper }) => {
      const changes = wrapper.emitted('change') ?? [];
      const last = changes[changes.length - 1] ?? [];
      expect(last[0]).to.equal('1');
    });
  });

  it('exposes focus()/blur() targeting the first empty cell and the active cell', () => {
    cy.mount(VerificationCode, { props: { defaultValue: 'ab', length: 4 } });
    cy.get('@vue').then(({ wrapper }) => {
      (wrapper.vm as { focus: () => void }).focus();
      cy.get('input')
        .eq(2)
        .should('be.focused')
        .then(() => {
          (wrapper.vm as { blur: () => void }).blur();
        });
      cy.get('input').eq(2).should('not.be.focused');
    });
  });
});
