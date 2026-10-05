import { h, ref } from 'vue';

import List, { ListItemMeta } from '../index';

describe('List robustness', () => {
  it('updates replaced default-slot items', () => {
    const text = ref('first');
    cy.mount({
      setup: () => () => {
        const item = h('div', { 'data-test': 'item' }, text.value);
        return h(List, {}, () => [item]);
      },
    });
    cy.get('[data-test="item"]').should('have.text', 'first');
    cy.then(() => {
      text.value = 'second';
    });
    cy.get('[data-test="item"]').should('have.text', 'second');
  });

  for (const name of ['title', 'description']) {
    for (const initial of [false, true]) {
      it(`updates meta ${name} starting ${initial ? 'present' : 'absent'}`, () => {
        const visible = ref(initial);
        cy.mount({
          setup: () => () => h(ListItemMeta, {}, visible.value ? { [name]: () => 'Content' } : {}),
        });
        cy.then(() => {
          visible.value = !initial;
        });
        cy.get('.sd-list-item-meta-content').should(initial ? 'not.exist' : 'exist');
        if (!initial) cy.get(`.sd-list-item-meta-${name}`).should('have.text', 'Content');
      });
    }
  }

  it('passes continuous item indexes across grid rows', () => {
    cy.mount(List, {
      props: { data: ['a', 'b', 'c', 'd'], gridProps: { span: 12 } },
      slots: {
        item: ({ item, index }: { item: string; index: number }) => h('output', `${index}:${item}`),
      },
    });
    cy.get('output').then(($items) => {
      expect([...$items].map((item) => item.textContent)).to.deep.equal([
        '0:a',
        '1:b',
        '2:c',
        '3:d',
      ]);
    });
  });

  it('keeps non-divisor grid spans within the 24-column row', () => {
    cy.mount(List, {
      props: { data: Array.from({ length: 10 }, (_, index) => index), gridProps: { span: 5 } },
      slots: { item: ({ item }: { item: number }) => h('output', String(item)) },
    });
    cy.get('.sd-list-row').then(($rows) => {
      expect([...$rows].map((row) => row.querySelectorAll('.sd-list-col').length)).to.deep.equal([
        4, 4, 2,
      ]);
    });
  });

  it('derives pagination total from default-slot items', () => {
    cy.mount(List, {
      props: { paginationProps: { pageSize: 2, showTotal: true } },
      slots: { default: () => ['a', 'b', 'c', 'd'].map((item) => h('output', item)) },
    });
    cy.get('.sd-pagination-total').should('have.text', '共 4 条');
    cy.contains('.sd-pagination-item', /^2$/).click();
    cy.get('output').should('have.length', 2).first().should('have.text', 'c');
  });

  it('renders VNode data in virtual mode without an item slot', () => {
    cy.mount(List, {
      props: {
        data: [h('output', 'VNode item')],
        virtualListProps: { height: 200 },
      },
    });
    cy.get('output').should('have.text', 'VNode item');
  });
});
