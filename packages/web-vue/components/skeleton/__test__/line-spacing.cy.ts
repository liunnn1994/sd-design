import { SkeletonLine } from '../index';

describe('SkeletonLine spacing', () => {
  for (const lineSpacing of [0, 10]) {
    it(`uses exactly ${lineSpacing}px between rows`, () => {
      cy.mount(SkeletonLine, { props: { rows: 2, lineSpacing } });
      cy.get('.sd-skeleton-line-row').should(($rows) => {
        const first = $rows[0].getBoundingClientRect();
        const second = $rows[1].getBoundingClientRect();
        expect(second.top - first.bottom).to.equal(lineSpacing);
      });
    });
  }
});
