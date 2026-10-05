import { defineComponent, h, ref } from 'vue';

import Spin from '../index';

describe('Spin dynamic behavior', () => {
  it('keeps the loading fallback when the icon slot is empty', () => {
    cy.mount(Spin, { props: { dot: true }, slots: { icon: () => [] } });
    cy.get('.sd-dot-loading').should('exist');
  });
  for (const name of ['icon', 'tip', 'default'] as const) {
    it(`updates when the ${name} slot is added and removed`, () => {
      const visible = ref(false);
      cy.mount(
        defineComponent({
          setup: () => () =>
            h(
              Spin,
              { loading: false },
              visible.value ? { [name]: () => h('span', { class: 'dynamic-slot' }, name) } : {},
            ),
        }),
      );
      cy.get('.dynamic-slot').should('not.exist');
      cy.then(() => {
        visible.value = true;
      });
      cy.get('.dynamic-slot').should('exist');
      if (name === 'default') {
        cy.get('.sd-spin-icon').should('not.exist');
        cy.get('.sd-spin').should('not.have.class', 'sd-spin-loading');
      }
      cy.then(() => {
        visible.value = false;
      });
      cy.get('.dynamic-slot').should('not.exist');
      if (name === 'default') cy.get('.sd-spin-icon').should('exist');
    });
  }

  it('applies the delay again after a brief idle interval', () => {
    cy.clock();
    cy.mount(Spin, { props: { loading: true, delay: 100 }, slots: { default: () => 'Content' } });
    cy.tick(100);
    cy.get('.sd-spin-mask').should('exist');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ loading: false }));
    cy.get('.sd-spin-mask').should('not.exist');
    cy.tick(10);
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ loading: true }));
    cy.get('.sd-spin-mask').should('not.exist');
    cy.tick(99);
    cy.get('.sd-spin-mask').should('not.exist');
    cy.tick(1);
    cy.get('.sd-spin-mask').should('exist');
  });
});
