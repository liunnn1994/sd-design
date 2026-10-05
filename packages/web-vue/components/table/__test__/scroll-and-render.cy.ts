import { h } from 'vue';

import Table from '../index';

describe('Table scroll and element rendering', () => {
  it('scrolls a virtual table to a row key', () => {
    cy.mount(Table, {
      props: {
        pagination: false,
        columns: [{ dataIndex: 'name' }],
        data: Array.from({ length: 100 }, (_, i) => ({ key: `row-${i}`, name: `Row ${i}` })),
        virtualListProps: { height: 200, itemSize: 40 },
      },
    });
    cy.get('.sd-virtual-list-scroller').should('exist');
    cy.get('@vue').then(({ wrapper }) =>
      wrapper.vm.scrollIntoView({ key: 'row-80', align: 'top' }),
    );
    cy.get('.sd-virtual-list-scroller').should(($scroller) => {
      expect($scroller[0].scrollTop).to.be.greaterThan(1000);
    });
    cy.get('.sd-table-tbody, .sd-table-body').should('contain.text', 'Row 80');
  });

  it('renders custom row and cell elements and continues updating', () => {
    cy.mount(Table, {
      props: {
        pagination: false,
        columns: [{ dataIndex: 'name' }],
        data: [{ key: 'a', name: 'A' }],
      },
      slots: {
        tr: () => h('section', { class: 'custom-row' }),
        td: () => h('article', { class: 'custom-cell' }),
      },
    });
    cy.get('section.custom-row article.custom-cell').should('contain.text', 'A');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ data: [{ key: 'a', name: 'B' }] }));
    cy.get('section.custom-row article.custom-cell').should('contain.text', 'B');
  });

  it('stops resizing when columnResizable is disabled during a drag', () => {
    const resize = cy.spy().as('resize');
    cy.mount(Table, {
      props: {
        pagination: false,
        columns: [{ dataIndex: 'name' }, { dataIndex: 'age' }],
        data: [{ key: 'a', name: 'A' }],
        columnResizable: true,
        onColumnResize: resize,
      },
    });
    cy.get('.sd-table-column-handle').trigger('mousedown');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ columnResizable: false }));
    cy.window().trigger('mousemove', { clientX: 100 });
    cy.get('@resize').should('not.have.been.called');
    cy.window().trigger('mouseup');
  });
});
