import { h } from 'vue';

import AutoComplete from '../index';

describe('AutoComplete', () => {
  it('selects an option via keyboard', () => {
    cy.mount(AutoComplete, {
      props: { data: ['Beijing', 'Shanghai', 'Chengdu', 'WuHan'] },
    });
    cy.get('input').focus();
    cy.get('input').type('e');
    cy.get('input').type('{downarrow}{enter}');
    cy.get('input').should('have.value', 'Chengdu');
  });

  it('renders default option with performant ellipsis', () => {
    cy.mount(AutoComplete, {
      props: { data: ['Beijing long long long', 'Shanghai'] },
    });
    cy.get('input').focus();
    cy.get('.sd-select-option .sd-ellipsis').should('exist');
  });

  it('exposes combobox/listbox/option semantics', () => {
    cy.mount(AutoComplete, { props: { data: ['Beijing', 'Shanghai'] } });
    cy.get('input').focus();
    // 触发器（input）aria-haspopup=listbox，弹层 listbox，选项 option
    cy.get('input').should('have.attr', 'aria-haspopup', 'listbox');
    cy.get('.sd-select-dropdown-list').should('have.attr', 'role', 'listbox');
    cy.get('.sd-select-option').should('have.attr', 'role', 'option');
  });

  it('renders prefix and suffix slots', () => {
    cy.mount(AutoComplete, {
      props: { data: ['Beijing', 'Shanghai'] },
      slots: {
        prefix: () => h('span', { class: 'custom-prefix' }, 'P'),
        suffix: () => h('span', { class: 'custom-suffix' }, 'S'),
      },
    });
    cy.get('.sd-input-prefix .custom-prefix').should('exist');
    cy.get('.sd-input-suffix .custom-suffix').should('exist');
  });

  it('does not wrap a custom option slot with performant ellipsis', () => {
    cy.mount(AutoComplete, {
      props: {
        data: [
          { value: 'beijing', label: 'Beijing' },
          { value: 'shanghai', label: 'Shanghai' },
        ],
      },
      slots: {
        option: ({ data }) => h('span', { class: 'custom-option' }, data.label),
      },
    });
    cy.get('input').focus();
    cy.get('input').type('Bei');
    cy.get('.sd-select-option .custom-option').should('exist');
    cy.get('.sd-select-option .sd-ellipsis').should('not.exist');
  });
});
