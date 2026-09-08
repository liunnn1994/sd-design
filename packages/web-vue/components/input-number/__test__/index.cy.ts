import type { InputNumberInstance, InputNumberValue } from '../index';

import { getFitWidthCssVar } from '../../_hooks/use-fit-width';
import InputNumber from '../index';

const fitWidthCssVar = getFitWidthCssVar('sd');

describe('InputNumber', () => {
  it('increments on step button press', () => {
    cy.mount(InputNumber);
    cy.get('button').first().trigger('mousedown').trigger('mouseup');
    cy.get('button').first().trigger('mousedown').trigger('mouseup');
    cy.get('input').should('have.value', '1');
  });

  it('clamps to min/max on blur', () => {
    cy.mount(InputNumber, { props: { min: 0, max: 10 } });
    cy.get('input').clear().type('-2').blur();
    cy.get('input').should('have.value', '0');
    cy.get('input').clear().type('20').blur();
    cy.get('input').should('have.value', '10');
  });

  it('keeps a string model value type on step and clear', () => {
    cy.mount(InputNumber, { props: { modelValue: '2', allowClear: true } });
    cy.get('button').first().trigger('mousedown').trigger('mouseup');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')?.[0]).to.deep.equal(['3']);
    });
    cy.get('input').clear().blur();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')?.at(-1)).to.deep.equal(['']);
    });
  });

  it('exposes spinbutton role and labels the step buttons', () => {
    cy.mount(InputNumber, { props: { min: 0, max: 10 } });
    cy.get('input').should('have.attr', 'role', 'spinbutton');
    cy.get('input').should('have.attr', 'aria-valuemin', '0');
    cy.get('input').should('have.attr', 'aria-valuemax', '10');
    cy.get('.sd-input-number-step-button').eq(0).should('have.attr', 'aria-label', '增加');
    cy.get('.sd-input-number-step-button').eq(1).should('have.attr', 'aria-label', '减少');
  });

  it('uses the two-zero fallback in fit width mode', () => {
    cy.mount(InputNumber, { props: { fitWidth: true } });
    cy.get('.sd-input-wrapper').should(($root) => {
      expect($root[0].style.getPropertyValue(fitWidthCssVar)).to.equal('2ch');
    });
  });

  it('steps from empty value to min when min is set', () => {
    cy.mount(InputNumber, { props: { min: 5, max: 20 } });
    cy.get('button').first().trigger('mousedown').trigger('mouseup');
    cy.get('input').should('have.value', '5');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')?.at(-1)).to.deep.equal([5]);
    });
  });

  it('disables the step buttons at the boundary and steps back down', () => {
    cy.mount(InputNumber, { props: { modelValue: 10, min: 0, max: 10 } });
    cy.get('.sd-input-number-step-button').eq(0).should('have.attr', 'disabled');
    cy.get('.sd-input-number-step-button').eq(1).should('not.have.attr', 'disabled');
    cy.get('.sd-input-number-step-button').eq(1).trigger('mousedown').trigger('mouseup');
    cy.get('input').should('have.value', '9');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')?.at(-1)).to.deep.equal([9]);
    });
  });

  it('disables the decrease button at min', () => {
    cy.mount(InputNumber, { props: { modelValue: 0, min: 0, max: 10 } });
    cy.get('.sd-input-number-step-button').eq(1).should('have.attr', 'disabled');
    cy.get('.sd-input-number-step-button').eq(0).should('not.have.attr', 'disabled');
  });

  it('does not step when disabled', () => {
    cy.mount(InputNumber, { props: { modelValue: 5, disabled: true } });
    cy.get('.sd-input-number-step-button').eq(0).should('have.attr', 'disabled');
    cy.get('.sd-input-number-step-button')
      .eq(0)
      .trigger('mousedown', { force: true })
      .trigger('mouseup', { force: true });
    cy.get('input').should('have.value', '5');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')).to.equal(undefined);
      expect(wrapper.emitted('change')).to.equal(undefined);
    });
  });

  it('steps with keyboard arrow keys and stops at max', () => {
    cy.mount(InputNumber, { props: { modelValue: 9, max: 10 } });
    cy.get('input').type('{upArrow}{upArrow}');
    cy.get('input').should('have.value', '10');
    cy.get('input').should('have.attr', 'aria-valuenow', '10');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.have.length(1);
      expect(wrapper.emitted('keydown')).to.have.length(2);
    });
  });

  it('steps down with the arrow down key', () => {
    cy.mount(InputNumber, { props: { modelValue: 5, min: 0, max: 10 } });
    cy.get('input').type('{downArrow}{downArrow}');
    cy.get('input').should('have.value', '3');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')?.at(-1)).to.deep.equal([3]);
    });
  });

  it('does not step with arrow keys when readonly', () => {
    cy.mount(InputNumber, { props: { modelValue: 5, readonly: true } });
    cy.get('input').trigger('keydown', { key: 'ArrowUp' });
    cy.get('input').should('have.value', '5');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.equal(undefined);
    });
  });

  it('avoids floating point drift with a decimal step', () => {
    cy.mount(InputNumber, { props: { step: 0.1 } });
    cy.get('button')
      .first()
      .trigger('mousedown')
      .trigger('mouseup')
      .trigger('mousedown')
      .trigger('mouseup')
      .trigger('mousedown')
      .trigger('mouseup')
      .trigger('mousedown')
      .trigger('mouseup');
    cy.get('input').should('have.value', '0.3');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')?.at(-1)).to.deep.equal([0.3]);
    });
  });

  it('applies precision to typed values on blur', () => {
    cy.mount(InputNumber, { props: { precision: 2 } });
    cy.get('input').type('3.14159').blur();
    cy.get('input').should('have.value', '3.14');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')?.at(-1)).to.deep.equal([3.14]);
    });
  });

  it('extends precision with the decimal digits of the step', () => {
    cy.mount(InputNumber, { props: { precision: 1, step: 0.01 } });
    cy.get('button').first().trigger('mousedown').trigger('mouseup');
    cy.get('input').should('have.value', '0.00');
    cy.get('button').first().trigger('mousedown').trigger('mouseup');
    cy.get('input').should('have.value', '0.01');
  });

  it('emits change and update:modelValue on blur', () => {
    cy.mount(InputNumber, { props: { min: 0, max: 10 } });
    cy.get('input').type('3').blur();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')?.at(-1)).to.deep.equal([3]);
      const change = wrapper.emitted('change')?.at(-1);
      expect(change?.[0]).to.equal(3);
    });
  });

  it('discards non-numeric typed text and emits no input events', () => {
    cy.mount(InputNumber);
    cy.get('input').type('abc').blur();
    cy.get('input').should('have.value', '');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('input')).to.equal(undefined);
      expect(wrapper.emitted('update:modelValue')).to.equal(undefined);
      expect(wrapper.emitted('change')).to.equal(undefined);
    });
  });

  it('restores the previous value when non-numeric text is typed into a filled input', () => {
    cy.mount(InputNumber, { props: { modelValue: 12 } });
    cy.get('input').should('have.value', '12');
    cy.get('input').type('x');
    cy.get('input').should('have.value', '12');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')).to.equal(undefined);
    });
  });

  it('rejects Infinity typed or pasted into the input', () => {
    cy.mount(InputNumber);
    cy.get('input').then(($input) => {
      const el = $input[0] as HTMLInputElement;
      el.value = 'Infinity';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    cy.get('input').should('have.value', '');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('input')).to.equal(undefined);
      expect(wrapper.emitted('update:modelValue')).to.equal(undefined);
    });
  });

  it('treats an Infinity model value as empty', () => {
    cy.mount(InputNumber, { props: { modelValue: Number.POSITIVE_INFINITY } });
    cy.get('input').should('have.value', '');
  });

  it('stringMode emits string values and preserves high-precision decimals', () => {
    cy.mount(InputNumber, { props: { stringMode: true } });
    cy.get('input').type('9007199254740993').blur();
    cy.get('input').should('have.value', '9007199254740993');
    cy.get('@vue').should(({ wrapper }) => {
      const emitted = wrapper.emitted('update:modelValue');
      const last = emitted?.[emitted.length - 1]?.[0];
      expect(last).to.equal('9007199254740993');
      const change = wrapper.emitted('change');
      const lastChange = change?.[change.length - 1]?.[0];
      expect(lastChange).to.equal('9007199254740993');
    });
  });

  it('stringMode preserves trailing decimals exactly', () => {
    cy.mount(InputNumber, { props: { stringMode: true } });
    cy.get('input').type('5.10').blur();
    cy.get('input').should('have.value', '5.10');
    cy.get('@vue').should(({ wrapper }) => {
      const emitted = wrapper.emitted('update:modelValue');
      const last = emitted?.[emitted.length - 1]?.[0];
      expect(last).to.equal('5.10');
    });
  });

  it('stringMode emits string values for step and clear', () => {
    cy.mount(InputNumber, { props: { stringMode: true, allowClear: true } });
    cy.get('button').first().trigger('mousedown').trigger('mouseup');
    cy.get('button').first().trigger('mousedown').trigger('mouseup');
    cy.get('input').should('have.value', '1');
    cy.get('@vue').should(({ wrapper }) => {
      const emitted = wrapper.emitted('update:modelValue');
      const last = emitted?.[emitted.length - 1]?.[0];
      expect(last).to.equal('1');
    });
    cy.get('input').clear().blur();
    cy.get('@vue').should(({ wrapper }) => {
      const emitted = wrapper.emitted('update:modelValue');
      const last = emitted?.[emitted.length - 1]?.[0];
      expect(last).to.equal('');
    });
  });

  it('emits update:modelValue and change live when modelEvent is input', () => {
    cy.mount(InputNumber, { props: { modelEvent: 'input' } });
    cy.get('input').type('5');
    cy.get('input').should('have.value', '5');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('input')).to.have.length(1);
      expect(wrapper.emitted('update:modelValue')?.at(-1)).to.deep.equal([5]);
      expect(wrapper.emitted('change')?.at(-1)?.[0]).to.equal(5);
    });
  });

  it('formats display values and parses typed text with formatter and parser', () => {
    const formatter = (value: InputNumberValue) => `${value}$`;
    const parser = (value: string) => value.replace(/\$/g, '');
    cy.mount(InputNumber, { props: { formatter, parser } });
    cy.get('input').type('4');
    cy.get('input').should('have.value', '4$');
    cy.get('button').first().trigger('mousedown').trigger('mouseup');
    cy.get('input').should('have.value', '5$');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')?.at(-1)).to.deep.equal([5]);
    });
  });

  it('emits clear and resets the value via the clear button', () => {
    cy.mount(InputNumber, { props: { modelValue: 5, allowClear: true } });
    cy.get('.sd-input-clear-btn').click({ force: true });
    cy.get('input').should('have.value', '');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('clear')).to.have.length(1);
      expect(wrapper.emitted('update:modelValue')?.at(-1)).to.deep.equal([undefined]);
      expect(wrapper.emitted('change')?.at(-1)?.[0]).to.equal(undefined);
    });
  });

  it('emits focus and blur events', () => {
    cy.mount(InputNumber);
    cy.get('input').focus();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('focus')).to.have.length(1);
    });
    cy.get('input').blur();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('blur')).to.have.length(1);
    });
  });

  it('re-emits native keydown events', () => {
    cy.mount(InputNumber);
    cy.get('input').trigger('keydown', { key: 'Enter' });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('keydown')).to.have.length(1);
      expect(wrapper.emitted('keydown')?.[0]?.[0]).to.have.property('key', 'Enter');
    });
  });

  it('exposes focus and blur methods', () => {
    cy.mount(InputNumber);
    cy.get('@vue').then(({ wrapper }) => (wrapper.vm as InputNumberInstance).focus());
    cy.get('input').should('be.focused');
    cy.get('@vue').then(({ wrapper }) => (wrapper.vm as InputNumberInstance).blur());
    cy.get('input').should('not.be.focused');
  });

  it('applies size, error and placeholder props', () => {
    cy.mount(InputNumber, { props: { size: 'large', error: true, placeholder: '请输入数字' } });
    cy.get('.sd-input-number').should('have.class', 'sd-input-number-size-large');
    cy.get('.sd-input-wrapper').should('have.class', 'sd-input-error');
    cy.get('input').should('have.attr', 'placeholder', '请输入数字');
  });

  it('hides the step buttons when hideButton is set', () => {
    cy.mount(InputNumber, { props: { hideButton: true } });
    cy.get('.sd-input-number-step-button').should('not.exist');
  });

  it('renders prepend/append step buttons in button mode', () => {
    cy.mount(InputNumber, { props: { mode: 'button', defaultValue: 1 } });
    cy.get('.sd-input-number').should('have.class', 'sd-input-number-mode-button');
    cy.get('input').should('have.value', '1');
    cy.get('button').first().trigger('mousedown').trigger('mouseup');
    cy.get('input').should('have.value', '0');
  });

  it('clamps the value when the max prop changes', () => {
    cy.mount(InputNumber, { props: { modelValue: 5, max: 10 } });
    cy.get('input').should('have.value', '5');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ max: 3 })));
    cy.get('input').should('have.value', '3');
    cy.get('.sd-input-number-step-button').eq(0).should('have.attr', 'disabled');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')?.at(-1)).to.deep.equal([3]);
    });
  });
});
