import Textarea from '../index';

describe('Textarea grapheme input boundaries', () => {
  for (const composition of [false, true]) {
    it(`allows another grapheme after an emoji with composition=${composition}`, () => {
      cy.mount(Textarea, { props: { defaultValue: '😀', maxLength: 2 } });
      cy.get('textarea').then(($textarea) => {
        const element = $textarea[0] as HTMLTextAreaElement;
        if (composition)
          element.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
        element.value = '😀ab';
        element.dispatchEvent(
          composition
            ? new CompositionEvent('compositionend', { bubbles: true })
            : new InputEvent('input', { bubbles: true, inputType: 'insertText' }),
        );
      });
      cy.get('textarea').should('have.value', '😀a');
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('input')?.[0][0]).to.equal('😀a');
        expect(wrapper.emitted('update:modelValue')?.[0][0]).to.equal('😀a');
      });
    });
  }

  for (const composition of [false, true]) {
    it(`emits the truncated value with composition=${composition}`, () => {
      cy.mount(Textarea, { props: { maxLength: 2 } });
      cy.get('textarea').then(($textarea) => {
        const element = $textarea[0] as HTMLTextAreaElement;
        if (composition)
          element.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
        element.value = 'abc';
        element.dispatchEvent(
          composition
            ? new CompositionEvent('compositionend', { bubbles: true })
            : new InputEvent('input', { bubbles: true, inputType: 'insertFromPaste' }),
        );
      });
      cy.get('textarea').should('have.value', 'ab');
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('input')?.[0][0]).to.equal('ab');
        expect(wrapper.emitted('update:modelValue')?.[0][0]).to.equal('ab');
      });
    });
  }
});
