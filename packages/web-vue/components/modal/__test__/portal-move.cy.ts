import { defineComponent, h, ref } from 'vue';

import Drawer from '../../drawer/drawer.vue';
import Modal from '../modal.vue';

describe('Dialog portal identity', () => {
  for (const [name, Dialog] of [
    ['Modal', Modal],
    ['Drawer', Drawer],
  ] as const) {
    it(`preserves ${name} draft and open lifecycle when changing the container`, () => {
      const target = ref('#portal-a');
      const open = cy.stub();
      cy.mount(
        defineComponent({
          setup: () => () => [
            ...['portal-a', 'portal-b'].map((id) =>
              h(
                'div',
                { id, style: { height: '100px', overflow: 'auto' } },
                h('div', { style: { height: '500px' } }),
              ),
            ),
            h(
              Dialog,
              { visible: true, popupContainer: target.value, onOpen: open },
              {
                default: () =>
                  h('input', { 'aria-label': 'Portal draft', 'defaultValue': 'initial' }),
              },
            ),
          ],
        }),
        { global: { stubs: { transition: false } } },
      );
      cy.get('[aria-label="Portal draft"]')
        .clear()
        .type('retained draft')
        .then((element) => ({ node: element[0] }))
        .as('original', { type: 'static' });
      cy.wrap(open).should('have.been.calledOnce');
      cy.then(() => {
        target.value = '#portal-b';
      });
      cy.get('#portal-b input')
        .should('have.value', 'retained draft')
        .then((element) =>
          cy
            .get('@original')
            .then((saved) => expect(Reflect.get(saved, 'node')).to.equal(element[0])),
        );
      cy.get('#portal-a').should('have.css', 'overflow', 'auto');
      cy.get('#portal-b').should('have.css', 'overflow', 'hidden');
      cy.wrap(open).should('have.been.calledOnce');
    });
  }
});
