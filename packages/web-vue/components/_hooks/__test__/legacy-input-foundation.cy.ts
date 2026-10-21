import { defineComponent, h, ref } from 'vue';

import { useInput } from '../use-input';

describe('Legacy useInput foundation adapter', () => {
  it('preserves custom InputLabel emissions, rejected restoration and accepted composition values', () => {
    const events: unknown[][] = [];
    cy.mount(
      defineComponent({
        setup() {
          const model = ref('held'),
            accept = ref(false);
          const api = useInput({
            modelValue: model,
            eventName: 'inputValueChange',
            updateEventName: 'update:inputValue',
            emit: (name, ...args) => {
              events.push([name, typeof args[0] === 'string' ? args[0] : null]);
              if (name === 'update:inputValue' && accept.value) model.value = args[0];
            },
          });
          return () =>
            h('div', [
              h('input', {
                id: 'legacy-native-input',
                ref: api.inputRef,
                value: api.computedValue.value,
                onInput: api.handleInput,
                onCompositionstart: api.handleComposition,
                onCompositionupdate: api.handleComposition,
                onCompositionend: api.handleComposition,
              }),
              h('button', { id: 'legacy-accept', onClick: () => (accept.value = true) }, 'Accept'),
              h('output', { id: 'legacy-composition' }, String(api.isComposition.value)),
            ]);
        },
      }),
    );
    cy.get('#legacy-native-input').type('x').should('have.value', 'held');
    cy.then(() =>
      expect(events.slice(-2)).to.deep.equal([
        ['update:inputValue', 'heldx'],
        ['inputValueChange', 'heldx'],
      ]),
    );
    cy.get('#legacy-accept').click();
    cy.get('#legacy-native-input').trigger('compositionstart', {
      eventConstructor: 'CompositionEvent',
      data: '中',
    });
    cy.get('#legacy-composition').should('have.text', 'true');
    cy.get('#legacy-native-input').invoke('val', '新值').trigger('input');
    cy.then(() => expect(events).to.have.length(2));
    cy.get('#legacy-native-input')
      .trigger('compositionend', { eventConstructor: 'CompositionEvent', data: '值' })
      .should('have.value', '新值');
    cy.get('#legacy-composition').should('have.text', 'false');
    cy.then(() =>
      expect(events.slice(-2)).to.deep.equal([
        ['update:inputValue', '新值'],
        ['inputValueChange', '新值'],
      ]),
    );
  });
  it('retains focus/form/Enter/change/blur ordering without duplicate change', () => {
    const events: string[] = [];
    cy.mount(
      defineComponent({
        setup() {
          const api = useInput({
            defaultValue: ref('seed'),
            emit: (name) => events.push(name),
            eventHandlers: ref({
              onFocus: () => events.push('form-focus'),
              onBlur: () => events.push('form-blur'),
            }),
          });
          return () =>
            h('div', [
              h('input', {
                id: 'legacy-events-input',
                ref: api.inputRef,
                value: api.computedValue.value,
                onInput: api.handleInput,
                onFocus: api.handleFocus,
                onBlur: api.handleBlur,
                onKeydown: api.handleKeyDown,
              }),
              h('button', { id: 'legacy-blur' }, 'Blur'),
            ]);
        },
      }),
    );
    cy.get('#legacy-events-input').focus().type('x{enter}');
    cy.get('#legacy-blur').click();
    cy.then(() => {
      expect(events).to.deep.equal([
        'focus',
        'form-focus',
        'update:modelValue',
        'input',
        'pressEnter',
        'change',
        'blur',
        'form-blur',
      ]);
    });
  });
});
