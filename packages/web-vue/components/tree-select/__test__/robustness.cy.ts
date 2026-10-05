import { h, ref } from 'vue';

import ConfigProvider from '../../config-provider';
import TreeSelect from '../index';

const data = [
  { key: 'one', title: 'One' },
  { key: 'two', title: 'Two' },
];

describe('TreeSelect robustness', () => {
  it('supports defaultShow without overriding explicit defaultPopupVisible', () => {
    cy.mount(TreeSelect, { props: { data, defaultShow: true } });
    cy.get('.sd-tree-select-popup').should('be.visible');
  });

  it('keeps explicit defaultPopupVisible precedence', () => {
    cy.mount(TreeSelect, { props: { data, defaultShow: true, defaultPopupVisible: false } });
    cy.get('input').should('have.attr', 'aria-expanded', 'false');
  });

  for (const state of ['readonly', 'disabled']) {
    it(`blocks selection after an open popup becomes ${state}`, () => {
      const change = cy.spy().as('change');
      cy.mount(TreeSelect, { props: { data, defaultPopupVisible: true, onChange: change } });
      cy.get('.sd-tree-select-popup').should('be.visible');
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ [state]: true }));
      cy.get('.sd-tree-node[data-key="two"] .sd-tree-node-title').click({ force: true });
      cy.get('@change').should('not.have.been.called');
    });
  }

  for (const action of ['clear', 'remove']) {
    it(`blocks readonly ${action}`, () => {
      const change = cy.spy().as('change');
      cy.mount(TreeSelect, {
        props: {
          data,
          readonly: true,
          multiple: true,
          defaultValue: ['one'],
          allowClear: true,
          onChange: change,
        },
      });
      if (action === 'clear') cy.get('.sd-select-view-clear-btn').click({ force: true });
      else cy.get('.sd-select-view-tag .sd-tag-close-btn').click({ force: true });
      cy.get('@change').should('not.have.been.called');
      cy.get('.sd-select-view-tag').should('contain.text', 'One');
    });
  }

  it('uses lazy leaf metadata for selected tag closability', () => {
    cy.mount(TreeSelect, {
      props: {
        data: [{ key: 'branch', title: 'Branch', isLeaf: false }],
        selectable: 'leaf',
        multiple: true,
        defaultValue: ['branch'],
        loadMore: () => Promise.resolve(),
      },
    });
    cy.get('.sd-select-view-tag').should('contain.text', 'Branch');
    cy.get('.sd-select-view-tag .sd-tag-close-btn').should('not.exist');
  });

  it('refreshes the ConfigProvider empty slot', () => {
    const text = ref('First');
    cy.mount({
      setup: () => () =>
        h(
          ConfigProvider,
          {},
          {
            default: () => h(TreeSelect, { defaultPopupVisible: true }),
            empty: () => h('span', { class: 'custom-empty' }, text.value),
          },
        ),
    });
    cy.get('.custom-empty').should('have.text', 'First');
    cy.then(() => {
      text.value = 'Second';
    });
    cy.get('.custom-empty').should('have.text', 'Second');
  });
});
