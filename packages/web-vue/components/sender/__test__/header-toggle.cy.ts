import HeaderDemo from '../../../../sd-vue-docs/src/components/generated/sender/header.vue';

describe('Sender header toggling', () => {
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
