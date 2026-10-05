import { h, ref } from 'vue';

import InputTag from '../index';

describe('InputTag dynamic adornment slots', () => {
  for (const slot of ['prefix', 'suffix']) {
    for (const initial of [false, true]) {
      it(`updates ${slot} layout when the slot starts ${initial ? 'present' : 'absent'}`, () => {
        const visible = ref(initial);
        cy.mount({
          setup: () => () => h(InputTag, {}, visible.value ? { [slot]: () => 'Addon' } : {}),
        });
        cy.get('.sd-input-tag').should(
          initial ? 'have.class' : 'not.have.class',
          `sd-input-tag-has-${slot}`,
        );
        cy.then(() => {
          visible.value = !initial;
        });
        cy.get(`.sd-input-tag-${slot}`).should(initial ? 'not.exist' : 'have.text', 'Addon');
        cy.get('.sd-input-tag').should(
          initial ? 'not.have.class' : 'have.class',
          `sd-input-tag-has-${slot}`,
        );
      });
    }
  }
});
