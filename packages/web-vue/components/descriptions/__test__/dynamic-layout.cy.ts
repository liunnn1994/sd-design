import { h, ref } from 'vue';

import Descriptions, { DescriptionsItem } from '../index';

const data = Array.from({ length: 5 }, (_, index) => ({
  label: `Label ${index}`,
  value: `Value ${index}`,
}));

describe('Descriptions dynamic layout', () => {
  it('regroups columns when the actual viewport changes', () => {
    cy.viewport(1100, 700);
    cy.mount(Descriptions, { props: { data, column: { xs: 1, md: 2, lg: 3 } } });
    cy.get('.sd-descriptions-row').should('have.length', 2);
    cy.viewport(800, 700);
    cy.get('.sd-descriptions-row').should('have.length', 3);
    cy.viewport(500, 700);
    cy.get('.sd-descriptions-row').should('have.length', 5);
    cy.viewport(1100, 700);
    cy.get('.sd-descriptions-row').should('have.length', 2);
  });

  it('updates data, spans, and empty state without stale cells', () => {
    cy.mount(Descriptions, { props: { data, column: 3 } });
    cy.get('.sd-descriptions-item-value').should('have.length', 5);
    cy.get('@vue').then(({ wrapper }) =>
      wrapper.setProps({
        data: [
          { label: 'Wide', value: 'Updated', span: 2 },
          { label: 'Last', value: 'Final', span: 1 },
        ],
      }),
    );
    cy.get('.sd-descriptions-row').should('have.length', 1);
    cy.get('.sd-descriptions-item-value').first().should('have.attr', 'colspan', '3');
    cy.get('.sd-descriptions-item-value').last().should('have.text', 'Final');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ data: [] }));
    cy.get('.sd-descriptions-row').should('not.exist');
  });

  it('reacts to insertion and removal of item slots', () => {
    const expanded = ref(false);
    cy.mount({
      render: () =>
        h('div', [
          h(
            'button',
            {
              onClick: () => {
                expanded.value = !expanded.value;
              },
            },
            'Toggle',
          ),
          h(
            Descriptions,
            { column: 2 },
            {
              default: () => [
                h(DescriptionsItem, { label: 'First' }, () => 'One'),
                ...(expanded.value ? [h(DescriptionsItem, { label: 'Second' }, () => 'Two')] : []),
              ],
            },
          ),
        ]),
    });
    cy.get('.sd-descriptions-item-value').should('have.length', 1);
    cy.contains('button', 'Toggle').click();
    cy.get('.sd-descriptions-item-value')
      .should('have.length', 2)
      .last()
      .should('have.text', 'Two');
    cy.contains('button', 'Toggle').click();
    cy.get('.sd-descriptions-item-value')
      .should('have.length', 1)
      .first()
      .should('have.text', 'One');
  });
});
