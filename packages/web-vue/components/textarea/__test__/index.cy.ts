import Textarea from '../index';

describe('Textarea', () => {
  it('enforces max length, word limit and clear', () => {
    cy.mount(Textarea, { props: { maxLength: 10, allowClear: true, showWordLimit: true } });
    cy.get('textarea').focus();
    cy.get('textarea').type('textarea');
    cy.get('.sd-textarea-word-limit').should('have.text', '8/10');
    cy.get('textarea').clear().type('textareatextarea');
    cy.get('.sd-textarea-word-limit').should('have.text', '10/10');
    cy.get('textarea').should('have.value', 'textareate');
    cy.get('.sd-textarea-clear-btn').click({ force: true });
    cy.get('textarea').should('have.value', '');
  });

  it('updates the model before input event handlers run', () => {
    let modelValue = '';
    let modelValueInInput = '';
    cy.mount(Textarea, {
      props: {
        modelValue,
        'onUpdate:modelValue': (value: string) => {
          modelValue = value;
        },
        'onInput': () => {
          modelValueInInput = modelValue;
        },
      },
    });
    cy.get('textarea').then(($el) => {
      const el = $el[0] as HTMLTextAreaElement;
      el.value = 'textarea';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    cy.then(() => {
      expect(modelValueInInput).to.equal('textarea');
    });
  });

  it('updates the model before input handlers on compositionend', () => {
    let modelValue = '';
    let modelValueInInput = '';
    cy.mount(Textarea, {
      props: {
        modelValue,
        'onUpdate:modelValue': (value: string) => {
          modelValue = value;
        },
        'onInput': () => {
          modelValueInInput = modelValue;
        },
      },
    });
    cy.get('textarea').then(($el) => {
      $el[0].dispatchEvent(new Event('compositionstart'));
      ($el[0] as HTMLTextAreaElement).value = 'textarea';
      $el[0].dispatchEvent(new Event('compositionend'));
    });
    cy.then(() => {
      expect(modelValueInInput).to.equal('textarea');
    });
  });

  it('applies defaultValue and stays uncontrolled without modelValue', () => {
    let updated = '';
    cy.mount(Textarea, {
      props: {
        'defaultValue': 'first',
        'onUpdate:modelValue': (value: string) => {
          updated = value;
        },
      },
    });
    cy.get('textarea').should('have.value', 'first');
    cy.get('textarea').then(($el) => {
      const el = $el[0] as HTMLTextAreaElement;
      el.value = 'first2';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    cy.get('textarea').should('have.value', 'first2');
    cy.then(() => {
      expect(updated).to.equal('first2');
    });
  });

  it('syncs the textarea when modelValue is updated externally', () => {
    cy.mount(Textarea, { props: { modelValue: 'init', maxLength: 20, showWordLimit: true } });
    cy.get('textarea').should('have.value', 'init');
    cy.get('.sd-textarea-word-limit').should('have.text', '4/20');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ modelValue: 'external' })));
    cy.get('textarea').should('have.value', 'external');
    cy.get('.sd-textarea-word-limit').should('have.text', '8/20');
  });

  it('emits focus and blur, and change only once per modified blur', () => {
    const onFocus = cy.spy().as('onFocus');
    const onBlur = cy.spy().as('onBlur');
    const onChange = cy.spy().as('onChange');
    cy.mount(Textarea, { props: { onFocus, onBlur, onChange } });
    cy.get('textarea').type('abc');
    cy.get('textarea').blur();
    cy.get('@onChange').should((spy: any) => {
      expect(spy.callCount).to.equal(1);
      expect(spy.firstCall.args[0]).to.equal('abc');
      expect(spy.firstCall.args[1]).to.be.instanceOf(Event);
    });
    // A second focus/blur cycle without modification does not re-emit change.
    cy.get('textarea').focus().blur();
    cy.get('@onChange').should((spy: any) => {
      expect(spy.callCount).to.equal(1);
    });
    cy.get('@onFocus').should((spy: any) => {
      expect(spy.callCount).to.equal(2);
    });
    cy.get('@onBlur').should((spy: any) => {
      expect(spy.callCount).to.equal(2);
    });
  });

  it('marks the error state without truncating for maxLength errorOnly', () => {
    cy.mount(Textarea, {
      props: { maxLength: { length: 5, errorOnly: true }, showWordLimit: true },
    });
    cy.get('textarea').type('hello world');
    cy.get('textarea').should('have.value', 'hello world');
    cy.get('.sd-textarea-word-limit').should('have.text', '11/5');
    cy.get('.sd-textarea-wrapper').should('have.class', 'sd-textarea-error');
    cy.get('textarea').should('have.attr', 'aria-invalid', 'true');
  });

  it('counts and slices with custom wordLength and wordSlice', () => {
    const byteLength = (value: string) =>
      Array.from(value).reduce((n, c) => n + (c.charCodeAt(0) > 255 ? 2 : 1), 0);
    const byteSlice = (value: string, max: number) => {
      let out = '';
      for (const ch of value) {
        if (byteLength(out + ch) > max) {
          break;
        }
        out += ch;
      }
      return out;
    };
    cy.mount(Textarea, {
      props: {
        maxLength: 4,
        wordLength: byteLength,
        wordSlice: byteSlice,
        showWordLimit: true,
      },
    });
    cy.get('textarea').then(($el) => {
      const el = $el[0] as HTMLTextAreaElement;
      el.value = '好goood';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    cy.get('textarea').should('have.value', '好go');
    cy.get('.sd-textarea-word-limit').should('have.text', '4/4');
  });

  it('clears via keyboard on the clear button and emits clear and change', () => {
    const onClear = cy.spy().as('onClear');
    const onChange = cy.spy().as('onChange');
    cy.mount(Textarea, { props: { defaultValue: 'text', allowClear: true, onClear, onChange } });
    cy.get('textarea').focus();
    cy.get('.sd-textarea-clear-btn').should('be.visible');
    cy.get('.sd-textarea-clear-btn').focus().type('{enter}');
    cy.get('textarea').should('have.value', '');
    cy.get('@onClear').should((spy: any) => {
      expect(spy.callCount).to.equal(1);
    });
    cy.get('@onChange').should((spy: any) => {
      expect(spy.firstCall.args[0]).to.equal('');
    });
    cy.get('.sd-textarea-clear-btn').should('not.exist');
  });

  it('disables editing and hides the clear button when disabled', () => {
    const onUpdate = cy.spy().as('onUpdate');
    cy.mount(Textarea, {
      props: {
        'modelValue': 'text',
        'disabled': true,
        'allowClear': true,
        'onUpdate:modelValue': onUpdate,
      },
    });
    cy.get('.sd-textarea-wrapper').should('have.class', 'sd-textarea-disabled');
    cy.get('textarea').should('be.disabled');
    cy.get('.sd-textarea-clear-btn').should('not.exist');
  });

  it('passes textareaAttrs through to the native textarea', () => {
    cy.mount(Textarea, { props: { textareaAttrs: { name: 'bio', maxLength: 30 } } });
    cy.get('textarea').should('have.attr', 'name', 'bio');
    cy.get('textarea').should('have.attr', 'maxlength', '30');
  });

  it('reacts to native textarea attribute updates', () => {
    cy.mount(Textarea, { attrs: { name: 'summary', required: true } });
    cy.get('textarea').should('have.attr', 'name', 'summary').and('have.attr', 'required');
    cy.get('@vue').then(({ wrapper }) =>
      cy.wrap(wrapper.setProps({ name: 'details', required: false })),
    );
    cy.get('textarea').should('have.attr', 'name', 'details').and('not.have.attr', 'required');
  });
});
