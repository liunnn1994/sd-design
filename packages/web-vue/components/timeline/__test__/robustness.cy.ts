import { defineComponent, h, ref } from 'vue';

import Timeline, { TimelineItem } from '../index';

describe('Timeline robustness', () => {
  for (const mode of ['top', 'bottom'] as const) {
    it(`removes the content bottom margin for horizontal ${mode} relative labels`, () => {
      cy.mount(Timeline, {
        props: { direction: 'horizontal', mode, labelPosition: 'relative' },
        slots: { default: () => h(TimelineItem, { label: 'Label' }, () => 'Content') },
      });
      cy.get('.sd-timeline-item-content').should('have.css', 'margin-bottom', '0px');
    });
  }

  it('updates alternating positions and the last marker after keyed reorder and removal', () => {
    cy.mount(
      defineComponent({
        setup() {
          const items = ref(['A', 'B', 'C']);
          return () =>
            h('div', [
              h(
                'button',
                {
                  onClick: () => {
                    items.value = ['C', 'A'];
                  },
                },
                'Reorder',
              ),
              h(
                Timeline,
                { mode: 'alternate' },
                {
                  default: () =>
                    items.value.map((item) => h(TimelineItem, { key: item }, () => item)),
                },
              ),
            ]);
        },
      }),
    );
    cy.get('.sd-timeline-item-last').should('have.length', 1).and('contain.text', 'C');
    cy.contains('button', 'Reorder').click();
    cy.get('.sd-timeline-item').should('have.length', 2);
    cy.get('.sd-timeline-item')
      .eq(0)
      .should('contain.text', 'C')
      .and('have.class', 'sd-timeline-item-vertical-left');
    cy.get('.sd-timeline-item')
      .eq(1)
      .should('contain.text', 'A')
      .and('have.class', 'sd-timeline-item-vertical-right');
    cy.get('.sd-timeline-item-last').should('have.length', 1).and('contain.text', 'A');
  });
});
