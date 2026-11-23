import { h, ref } from 'vue';

import Popconfirm from '../index';

describe('Popconfirm robustness', () => {
  for (const mode of ['promise', 'callback'] as const) {
    it(`ignores an old ${mode} confirmation after controlled close and reopen`, () => {
      const visible = ref(true);
      const pending: ((confirmed: boolean) => void)[] = [];
      const onOk = cy.spy().as('onOk');
      const onUpdate = cy.spy().as('onUpdate');
      cy.mount(() =>
        h(
          Popconfirm,
          {
            'content': 'Content',
            'popupVisible': visible.value,
            'renderToBody': false,
            'onBeforeOk': (done: (confirmed: boolean) => void) => {
              if (mode === 'callback') {
                pending.push(done);
                return;
              }
              return new Promise<boolean>((resolve) => {
                pending.push(resolve);
              });
            },
            onOk,
            'onUpdate:popupVisible': onUpdate,
          },
          { default: () => h('button', 'Button') },
        ),
      );
      cy.get('.sd-popconfirm-footer .sd-btn').eq(1).click({ force: true });
      cy.get('.sd-btn-loading').should('exist');
      cy.then(() => {
        visible.value = false;
      });
      cy.get('.sd-popconfirm-popup-content').should('not.be.visible');
      cy.then(() => {
        visible.value = true;
      });
      cy.get('.sd-popconfirm-popup-content').should('be.visible');
      cy.get('.sd-btn-loading').should('not.exist');
      cy.get('.sd-popconfirm-footer .sd-btn').eq(1).click({ force: true });
      cy.get('.sd-btn-loading').should('exist');
      cy.then(() => pending.shift()!(true));
      cy.then(() => Cypress.Promise.delay(0));
      cy.get('@onOk').should('not.have.been.called');
      cy.get('@onUpdate').should('not.have.been.called');
      cy.get('.sd-btn-loading').should('exist');
      cy.then(() => pending.shift()!(true));
      cy.get('.sd-btn-loading').should('not.exist');
      cy.get('@onOk').should('have.been.calledOnce');
      cy.get('@onUpdate').should('have.been.calledOnceWith', false);
    });
  }
});
