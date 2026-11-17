import { defineComponent, h } from 'vue';

import Cascader from '../../cascader';
import Select from '../../select';
import Table from '../../table';
import Transfer from '../../transfer';
import Tree from '../../tree';
import TreeSelect from '../../tree-select';
import Checkbox from '../index';

const options = [
  { value: 'one', label: 'One' },
  { value: 'two', label: 'Two' },
  { value: 'disabled', label: 'Disabled', disabled: true },
];

describe('Shared multiple-selection checkbox layout', () => {
  const fixtures = {
    'Checkbox': () => h(Checkbox.Group, { options }),
    'Checkbox mixed states': () =>
      h('div', [
        h(Checkbox),
        h(Checkbox, { defaultChecked: true }),
        h(Checkbox, { indeterminate: true }),
        h(Checkbox, { disabled: true }),
        h(Checkbox, { disabled: true, defaultChecked: true }),
      ]),
    'Select': () => h(Select, { options, multiple: true, defaultPopupVisible: true }),
    'Select virtual': () =>
      h(Select, {
        options,
        multiple: true,
        defaultPopupVisible: true,
        virtualListProps: { height: 160 },
      }),
    'Cascader': () => h(Cascader, { options, multiple: true, defaultPopupVisible: true }),
    'Tree': () =>
      h(Tree, {
        checkable: true,
        data: options.map(({ value, label, disabled }) => ({ key: value, title: label, disabled })),
      }),
    'TreeSelect': () =>
      h(TreeSelect, {
        options,
        treeCheckable: true,
        defaultPopupVisible: true,
        fieldNames: { key: 'value', title: 'label' },
      }),
    'Transfer': () => h(Transfer, { data: options }),
    'Table': () =>
      h(Table, {
        columns: [{ title: 'Name', dataIndex: 'label' }],
        data: options.map((option) => ({ ...option, key: option.value })),
        rowSelection: { type: 'checkbox', showCheckedAll: true },
      }),
  };

  for (const [name, render] of Object.entries(fixtures)) {
    it(`${name} keeps square icons before and after selection`, () => {
      cy.mount(defineComponent({ setup: () => render }));
      const assertSquares = () =>
        cy.get('.sd-checkbox-icon').should(($icons) => {
          for (const icon of $icons) {
            const { width, height } = icon.getBoundingClientRect();
            expect(width, 'checkbox width').to.equal(14);
            expect(height, 'checkbox height').to.equal(14);
          }
        });
      assertSquares();
      cy.get('.sd-checkbox:not(.sd-checkbox-disabled)').first().click();
      cy.get('.sd-checkbox-checked').should('exist');
      assertSquares();
    });
  }
});
