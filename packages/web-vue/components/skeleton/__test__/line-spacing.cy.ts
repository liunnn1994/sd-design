import { defineComponent, ref } from 'vue';

import { SkeletonLine } from '../index';

describe('SkeletonLine spacing', () => {
  it('updates shared row styles when dimensions and row count change', () => {
    cy.mount(
      defineComponent({
        components: { SkeletonLine },
        setup: () => ({ changed: ref(false) }),
        template:
          '<div style="width:200px"><button @click="changed = true">Update</button><SkeletonLine :rows="changed ? 2 : 3" :widths="changed ? [0, \'50%\'] : [120]" :line-height="changed ? 10 : 20" :line-spacing="changed ? 0 : 15"/></div>',
      }),
    );
    cy.get('.sd-skeleton-line-row')
      .should('have.length', 3)
      .first()
      .should('have.css', 'width', '120px');
    cy.contains('button', 'Update').click();
    cy.get('.sd-skeleton-line-row')
      .should('have.length', 2)
      .first()
      .should('have.css', 'width', '0px')
      .and('have.css', 'height', '10px');
    cy.get('.sd-skeleton-line-row')
      .eq(1)
      .should('have.css', 'width', '100px')
      .and('have.css', 'margin-top', '0px');
  });
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
