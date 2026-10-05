import { h, ref } from 'vue';

import Sender, { SenderSwitch } from '../index';

describe('Sender model prop bindings', () => {
  it('recognizes a kebab-case controlled text prop', () => {
    cy.mount({ setup: () => () => h(Sender, { 'model-value': 'Bound', 'defaultValue': 'Old' }) });
    cy.get('textarea').should('have.value', 'Bound');
  });

  it('recognizes a kebab-case controlled switch prop', () => {
    cy.mount({ setup: () => () => h(SenderSwitch, { 'model-value': true }) });
    cy.get('.sd-sender-switch').should('have.class', 'sd-sender-switch-checked');
  });

  it('accepts switch changes after its model prop is removed', () => {
    const controlled = ref(true);
    cy.mount({
      setup: () => () =>
        h(SenderSwitch, { defaultValue: false, ...(controlled.value ? { modelValue: true } : {}) }),
    });
    cy.get('.sd-sender-switch').should('have.class', 'sd-sender-switch-checked');
    cy.then(() => {
      controlled.value = false;
    });
    cy.get('.sd-sender-switch button').click();
    cy.get('.sd-sender-switch').should('have.class', 'sd-sender-switch-checked');
  });
});
