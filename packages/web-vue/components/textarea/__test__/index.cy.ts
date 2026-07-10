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
});
