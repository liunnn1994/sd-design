import { defineComponent, h } from 'vue';

import Cascader from '../../cascader';
import TreeSelect from '../../tree-select';
import ConfigProvider from '../index';

describe('Dropdown configuration parity', () => {
  it('resolves TreeSelect root ellipsis before nested settings and releases plain popup width', () => {
    cy.mount(TreeSelect, {
      props: {
        options: [
          {
            key: 'root',
            title: 'Root',
            children: [{ key: 'leaf', title: 'A long team label '.repeat(12) }],
          },
        ],
        popupVisible: true,
        treeProps: { defaultExpandAll: true },
      },
      attrs: { style: 'width: 220px' },
    });
    cy.get('.sd-tree-node .sd-ellipsis').should('have.length', 2);
    cy.get('.sd-tree-select-popup').invoke('outerWidth').should('be.closeTo', 220, 1);
    cy.get('@vue').then(({ wrapper }) =>
      wrapper.setProps({ treeProps: { defaultExpandAll: true, ellipsis: false } }),
    );
    cy.get('.sd-tree-node .sd-ellipsis').should('not.exist');
    cy.get('.sd-tree-select-popup').invoke('outerWidth').should('be.greaterThan', 220);
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ ellipsis: true }));
    cy.get('.sd-tree-node .sd-ellipsis').should('have.length', 2);
    cy.get('@vue').then(({ wrapper }) =>
      wrapper.setProps({ ellipsis: false, treeProps: { defaultExpandAll: true, ellipsis: true } }),
    );
    cy.get('.sd-tree-node .sd-ellipsis').should('not.exist');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ ellipsis: 'performant-ellipsis' }));
    cy.get('.sd-tree-node .sd-ellipsis').should('have.length', 2);
    cy.get('.sd-tree-node [data-ellipsis-measure]').should('not.exist');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ ellipsis: undefined }));
    cy.get('.sd-tree-node [data-ellipsis-measure]').should('have.length', 2);
  });

  for (const [name, component, size, input] of [
    ['tree', TreeSelect, 29, 'team'],
    ['cascader', Cascader, 23, 'team'],
    ['cascader', Cascader, 23, ''],
  ] as const) {
    it(`merges global, ${name} and local Spin defaults in ${input ? 'search' : 'columns'} mode`, () => {
      cy.mount(
        defineComponent({
          props: {
            local: Boolean,
            specific: { type: Boolean, default: true },
            tip: { type: String, default: 'provider' },
          },
          setup: (props) => () =>
            h(
              ConfigProvider,
              {
                spinProps: { tip: 'global', size: 11 },
                treeSelectSpinProps: props.specific
                  ? { tip: `tree ${props.tip}`, size: 29 }
                  : undefined,
                cascaderSpinProps: props.specific
                  ? { tip: `cascader ${props.tip}`, size: 23 }
                  : undefined,
              },
              () =>
                h(component, {
                  loading: true,
                  popupVisible: true,
                  options: [],
                  style: 'width: 220px',
                  allowSearch: true,
                  inputValue: input,
                  spinProps: props.local ? { tip: `${name} local`, dot: true } : undefined,
                }),
            ),
        }),
      );
      cy.get('.sd-spin-tip').should('have.text', `${name} provider`);
      cy.get('.sd-spin-icon').should('have.css', 'font-size', `${size}px`);
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ local: true }));
      cy.get('.sd-spin-tip').should('have.text', `${name} local`);
      cy.get('.sd-dot-loading').should('exist');
      cy.get('.sd-spin-icon').should('have.css', 'font-size', `${size}px`);
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ tip: 'updated' }));
      cy.get('.sd-spin-tip').should('have.text', `${name} local`);
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ local: false }));
      cy.get('.sd-spin-tip').should('have.text', `${name} updated`);
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ specific: false }));
      cy.get('.sd-spin-tip').should('have.text', 'global');
      cy.get('.sd-spin-icon').should('have.css', 'font-size', '11px');
    });
  }
});
