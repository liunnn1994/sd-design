import { h, ref } from 'vue';

import Link from '../index';

describe('Link dynamic slots', () => {
  for (const name of ['default', 'icon']) {
    for (const initial of [false, true]) {
      it(`updates ${name} starting ${initial ? 'present' : 'absent'}`, () => {
        const visible = ref(initial);
        cy.mount({
          setup: () => () =>
            h(
              Link,
              {},
              visible.value ? { [name]: () => h('b', { 'data-slot': name }, 'Content') } : {},
            ),
        });
        cy.get(`[data-slot="${name}"]`).should(initial ? 'exist' : 'not.exist');
        cy.then(() => {
          visible.value = !initial;
        });
        cy.get(`[data-slot="${name}"]`).should(initial ? 'not.exist' : 'exist');
        if (name === 'icon') {
          cy.get('.sd-link').should(initial ? 'not.have.class' : 'have.class', 'sd-link-with-icon');
        } else {
          cy.get('.sd-link-content').should(initial ? 'not.exist' : 'exist');
        }
      });
    }
  }
});
