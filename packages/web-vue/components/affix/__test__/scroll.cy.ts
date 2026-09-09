import { defineComponent, ref } from 'vue';

import Affix from '../index';

describe('Affix browser scrolling', () => {
  it('preserves layout, updates offsets and releases when scrolled back', () => {
    cy.mount(
      defineComponent({
        components: { Affix },
        setup() {
          return { offset: ref(10) };
        },
        template: `
        <button data-test="offset" @click="offset = 30">Change offset</button>
        <div id="real-affix-target" style="height: 200px; overflow: auto; margin-top: 40px">
          <div style="height: 100px" />
          <Affix target="#real-affix-target" :offset-top="offset">
            <div data-test="content" style="height: 40px; background: white">Affixed content</div>
          </Affix>
          <div data-test="following" style="height: 600px" />
        </div>
      `,
      }),
    );
    cy.get('.sd-affix').should('not.exist');
    cy.get('#real-affix-target').scrollTo(0, 120);
    cy.get('.sd-affix').should('be.visible').and('have.css', 'position', 'fixed');
    const checkOffset = (offset: number) => {
      cy.get('#real-affix-target').then(($target) => {
        const top = $target[0].getBoundingClientRect().top;
        cy.get('.sd-affix').should(($affix) => {
          expect($affix[0].getBoundingClientRect().top).to.be.closeTo(top + offset, 1);
        });
      });
    };
    checkOffset(10);
    cy.get('.sd-affix').prev().should('have.css', 'height', '40px');
    cy.get('[data-test="offset"]').click();
    checkOffset(30);
    cy.get('#real-affix-target').scrollTo(0, 0);
    cy.get('.sd-affix').should('not.exist');
    cy.get('[data-test="content"]').should('be.visible');
  });
});
