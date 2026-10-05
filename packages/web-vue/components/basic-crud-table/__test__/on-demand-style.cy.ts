import { mount } from 'cypress/vue';

import BasicCrudTable from '../basic-crud-table.vue';
import '../style';

describe('BasicCrudTable on-demand styles', () => {
  let disabledSheets: CSSStyleSheet[] = [];

  afterEach(() => {
    for (const sheet of disabledSheets) sheet.disabled = false;
    disabledSheets = [];
  });

  it('styles its toolbar, row actions and modal with only the component style entry', () => {
    cy.document().then((doc) => {
      for (const sheet of Array.from(doc.styleSheets)) {
        const id = (sheet.ownerNode as HTMLElement | null)?.getAttribute('data-vite-dev-id');
        if (id?.endsWith('/components/index.scss') && !sheet.disabled) {
          sheet.disabled = true;
          disabledSheets.push(sheet);
        }
      }
    });

    mount(BasicCrudTable, {
      props: {
        columns: [{ title: 'Name', dataIndex: 'name' }],
        tableData: [{ key: 1, name: 'Item' }],
        fetchTableOnMounted: false,
        loading: true,
        editBtn: { hoverable: true },
      },
    }).then(({ wrapper }) => cy.wrap(wrapper).as('crud'));
    cy.get('.sd-toolbar-inner').should('have.css', 'display', 'flex');
    cy.get('.sd-basic-crud-table-body').should('have.css', 'position', 'relative');
    cy.get('.sd-basic-crud-table-body > .sd-spin-mask').should('have.css', 'position', 'absolute');
    cy.get('@crud').then((wrapper) => cy.wrap(wrapper.setProps({ loading: false })));
    cy.get('.sd-table .sd-space').should('have.css', 'display', 'inline-flex');
    cy.get('.sd-table .sd-link').first().should('have.css', 'padding-left', '4px');
    cy.get('.sd-toolbar-actions .sd-btn').last().click();
    cy.get('.sd-modal-container').should('have.css', 'position', 'fixed');
    cy.get('.sd-modal').should('be.visible');
  });
});
