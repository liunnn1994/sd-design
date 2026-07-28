import { h } from 'vue';

import TreeSelect from '../index';

const options = [
  {
    label: 'Root',
    key: 'root',
    children: [
      { label: 'Leaf 1', key: 'leaf-1' },
      { label: 'Leaf 2', key: 'leaf-2' },
    ],
  },
];

const fieldNames = { title: 'label' };

const openPopup = () => cy.get('.sd-select-view').click();

const checkNode = (key: string) =>
  cy.get(`.sd-tree-node[data-key="${key}"] .sd-checkbox-target`).first().click({ force: true });

describe('TreeSelect', () => {
  it('opens the tree from a custom trigger slot', () => {
    cy.mount(TreeSelect, {
      props: { options, fieldNames, defaultValue: '0-0' },
      slots: {
        trigger: (scope: any) =>
          h(
            'button',
            { class: 'custom-trigger' },
            `${scope.displayValue}|${scope.selectedOptions[0]?.label}|${scope.popupVisible}`,
          ),
      },
    });
    cy.get('.sd-select-view').should('not.exist');
    cy.get('.custom-trigger').should('contain.text', '0-0');
    cy.get('.custom-trigger').click();
    cy.get('.custom-trigger').should('contain.text', 'true');
    cy.get('.sd-tree-select-popup').should('be.visible');
  });

  it('passes spinProps to the loading popup', () => {
    cy.mount(TreeSelect, {
      props: {
        data: [],
        loading: true,
        defaultPopupVisible: true,
        spinProps: { tip: '树加载中', dot: true },
      },
    });
    cy.get('.sd-tree-select-popup .sd-dot-loading').should('exist');
    cy.get('.sd-tree-select-popup .sd-spin-tip').should('have.text', '树加载中');
  });

  it('renders the default empty state', () => {
    cy.mount(TreeSelect, { props: { data: [] } });
    openPopup();
    cy.get('.sd-tree-select-popup .sd-empty').should('be.visible');
    cy.get('.sd-tree-select-popup').invoke('outerHeight').should('be.greaterThan', 0);
  });

  it('supports options alias and showPath', () => {
    cy.mount(TreeSelect, {
      props: { options, showPath: true, defaultValue: 'leaf-2', fieldNames },
    });
    cy.get('.sd-select-view-value').should('have.text', 'Root / Leaf 2');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ showPath: false })));
    cy.get('.sd-select-view-value').should('have.text', 'Leaf 2');
    cy.get('@vue').then(({ wrapper }) =>
      cy.wrap(wrapper.setProps({ showPath: true, separator: ' | ' })),
    );
    cy.get('.sd-select-view-value').should('have.text', 'Root | Leaf 2');
  });

  it('supports the v-model:show alias', () => {
    cy.mount(TreeSelect, { props: { show: false, options, fieldNames } });
    openPopup();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:show')?.[0]).to.deep.equal([true]);
      expect(wrapper.emitted('showChange')?.[0]).to.deep.equal([true]);
    });
  });

  it('renders a custom tag slot with the selected tree option data', () => {
    cy.mount(TreeSelect, {
      props: { multiple: true, defaultValue: ['leaf-1'], options, fieldNames },
      slots: {
        tag: ({ data }: { data: { label: string } }) =>
          h('span', { class: 'tree-custom-tag' }, `Tree:${data.label}`),
      },
    });
    cy.get('.tree-custom-tag').should('have.text', 'Tree:Leaf 1');
  });

  it('hides the arrow icon when showArrow is false', () => {
    cy.mount(TreeSelect, { props: { showArrow: false, options, fieldNames } });
    cy.get('.sd-select-view-arrow-icon').should('not.exist');
  });

  it('supports treeCheckable checkbox selection', () => {
    cy.mount(TreeSelect, {
      props: { modelValue: [], options, treeCheckable: true, allowSearch: true, fieldNames },
    });
    openPopup();
    checkNode('leaf-1');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')?.[0]).to.deep.equal([['leaf-1']]);
      expect(wrapper.emitted('change')?.[0]).to.deep.equal([['leaf-1']]);
    });
  });

  it('supports the checkable alias as checkbox mode', () => {
    cy.mount(TreeSelect, {
      props: { modelValue: [], options, checkable: true, allowSearch: true, fieldNames },
    });
    openPopup();
    checkNode('leaf-2');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')?.[0]).to.deep.equal([['leaf-2']]);
      expect(wrapper.emitted('change')?.[0]).to.deep.equal([['leaf-2']]);
    });
  });

  it('trigger exposes aria-haspopup=listbox and aria-expanded', () => {
    cy.mount(TreeSelect, { props: { options, fieldNames } });
    cy.get('.sd-select-view').should('have.attr', 'aria-haspopup', 'listbox');
    cy.get('.sd-select-view').should('have.attr', 'aria-expanded', 'false');
    // combobox 语义落到可聚焦的 input（经 inputAttrs）
    cy.get('input').should('have.attr', 'role', 'combobox');
    cy.get('input').should('have.attr', 'aria-haspopup', 'listbox');
    cy.get('input').should('have.attr', 'aria-expanded', 'false');
    openPopup();
    cy.get('.sd-select-view').should('have.attr', 'aria-expanded', 'true');
    cy.get('input').should('have.attr', 'aria-expanded', 'true');
  });
});
