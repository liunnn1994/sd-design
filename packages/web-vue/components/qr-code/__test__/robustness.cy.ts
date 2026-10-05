import { h, ref } from 'vue';

import QrCode from '../index';

describe('QrCode robustness', () => {
  for (const initiallyPresent of [false, true]) {
    it(`updates the icon wrapper when a slot is ${initiallyPresent ? 'removed' : 'added'}`, () => {
      const present = ref(initiallyPresent);
      cy.mount(() =>
        h(
          QrCode,
          { value: 'SD' },
          present.value ? { icon: () => h('span', { class: 'qr-slot-icon' }, 'SD') } : {},
        ),
      );
      cy.get('.sd-qr-code-icon').should(initiallyPresent ? 'exist' : 'not.exist');
      cy.then(() => {
        present.value = !initiallyPresent;
      });
      cy.get('.sd-qr-code-icon').should(initiallyPresent ? 'not.exist' : 'exist');
      if (!initiallyPresent) {
        cy.get('.qr-slot-icon').should('have.text', 'SD');
      }
    });
  }
});
