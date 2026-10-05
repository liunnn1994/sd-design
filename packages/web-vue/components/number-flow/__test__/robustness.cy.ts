import { defineComponent, h, ref } from 'vue';

import NumberFlow from '../index';

describe('NumberFlow robustness', () => {
  for (const name of ['prefix', 'suffix'] as const) {
    for (const initial of [false, true]) {
      it(`updates ${name} precedence when its slot starts ${initial ? 'present' : 'absent'}`, () => {
        const enabled = ref(initial);
        cy.mount(
          defineComponent({
            setup: () => () =>
              h(
                NumberFlow,
                { value: 42, [name]: 'Prop', animated: false },
                enabled.value ? { [name]: () => h('span', 'Slot') } : {},
              ),
          }),
        );
        cy.get('.sd-number-flow-content').should(
          initial ? 'not.contain.text' : 'contain.text',
          'Prop',
        );
        cy.then(() => {
          enabled.value = !initial;
        });
        cy.get('.sd-number-flow-content').should(
          initial ? 'contain.text' : 'not.contain.text',
          'Prop',
        );
        cy.get('.sd-number-flow').should(
          'have.attr',
          'aria-label',
          !initial ? '42' : name === 'prefix' ? 'Prop42' : '42Prop',
        );
      });
    }
  }

  it('reads the current motion preference when respectMotionPreference is reenabled', () => {
    const query = { matches: true, addEventListener: cy.stub(), removeEventListener: cy.stub() };
    cy.stub(window, 'matchMedia').returns(query as unknown as MediaQueryList);
    cy.mount(NumberFlow, { props: { value: 1, respectMotionPreference: false } });
    cy.get('.sd-number-flow-animated').should('exist');
    cy.then(() => {
      query.matches = false;
    });
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ respectMotionPreference: true }));
    cy.get('.sd-number-flow-animated').should('exist');
  });
});
