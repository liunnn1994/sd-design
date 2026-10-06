import { defineComponent, ref } from 'vue';

import Affix from '../index';

describe('Affix content resizing', () => {
  for (const bottom of [false, true]) {
    it(`updates its placeholder when fixed content grows and shrinks, bottom=${bottom}`, () => {
      cy.mount(
        defineComponent({
          components: { Affix },
          setup() {
            return { height: ref(40), bottom };
          },
          template: `
          <button data-test="grow" @click="height = 100">Grow</button>
          <button data-test="shrink" @click="height = 20">Shrink</button>
          <div id="resizing-affix-target" style="height: 200px; overflow: auto; margin-top: 40px">
            <div :style="{ height: bottom ? '250px' : '100px' }" />
            <Affix target="#resizing-affix-target" :offset-top="10" :offset-bottom="bottom ? 10 : undefined">
              <div data-test="content" :style="{ height: height + 'px' }">Content</div>
            </Affix>
            <div data-test="following" style="height: 600px" />
          </div>
        `,
        }),
      );
      if (!bottom) cy.get('#resizing-affix-target').scrollTo(0, 120);
      cy.get('.sd-affix').should('have.css', 'position', 'fixed');
      cy.get('.sd-affix').prev().should('have.css', 'height', '40px');
      cy.get('[data-test="grow"]').click();
      cy.get('[data-test="content"]').should('have.css', 'height', '100px');
      cy.get('.sd-affix').prev().should('have.css', 'height', '100px');
      cy.get('[data-test="shrink"]').click();
      cy.get('.sd-affix').prev().should('have.css', 'height', '20px');
      cy.get('#resizing-affix-target').scrollTo(0, bottom ? 250 : 0);
      cy.get('.sd-affix').should('not.exist');
      cy.get('[data-test="content"]').should('have.css', 'height', '20px');
    });
  }
});
