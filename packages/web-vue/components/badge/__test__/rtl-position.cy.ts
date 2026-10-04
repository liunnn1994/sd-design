import { h } from 'vue';

import ConfigProvider from '../../config-provider';
import Badge from '../index';

describe('Badge RTL position', () => {
  for (const kind of ['number', 'dot', 'text', 'custom-dot']) {
    it(`mirrors the ${kind} badge to the top-left corner`, () => {
      cy.mount({
        render: () =>
          h(ConfigProvider, { rtl: true }, () =>
            h(
              Badge,
              { count: 12, dot: kind === 'dot', text: kind === 'text' ? 'New' : undefined },
              {
                default: () => h('div', { style: { width: '100px', height: '40px' } }, 'Inbox'),
                ...(kind === 'custom-dot' ? { content: () => 'New' } : {}),
              },
            ),
          ),
      });
      cy.get('.sd-badge').then(($badge) => {
        const corner = $badge[0].getBoundingClientRect();
        cy.get(`.sd-badge-${kind}`).should(($indicator) => {
          const indicator = $indicator[0].getBoundingClientRect();
          expect((indicator.left + indicator.right) / 2).to.be.closeTo(corner.left + 2, 1);
          expect((indicator.top + indicator.bottom) / 2).to.be.closeTo(corner.top + 2, 1);
        });
      });
    });
  }

  it('keeps a standalone RTL number badge in the normal flow', () => {
    cy.mount({
      render: () => h(ConfigProvider, { rtl: true }, () => h(Badge, { count: 12 })),
    });
    cy.get('.sd-badge').then(($badge) => {
      const bounds = $badge[0].getBoundingClientRect();
      cy.get('.sd-badge-number').should(($indicator) => {
        expect($indicator[0].getBoundingClientRect().left).to.be.closeTo(bounds.left, 1);
      });
    });
  });
});
