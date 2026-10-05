import { h } from 'vue';

import Radio from '../index';

describe('Radio robustness', () => {
  for (const useOptions of [false, true]) {
    it(`restores the selected controlled radio when an update is declined (${useOptions ? 'options' : 'slots'})`, () => {
      cy.mount(Radio.Group, {
        props: {
          modelValue: 'a',
          ...(useOptions ? { options: ['a', 'b'] } : {}),
        },
        slots: useOptions
          ? {}
          : { default: () => [h(Radio, { value: 'a' }), h(Radio, { value: 'b' })] },
      });
      cy.get('input').eq(0).should('be.checked');
      cy.get('label').eq(1).click();
      cy.get('input').eq(1).should('not.be.checked');
      cy.get('input').eq(0).should('be.checked');
      cy.get('label').eq(1).click();
      cy.get('input').eq(1).should('not.be.checked');
      cy.get('input').eq(0).should('be.checked');
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('update:modelValue')).to.deep.equal([['b'], ['b']]);
      });
    });
  }
});
