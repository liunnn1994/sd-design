import Drawer from '../../drawer';
import Modal from '../modal.vue';

describe('Dialog keyboard close', () => {
  for (const [name, component] of [
    ['modal', Modal],
    ['drawer', Drawer],
  ] as const) {
    for (const key of ['Enter', ' ']) {
      it(`closes ${name} with ${JSON.stringify(key)}`, () => {
        const cancel = cy.spy().as('cancel');
        cy.mount(component, {
          props: { defaultVisible: true, renderToBody: false, title: 'Title', onCancel: cancel },
        });
        cy.get(`.sd-${name}-close-btn`).focus().trigger('keydown', { key });
        cy.get('@cancel').should('have.been.calledOnce');
      });
    }
  }
});
