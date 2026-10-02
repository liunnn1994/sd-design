import { defineComponent, h, ref } from 'vue';

import Timeline, { TimelineItem } from '../index';

describe('Timeline pending slot updates', () => {
  it('shows and removes a dynamically supplied pending slot', () => {
    cy.mount(
      defineComponent({
        setup() {
          const pending = ref(false);
          return () =>
            h('div', [
              h(
                'button',
                {
                  onClick: () => {
                    pending.value = !pending.value;
                  },
                },
                'Toggle pending',
              ),
              h(
                Timeline,
                {},
                {
                  default: () => h(TimelineItem, {}, () => 'Entry'),
                  ...(pending.value ? { pending: () => 'Waiting' } : {}),
                },
              ),
            ]);
        },
      }),
    );
    cy.get('.sd-timeline-item').should('have.length', 1);
    cy.contains('button', 'Toggle pending').click();
    cy.get('.sd-timeline-item').should('have.length', 2).last().should('contain.text', 'Waiting');
    cy.get('.sd-timeline-item-last').should('have.length', 1).and('contain.text', 'Waiting');
    cy.contains('button', 'Toggle pending').click();
    cy.get('.sd-timeline-item').should('have.length', 1);
    cy.get('.sd-timeline-item-last').should('have.length', 1).and('contain.text', 'Entry');
  });
});
