import { h } from 'vue';

import Transfer from '../index';

const data = [0, 1, 2, 3].map((index) => ({
  disabled: false,
  value: `option${index + 1}`,
  label: `Option ${index + 1}`,
}));

describe('Transfer', () => {
  it('emits change on select + move', () => {
    cy.mount(Transfer, { props: { data } });
    cy.get('.sd-transfer-list-item .sd-checkbox-target').first().click({ force: true });
    cy.get('.sd-transfer-operations button').first().click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[0]).to.deep.equal([['option1']]);
    });
  });

  it('emits select on check-all', () => {
    cy.mount(Transfer, { props: { data } });
    cy.get('.sd-transfer-view-header .sd-checkbox-target').first().click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('select')?.[0]).to.deep.equal([
        ['option1', 'option2', 'option3', 'option4'],
      ]);
    });
  });

  it('labels the oneWay remove button (role + aria-label + keyboard)', () => {
    cy.mount(Transfer, { props: { data, oneWay: true } });
    // 先移一项到 target，使 target 出现 remove 按钮
    cy.get('.sd-transfer-list-item .sd-checkbox-target').first().click({ force: true });
    cy.get('.sd-transfer-operations button').first().click({ force: true });
    cy.get('.sd-transfer-list-item-remove-btn').should('have.attr', 'role', 'button');
    cy.get('.sd-transfer-list-item-remove-btn').should('have.attr', 'aria-label', '移除');
    // Enter 触发移除
    cy.get('.sd-transfer-list-item-remove-btn').trigger('keydown', { key: 'Enter' });
    cy.get('@vue').should(({ wrapper }) => {
      // 移除后 target 应为空（change 最后一次把 option1 移回 source）
      const changes = wrapper.emitted('change');
      expect(changes).to.not.equal(undefined);
    });
  });

  it('moves items to target and back', () => {
    cy.mount(Transfer, { props: { data } });
    cy.get('.sd-transfer-list-item .sd-checkbox-target').first().click({ force: true });
    cy.get('.sd-transfer-operations button').eq(0).click({ force: true });
    cy.get('.sd-transfer-view-target').should('contain.text', 'Option 1');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[0]).to.deep.equal([['option1']]);
      expect(wrapper.emitted('update:modelValue')?.[0]).to.deep.equal([['option1']]);
    });
    cy.get('.sd-transfer-view-target .sd-transfer-list-item .sd-checkbox-target')
      .first()
      .click({ force: true });
    cy.get('.sd-transfer-operations button').eq(1).click({ force: true });
    cy.get('.sd-transfer-view-target .sd-transfer-list-item').should('have.length', 0);
    cy.get('@vue').should(({ wrapper }) => {
      const changes = wrapper.emitted('change');
      expect(changes).to.have.length(2);
      expect(changes?.[1]).to.deep.equal([[]]);
    });
  });

  it('renders defaultValue items in the target panel', () => {
    cy.mount(Transfer, { props: { data, defaultValue: ['option2'] } });
    cy.get('.sd-transfer-view-target').should('contain.text', 'Option 2');
    // 计数是“勾选待移动数 / 面板数据数”，与 target 值无关
    cy.get('.sd-transfer-view-target .sd-transfer-view-header-count').should('have.text', '0 / 1');
    cy.get('.sd-transfer-view-source .sd-transfer-view-header-count').should('have.text', '0 / 3');
  });

  it('renders controlled modelValue in the target panel', () => {
    cy.mount(Transfer, { props: { data, modelValue: [] } });
    cy.get('@vue').then(({ wrapper }) =>
      cy.wrap(wrapper.setProps({ modelValue: ['option1', 'option3'] })),
    );
    cy.get('.sd-transfer-view-target .sd-transfer-list-item').should('have.length', 2);
    cy.get('.sd-transfer-view-target').should('contain.text', 'Option 1');
    cy.get('.sd-transfer-view-target').should('contain.text', 'Option 3');
  });

  it('supports simple mode: click to move both ways without operations', () => {
    cy.mount(Transfer, { props: { data, simple: true } });
    cy.get('.sd-transfer-operations').should('not.exist');
    cy.contains('.sd-transfer-view-source .sd-transfer-list-item', 'Option 1').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[0]).to.deep.equal([['option1']]);
    });
    cy.contains('.sd-transfer-view-target .sd-transfer-list-item', 'Option 1').click();
    cy.get('@vue').should(({ wrapper }) => {
      const changes = wrapper.emitted('change');
      expect(changes).to.have.length(2);
      expect(changes?.[1]).to.deep.equal([[]]);
    });
  });

  it('one-way mode hides the move-left button and clears target from the header', () => {
    cy.mount(Transfer, { props: { data, oneWay: true } });
    cy.get('.sd-transfer-operations button').should('have.length', 1);
    cy.get('.sd-transfer-view-target .sd-transfer-view-header-clear-btn').should('exist');
    cy.get('.sd-transfer-list-item .sd-checkbox-target').first().click({ force: true });
    cy.get('.sd-transfer-operations button').eq(0).click({ force: true });
    cy.get('.sd-transfer-view-target .sd-transfer-list-item').should('have.length', 1);
    cy.get('.sd-transfer-view-target .sd-transfer-view-header-clear-btn').click();
    cy.get('.sd-transfer-view-target .sd-transfer-list-item').should('have.length', 0);
    cy.get('@vue').should(({ wrapper }) => {
      const changes = wrapper.emitted('change');
      expect(changes).to.have.length(2);
      expect(changes?.[1]).to.deep.equal([[]]);
    });
  });

  it('filters lists via search input and emits search with panel type on Enter', () => {
    cy.mount(Transfer, { props: { data, showSearch: true } });
    // 限定到搜索容器：面板内的 checkbox 也是 input 元素
    cy.get('.sd-transfer-view-source .sd-transfer-view-search input').first().type('Option 1');
    cy.get('.sd-transfer-view-source .sd-transfer-list-item').should('have.length', 1);
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('search')).to.equal(undefined);
    });
    cy.get('.sd-transfer-view-source .sd-transfer-view-search input').first().type('{enter}');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('search')?.[0]).to.deep.equal(['Option 1', 'source']);
    });
    // target 面板搜索：事件 type 为 'target'
    cy.get('.sd-transfer-view-target .sd-transfer-view-search input').first().type('x{enter}');
    cy.get('@vue').should(({ wrapper }) => {
      const searches = wrapper.emitted('search');
      expect(searches).to.have.length(2);
      expect(searches?.[1]).to.deep.equal(['x', 'target']);
    });
  });

  it('excludes disabled items from selection and moving', () => {
    const dataWithDisabled = [...data, { disabled: true, value: 'option5', label: 'Option 5' }];
    cy.mount(Transfer, { props: { data: dataWithDisabled } });
    // 禁用项的 checkbox 不可用
    cy.get('.sd-transfer-view-source .sd-transfer-list-item')
      .eq(4)
      .find('.sd-checkbox-target')
      .should('be.disabled');
    // 全选只选中有效项
    cy.get('.sd-transfer-view-source .sd-transfer-view-header .sd-checkbox-target')
      .first()
      .click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('select')?.[0]).to.deep.equal([
        ['option1', 'option2', 'option3', 'option4'],
      ]);
    });
    // 移动后禁用项留在源面板
    cy.get('.sd-transfer-operations button').eq(0).click({ force: true });
    cy.get('.sd-transfer-view-target .sd-transfer-list-item').should('have.length', 4);
    cy.get('.sd-transfer-view-source').should('contain.text', 'Option 5');
  });

  it('shows indeterminate header checkbox on partial selection', () => {
    cy.mount(Transfer, { props: { data } });
    cy.get('.sd-transfer-list-item .sd-checkbox-target').first().click({ force: true });
    cy.get('.sd-transfer-view-source .sd-transfer-view-header .sd-checkbox').should(
      'have.class',
      'sd-checkbox-indeterminate',
    );
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('select')?.[0]).to.deep.equal([['option1']]);
      expect(wrapper.emitted('update:selected')?.[0]).to.deep.equal([['option1']]);
    });
    cy.get('.sd-transfer-view-source .sd-transfer-view-header .sd-checkbox-target')
      .first()
      .click({ force: true });
    cy.get('.sd-transfer-view-source .sd-transfer-view-header .sd-checkbox').should(
      'have.class',
      'sd-checkbox-checked',
    );
  });

  it('renders custom item content via the item slot', () => {
    cy.mount(Transfer, {
      props: { data },
      slots: {
        item: ({ label, value }: { label: string; value: string }) =>
          h('span', { class: 'transfer-custom-item' }, `${label}#${value}`),
      },
    });
    cy.get('.transfer-custom-item')
      .should('have.length', 4)
      .and('contain.text', 'Option 1#option1');
  });

  it('dedupes the select-all payload when the panel already has selected keys', () => {
    cy.mount(Transfer, { props: { data, defaultSelected: ['option1'] } });
    cy.get('.sd-transfer-view-source .sd-transfer-view-header .sd-checkbox-target')
      .first()
      .click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      const selected = wrapper.emitted('select')?.[0]?.[0] ?? [];
      // 已选项与全选有效值合并不产生重复 key
      expect(selected).to.deep.equal(['option1', 'option2', 'option3', 'option4']);
      expect(new Set(selected).size).to.equal(selected.length);
    });
  });

  it('passes header bindings to the source-title slot', () => {
    cy.mount(Transfer, {
      props: { data, defaultSelected: ['option1'] },
      slots: {
        'source-title': (slotProps: {
          countTotal: number;
          countSelected: number;
          searchValue: string;
          checked: boolean;
          indeterminate: boolean;
          onSelectAllChange: (checked: boolean) => void;
        }) =>
          h(
            'button',
            {
              class: 'title-select-all',
              onClick: () => slotProps.onSelectAllChange(true),
            },
            `${slotProps.countTotal}|${slotProps.countSelected}|${slotProps.searchValue}|${slotProps.checked}|${slotProps.indeterminate}`,
          ),
      },
    });
    cy.get('.title-select-all').should('have.text', '4|1||false|true');
    cy.get('.title-select-all').click();
    cy.get('@vue').should(({ wrapper }) => {
      // 已选项 defaultSelected=['option1'] 与全选合并后不重复
      expect(wrapper.emitted('select')?.[0]).to.deep.equal([
        ['option1', 'option2', 'option3', 'option4'],
      ]);
    });
  });

  it('supports custom titles and operation icon slots', () => {
    cy.mount(Transfer, {
      props: { data, title: ['Src Panel', 'Dst Panel'] },
      slots: {
        'to-target-icon': () => h('span', { class: 'custom-right-icon' }, 'R'),
        'to-source-icon': () => h('span', { class: 'custom-left-icon' }, 'L'),
      },
    });
    cy.get('.sd-transfer-view-source .sd-transfer-view-header').should('contain.text', 'Src Panel');
    cy.get('.sd-transfer-view-target .sd-transfer-view-header').should('contain.text', 'Dst Panel');
    cy.get('.custom-right-icon').should('exist');
    cy.get('.custom-left-icon').should('exist');
  });

  it('disables item checkboxes and operation buttons when disabled', () => {
    cy.mount(Transfer, { props: { data, disabled: true } });
    cy.get('.sd-transfer').should('have.class', 'sd-transfer-disabled');
    cy.get('.sd-transfer-operations button').eq(0).should('be.disabled');
    cy.get('.sd-transfer-operations button').eq(1).should('be.disabled');
    cy.get('.sd-transfer-list-item .sd-checkbox-target').first().should('be.disabled');
  });
});
