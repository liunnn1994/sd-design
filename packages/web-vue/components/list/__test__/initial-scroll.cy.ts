import { h } from 'vue';

import List from '../index';

describe('List initial scroll position', () => {
  it('does not report the bottom while overflowing content is still at the top', () => {
    const reachBottom = cy.spy().as('reachBottom');
    cy.mount(List, {
      props: { maxHeight: 120, onReachBottom: reachBottom },
      slots: { default: () => h('div', { style: { height: '600px' } }, 'Tall content') },
    });
    cy.get('.sd-list [data-overlayscrollbars-viewport]').should(($viewport) => {
      expect($viewport[0].scrollHeight).to.be.greaterThan($viewport[0].clientHeight);
    });
    cy.get('@reachBottom').should('not.have.been.called');
  });

  it('does not report the bottom for an overflowing virtual list on mount', () => {
    const reachBottom = cy.spy().as('reachBottom');
    cy.mount(List, {
      props: {
        data: Array.from({ length: 30 }, (_, index) => index),
        virtualListProps: { height: 120, itemSize: 40, fixedSize: true },
        onReachBottom: reachBottom,
      },
      slots: { item: ({ item }: { item: number }) => h('div', String(item)) },
    });
    cy.get('.sd-virtual-list-scroller').should(($viewport) => {
      expect($viewport[0].scrollHeight).to.be.greaterThan($viewport[0].clientHeight);
    });
    cy.get('@reachBottom').should('not.have.been.called');
  });
});
