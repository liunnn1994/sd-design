import { h } from 'vue';

import Component from '../index';

describe('tree-select text overflow', () => {
  for (const ellipsis of [true, 'performant-ellipsis'] as const) {
    it(`constrains long labels with ${ellipsis}`, () => {
      const text = 'A very long option label '.repeat(12);
      cy.mount(() =>
        h(Component, {
          data: [{ key: 'long', title: text }],
          ellipsis,
          defaultPopupVisible: true,
          style: 'width: 240px',
        }),
      );
      cy.get('.sd-tree-node-title')
        .first()
        .should(($label) => {
          expect($label[0]!.getBoundingClientRect().width).to.be.at.most(240);
        });
      cy.get('.sd-tree-node-title .sd-ellipsis')
        .first()
        .should(($el) => {
          expect($el[0]!.scrollWidth).to.be.greaterThan($el[0]!.clientWidth);
        });
    });
  }
});
