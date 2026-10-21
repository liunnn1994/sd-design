import { h } from 'vue';

import HeaderDemo from '../../../../sd-vue-docs/src/components/generated/sender/header.vue';

describe('Sender header toggling', () => {
  for (const theme of ['light', 'dark']) {
    it(`keeps a continuous container border around the open header in ${theme} mode`, () => {
      cy.mount(() =>
        h('div', { 'sd-theme': theme, 'style': { padding: '32px' } }, [h(HeaderDemo)]),
      );
      cy.get('.sd-sender-main').invoke('css', 'transition', 'none');
      cy.get('.sd-sender-header-header').should('be.visible');
      cy.get('.sd-sender-main').then(($main) => {
        const idleColor = $main.css('border-top-color');
        expect(idleColor).not.to.equal('rgba(0, 0, 0, 0)');
        cy.get('textarea').focus();
        cy.get('.sd-sender-main').should(($focused) => {
          const color = $focused.css('border-top-color');
          expect(color).not.to.equal(idleColor);
          for (const side of ['top', 'right', 'bottom', 'left']) {
            expect($focused.css(`border-${side}-color`)).to.equal(color);
            expect($focused.css(`border-${side}-width`)).to.equal('1px');
          }
        });
      });
      cy.get('.sender-demo').parent().screenshot(`sender-header-focus-${theme}`);
    });
  }

  it('opens on the first click after every completed close', () => {
    cy.mount(HeaderDemo, { global: { stubs: { transition: false } } });
    for (let i = 0; i < 3; i++) {
      cy.contains('button', '收起引用').click();
      cy.wait(400);
      cy.get('.sd-sender-header').should('not.exist');
      cy.contains('button', '展开引用').click();
      cy.get('.sd-sender-header')
        .should('be.visible')
        .and(($header) => {
          expect($header[0]!.getBoundingClientRect().height).to.be.greaterThan(40);
        });
    }
  });
  it('keeps the latest state when toggled during a transition', () => {
    cy.mount(HeaderDemo, { global: { stubs: { transition: false } } });
    cy.contains('button', '收起引用').click();
    cy.contains('button', '展开引用').click();
    cy.wait(400);
    cy.get('.sd-sender-header').should('be.visible');
  });
});
