import { h, ref } from 'vue';

import Image from '../index';

const src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

describe('Image dynamic footer slots', () => {
  for (const initial of [false, true]) {
    it(`updates the footer when extra starts ${initial ? 'present' : 'absent'}`, () => {
      const extra = ref(initial);
      cy.mount({
        setup: () => () =>
          h(Image, { src }, extra.value ? { extra: () => h('span', 'Details') } : {}),
      });
      cy.get('.sd-image-overlay').should('not.exist');
      cy.get('.sd-image-footer').should(initial ? 'exist' : 'not.exist');
      cy.then(() => {
        extra.value = !initial;
      });
      cy.get('.sd-image-footer').should(initial ? 'not.exist' : 'contain.text', 'Details');
      cy.get('.sd-image').should(
        initial ? 'not.have.class' : 'have.class',
        'sd-image-with-footer-inner',
      );
      cy.then(() => {
        extra.value = initial;
      });
      cy.get('.sd-image-footer').should(initial ? 'contain.text' : 'not.exist', 'Details');
    });
  }
});
