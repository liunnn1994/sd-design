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

  it('shows defaultValue on mount', () => {
    cy.mount(AutoComplete, { props: { defaultValue: 'Chengdu', data: ['Chengdu'] } });
    cy.get('input').should('have.value', 'Chengdu');
  });

  it('binds modelValue and emits update:modelValue, change and search while typing', () => {
    cy.mount(AutoComplete, {
      props: { modelValue: 'Beijing', data: ['Beijing', 'Shanghai'] },
    });
    cy.get('input').should('have.value', 'Beijing');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ modelValue: 'Shanghai' })));
    cy.get('input').should('have.value', 'Shanghai');
    cy.get('input').type('x');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('search')?.at(-1)?.[0]).to.equal('Shanghaix');
      expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).to.equal('Shanghaix');
      expect(wrapper.emitted('change')?.at(-1)?.[0]).to.equal('Shanghaix');
    });
  });

  it('emits select with the option value and blurs the input when an option is clicked', () => {
    cy.mount(AutoComplete, {
      props: {
        data: [
          { value: 'beijing', label: 'Beijing' },
          { value: 'shanghai', label: 'Shanghai' },
        ],
      },
    });
    cy.get('input').focus();
    cy.get('input').type('Sh');
    cy.get('.sd-select-option').should('have.length', 1).click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('select')).to.deep.equal([['shanghai']]);
      expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).to.equal('shanghai');
      expect(wrapper.emitted('change')?.at(-1)?.[0]).to.equal('shanghai');
    });
    cy.get('input').should('have.value', 'shanghai');
    cy.get('input').should('not.be.focused');
  });

  it('filters case-insensitively by default', () => {
    cy.mount(AutoComplete, { props: { data: ['Beijing', 'Shanghai'] } });
    cy.get('input').focus();
    cy.get('input').type('BEI');
    cy.get('.sd-select-option').should('have.length', 1).and('contain', 'Beijing');
  });

  it('applies strict case-sensitive filtering for object options', () => {
    cy.mount(AutoComplete, {
      props: {
        strict: true,
        data: [{ value: 'beijing', label: 'Beijing' }],
      },
    });
    cy.get('input').focus();
    cy.get('.sd-select-option').should('have.length', 1);
    // 大写 BEI 不匹配（区分大小写）→ 无有效选项 → 弹层关闭
    cy.get('input').type('BEI');
    cy.get('.sd-select-dropdown').should('not.be.visible');
    // 回到空值后再输入小写 jing 可以命中
    cy.get('input').type('{backspace}{backspace}{backspace}');
    cy.get('input').should('have.value', '');
    cy.get('input').type('jing');
    cy.get('.sd-select-option').should('have.length', 1).and('contain', 'Beijing');
  });

  it('applies strict case-sensitive filtering for plain string data', () => {
    cy.mount(AutoComplete, {
      props: { strict: true, data: ['Beijing', 'Shanghai'] },
    });
    cy.get('input').focus();
    // 大写 BEI 不匹配（区分大小写）→ 无有效选项 → 弹层关闭
    cy.get('input').type('BEI');
    cy.get('.sd-select-dropdown').should('not.be.visible');
    cy.get('input').type('{backspace}{backspace}{backspace}');
    cy.get('input').type('jing');
    cy.get('.sd-select-option').should('have.length', 1).and('contain', 'Beijing');
  });

  it('applies strict filtering to options without a label by falling back to the value', () => {
    cy.mount(AutoComplete, {
      props: { strict: true, data: [{ value: 'beijing' }] },
    });
    cy.get('input').focus();
    // 缺 label 时与非 strict 路径一致地回退到 value 的字符串形式
    cy.get('input').type('bei');
    cy.get('.sd-select-option').should('have.length', 1).and('contain', 'beijing');
  });

  it('renders group data as group titles instead of selectable options', () => {
    cy.mount(AutoComplete, {
      props: {
        data: [{ isGroup: true, label: 'Cities', options: ['Beijing', 'Shanghai'] }, 'Chengdu'],
      },
    });
    cy.get('input').focus();
    cy.get('[role="group"]')
      .should('have.length', 1)
      .and('have.attr', 'aria-label', 'Cities')
      .should('contain.text', 'Cities');
    // 分组本身不是 option：role=option 只有组内选项和顶层选项
    cy.get('.sd-select-option').should('have.length', 3);
    // 点击分组标题不触发 select/change
    cy.get('.sd-select-group-title').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('select')).to.equal(undefined);
      expect(wrapper.emitted('change')).to.equal(undefined);
    });
    // 键盘高亮跳过分组标题，落在第一个真实选项上
    cy.get('.sd-select-option-active').should('contain.text', 'Beijing');
    // 点击组内选项正常选择
    cy.contains('.sd-select-option', 'Shanghai').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('select')?.[0]).to.deep.equal(['Shanghai']);
    });
  });

  it('shows all options when filterOption is false', () => {
    cy.mount(AutoComplete, {
      props: { filterOption: false, data: ['Beijing', 'Shanghai'] },
    });
    cy.get('input').focus();
    cy.get('input').type('zzz');
    cy.get('.sd-select-option').should('have.length', 2);
  });

  it('supports a custom filterOption function', () => {
    cy.mount(AutoComplete, {
      props: {
        data: [
          { value: 'beijing', label: 'Beijing' },
          { value: 'shanghai', label: 'Shanghai' },
        ],
        filterOption: (inputValue: string, option: any) =>
          String(option.label).startsWith(inputValue),
      },
    });
    cy.get('input').focus();
    cy.get('input').type('Sh');
    cy.get('.sd-select-option').should('have.length', 1).and('contain', 'Shanghai');
  });

  it('does not open the dropdown when no option matches the input', () => {
    cy.mount(AutoComplete, { props: { data: ['Beijing', 'Shanghai'] } });
    cy.get('input').focus();
    cy.get('.sd-select-option').should('have.length', 2);
    cy.get('input').type('zzz');
    cy.get('.sd-select-dropdown').should('not.be.visible');
    cy.get('input').should('have.attr', 'aria-expanded', 'false');
  });

  it('closes the dropdown with Escape and toggles aria-expanded', () => {
    cy.mount(AutoComplete, { props: { data: ['Beijing', 'Shanghai'] } });
    cy.get('input').should('have.attr', 'aria-expanded', 'false');
    cy.get('input').focus();
    cy.get('.sd-select-option').should('have.length', 2);
    cy.get('input').should('have.attr', 'aria-expanded', 'true');
    cy.get('input').type('{esc}');
    cy.get('input').should('have.attr', 'aria-expanded', 'false');
    cy.get('.sd-select-dropdown').should('not.be.visible');
  });

  it('emits clear and empties the value when the clear button is clicked', () => {
    cy.mount(AutoComplete, {
      props: { allowClear: true, defaultValue: 'Beijing', data: ['Beijing', 'Shanghai'] },
    });
    cy.get('.sd-input-clear-btn').click({ force: true });
    cy.get('input').should('have.value', '');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('clear')).to.have.length(1);
      expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).to.equal('');
      expect(wrapper.emitted('change')?.at(-1)?.[0]).to.equal('');
    });
  });

  it('does not open the dropdown when disabled', () => {
    cy.mount(AutoComplete, { props: { disabled: true, data: ['Beijing'] } });
    cy.get('input').should('be.disabled');
    cy.get('input').should('have.attr', 'aria-expanded', 'false');
    // 未打开时下拉面板不渲染
    cy.get('.sd-select-dropdown').should('not.exist');
  });

  it('does not open the dropdown when readonly', () => {
    cy.mount(AutoComplete, { props: { readonly: true, data: ['apple', 'banana'] } });
    cy.get('input').focus();
    cy.get('input').should('have.attr', 'aria-expanded', 'false');
    cy.get('.sd-select-dropdown').should('not.exist');
  });

  it('ignores clicks on disabled options', () => {
    cy.mount(AutoComplete, {
      props: {
        data: [
          { value: 'beijing', label: 'Beijing' },
          { value: 'shanghai', label: 'Shanghai', disabled: true },
        ],
      },
    });
    cy.get('input').focus();
    cy.get('.sd-select-option').should('have.length', 2);
    cy.get('.sd-select-option').eq(1).should('have.attr', 'aria-disabled', 'true').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('select')).to.equal(undefined);
      expect(wrapper.emitted('change')).to.equal(undefined);
    });
    cy.get('input').should('have.value', '');
  });

  it('renders the footer slot in the dropdown', () => {
    cy.mount(AutoComplete, {
      props: { data: ['Beijing', 'Shanghai'] },
      slots: { footer: () => h('div', { class: 'custom-footer' }, 'Footer') },
    });
    cy.get('input').focus();
    cy.get('.sd-select-dropdown .custom-footer').should('be.visible').and('have.text', 'Footer');
  });

  it('exposes focus and blur methods', () => {
    cy.mount(AutoComplete, { props: { data: ['Beijing', 'Shanghai'] } });
    cy.get('@vue').then(({ wrapper }) => (wrapper.vm as any).focus());
    cy.get('input').should('be.focused');
    cy.get('.sd-select-option').should('have.length', 2);
    cy.get('@vue').then(({ wrapper }) => (wrapper.vm as any).blur());
    cy.get('input').should('not.be.focused');
  });

  it('renders options through the virtual list when virtualListProps is set', () => {
    const data = Array.from({ length: 50 }, (_, index) => `Option ${index + 1}`);
    cy.mount(AutoComplete, {
      props: { data, virtualListProps: { height: 200 } },
    });
    cy.get('input').focus();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent({ name: 'VirtualList' }).exists()).to.equal(true);
    });
    // 虚拟列表只渲染可视区内的选项，而不是全部 50 个
    cy.get('.sd-select-option').should('have.length.lessThan', 50);
  });
});
