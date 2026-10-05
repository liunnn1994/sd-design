import { defineComponent, ref } from 'vue';

import Affix from '../index';

describe('Affix target changes', () => {
  it('recalculates the fixed position when the target changes without another scroll', () => {
    cy.mount(
      defineComponent({
        components: { Affix },
        setup() {
          return { target: ref('#first-affix-target') };
        },
        template: `
          <button data-test="change-target" @click="target = '#second-affix-target'">Change target</button>
          <div id="first-affix-target" style="height: 80px" />
          <div id="second-affix-target" style="height: 80px" />
          <Affix :target="target" :offset-top="10">
            <div style="height: 40px">Content</div>
          </Affix>
        `,
      }),
    );
    cy.get('@vue').then(({ wrapper }) => {
      const affix = wrapper.findComponent(Affix);
      const first = wrapper.get('#first-affix-target').element as HTMLElement;
      const second = wrapper.get('#second-affix-target').element as HTMLElement;
      const rect = (top: number) => ({
        top,
        bottom: top + 80,
        left: 0,
        right: 100,
        width: 100,
        height: 80,
        x: 0,
        y: top,
        toJSON: () => ({}),
      });
      cy.stub(first, 'getBoundingClientRect').returns(rect(100));
      cy.stub(second, 'getBoundingClientRect').returns(rect(200));
      cy.stub(affix.element, 'getBoundingClientRect').returns(rect(0));
      affix.vm.updatePosition();
    });
    cy.get('.sd-affix').should('have.css', 'top', '110px');
    cy.get('[data-test="change-target"]').click();
    cy.get('.sd-affix').should('have.css', 'top', '210px');
  });
});
