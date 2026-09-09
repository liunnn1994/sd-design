import Drawer from '../drawer.vue';

describe('Drawer pending confirmation lifecycle', () => {
  for (const mode of ['callback', 'promise'] as const) {
    it(`ignores an old ${mode} after controlled close and reopen`, () => {
      let finish!: (closed: boolean) => void;
      cy.mount(Drawer, {
        props: {
          visible: true,
          renderToBody: false,
          onBeforeOk: (done) => {
            if (mode === 'callback') {
              finish = done;
              return;
            }
            return new Promise<boolean>((resolve) => {
              finish = resolve;
            });
          },
        },
      });
      cy.get('.sd-drawer-footer .sd-btn').last().click();
      cy.get('.sd-drawer-footer .sd-btn').last().should('have.class', 'sd-btn-loading');
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ visible: false }));
      cy.get('.sd-drawer').should('not.be.visible');
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ visible: true }));
      cy.then(() => finish(true));
      cy.then(() => Cypress.Promise.delay(0));
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('ok')).to.equal(undefined);
        expect(wrapper.emitted('update:visible')).to.equal(undefined);
      });
      cy.get('.sd-drawer-footer .sd-btn').last().should('not.have.class', 'sd-btn-loading');
      cy.get('.sd-drawer-footer .sd-btn').last().click();
      cy.then(() => finish(true));
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('ok')).to.have.length(1);
      });
    });
  }

  it('enables Escape closing while already open', () => {
    cy.mount(Drawer, {
      props: { defaultVisible: true, renderToBody: false, escToClose: false },
    });
    cy.get('.sd-drawer').trigger('keydown', { key: 'Escape' });
    cy.get('.sd-drawer').should('be.visible');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ escToClose: true }));
    cy.get('.sd-drawer').trigger('keydown', { key: 'Escape' });
    cy.get('.sd-drawer').should('not.be.visible');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('cancel')).to.have.length(1);
    });
  });
});
