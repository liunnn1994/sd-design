import { h } from 'vue';

import Modal from '../index';

describe('body scroll lock compensation', () => {
  it('restores the body style exactly after the modal closes', () => {
    const readStyle = ({ style }: HTMLElement) => ({
      overflow: style.overflow,
      width: style.width,
      boxSizing: style.boxSizing,
    });
    let before: ReturnType<typeof readStyle>;
    cy.document().then(({ body }) => {
      before = readStyle(body);
    });

    cy.mount({
      render: () => [
        h('div', { style: { height: '200vh' } }),
        h(Modal, { visible: true, footer: false, renderToBody: true }),
      ],
    });
    cy.get('.sd-modal').should('be.visible');
    cy.get('body').should('have.css', 'overflow', 'hidden');

    cy.get('@vue').then(({ wrapper }) => wrapper.unmount());
    cy.document().should(({ body }) => expect(readStyle(body)).to.deep.equal(before));
  });
});
