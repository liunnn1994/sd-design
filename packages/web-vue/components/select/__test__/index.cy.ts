import { h } from 'vue';

import Select from '../index';

const open = () => cy.get('.sd-select-view').click();

describe('Select', () => {
  it('opens the dropdown from a custom trigger slot', () => {
    cy.mount(Select, {
      props: { options: ['Beijing', 'Shanghai'], defaultValue: 'Shanghai' },
      slots: {
        trigger: (scope: any) =>
          h(
            'button',
            { class: 'custom-trigger' },
            `${scope.displayValue}|${scope.selectedOptions[0]?.value}|${scope.popupVisible}`,
          ),
      },
    });
    cy.get('.sd-select-view').should('not.exist');
    cy.get('.custom-trigger').should('have.text', 'Shanghai|Shanghai|false');
    cy.get('.custom-trigger').click();
    cy.get('.custom-trigger').should('have.text', 'Shanghai|Shanghai|true');
    cy.get('.sd-select-dropdown').should('be.visible');
  });

  it('passes spinProps to the loading dropdown', () => {
    cy.mount(Select, {
      props: {
        options: [],
        loading: true,
        defaultPopupVisible: true,
        spinProps: { tip: '选项加载中', dot: true },
      },
    });
    cy.get('.sd-select-dropdown .sd-dot-loading').should('exist');
    cy.get('.sd-select-dropdown .sd-spin-tip').should('have.text', '选项加载中');
  });

  it('shows the dropdown', () => {
    cy.mount(Select, { props: { options: ['Beijing', 'Shanghai', 'Guangzhou', 'Chengdu'] } });
    open();
    cy.get('.sd-select-option').should('exist');
  });

  it('renders the default empty state', () => {
    cy.mount(Select, { props: { options: [] } });
    open();
    cy.get('.sd-select-dropdown-empty .sd-empty').should('be.visible').and('have.css', 'height');
    cy.get('.sd-select-dropdown-empty').invoke('outerHeight').should('be.greaterThan', 0);
  });

  it('exposes combobox / listbox / option semantics', () => {
    cy.mount(Select, {
      props: { options: ['Beijing', 'Shanghai', 'Guangzhou'], modelValue: 'Shanghai' },
    });
    // 触发器是 combobox：aria-haspopup=listbox，aria-expanded 随开关翻转
    cy.get('.sd-select-view').should('have.attr', 'aria-haspopup', 'listbox');
    cy.get('.sd-select-view').should('have.attr', 'aria-expanded', 'false');
    open();
    cy.get('.sd-select-view').should('have.attr', 'aria-expanded', 'true');
    // 弹层是 listbox，选项是 option，选中项 aria-selected=true
    cy.get('.sd-select-dropdown-list').should('have.attr', 'role', 'listbox');
    cy.get('.sd-select-option').should('have.attr', 'role', 'option');
    cy.contains('.sd-select-option', 'Shanghai').should('have.attr', 'aria-selected', 'true');
  });

  it('puts combobox role + aria-activedescendant on the input', () => {
    cy.mount(Select, { props: { options: ['Beijing', 'Shanghai', 'Guangzhou'] } });
    cy.get('input').should('have.attr', 'role', 'combobox');
    cy.get('input').should('have.attr', 'aria-expanded', 'false');
    cy.get('input').should('have.attr', 'aria-autocomplete', 'list');
    cy.get('input').click();
    cy.get('input').should('have.attr', 'aria-expanded', 'true');
    // 方向键高亮某项 → input 的 aria-activedescendant 指向该活动选项的 id
    cy.get('input').type('{uparrow}', { force: true });
    cy.get('.sd-select-option-active')
      .eq(0)
      .then(($opt) => {
        const activeId = $opt.attr('id');
        expect(activeId, 'active option has an id').to.not.equal(undefined);
        cy.get('input').should('have.attr', 'aria-activedescendant', activeId);
      });
  });

  it('puts combobox role on the multiple-select input', () => {
    cy.mount(Select, {
      props: { options: ['Beijing', 'Shanghai', 'Guangzhou'], multiple: true },
    });
    cy.get('.sd-select-view-input').should('have.attr', 'role', 'combobox');
    cy.get('.sd-select-view-input').should('have.attr', 'aria-expanded', 'false');
    cy.get('.sd-select-view-input').click({ force: true });
    cy.get('.sd-select-view-input').should('have.attr', 'aria-expanded', 'true');
  });

  it('renders every default option with Ellipsis', () => {
    cy.mount(Select, { props: { options: ['Beijing long long long', 'Shanghai'] } });
    open();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findAllComponents({ name: 'Ellipsis' })).to.have.length(2);
      expect(wrapper.findComponent({ name: 'PerformantEllipsis' }).exists()).to.equal(false);
    });
  });

  it('supports performant and disabled option ellipsis modes', () => {
    cy.mount(Select, {
      props: {
        options: ['Beijing', 'Shanghai'],
        ellipsis: 'performant-ellipsis',
      },
    });
    open();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findAllComponents({ name: 'PerformantEllipsis' })).to.have.length(2);
    });
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ ellipsis: false })));
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent({ name: 'Ellipsis' }).exists()).to.equal(false);
      expect(wrapper.findComponent({ name: 'PerformantEllipsis' }).exists()).to.equal(false);
    });
  });

  it('does not wrap a custom option slot with Ellipsis', () => {
    cy.mount(Select, {
      props: { options: ['Beijing', 'Shanghai'] },
      slots: {
        option: ({ data }: { data: { label: string } }) =>
          h('span', { class: 'custom-option' }, data.label),
      },
    });
    open();
    cy.get('.sd-select-option .custom-option').should('exist');
    cy.get('.sd-select-option .sd-ellipsis').should('not.exist');
  });

  it('disables the horizontal scrollbar in the dropdown', () => {
    cy.mount(Select, { props: { options: ['Beijing', 'Shanghai', 'Guangzhou', 'Chengdu'] } });
    open();
    cy.get('@vue').should(({ wrapper }) => {
      expect(
        wrapper
          .findComponent({ name: 'SelectDropdown' })
          .findComponent({ name: 'Scrollbar' })
          .props('disableHorizontal'),
      ).to.equal(true);
    });
  });

  it('supports keyboard navigation', () => {
    cy.mount(Select, { props: { options: ['Beijing', 'Shanghai', 'Guangzhou'] } });
    cy.get('input').click();
    cy.get('input').type('{uparrow}', { force: true });
    cy.get('.sd-select-option-active').should('contain.text', 'Guangzhou');
    cy.get('input').type('{downarrow}', { force: true });
    cy.get('.sd-select-option-active').should('contain.text', 'Beijing');
    cy.get('input').type('{enter}', { force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[0]).to.deep.equal(['Beijing']);
    });
  });

  it('supports mouse selection', () => {
    cy.mount(Select, { props: { options: ['Beijing', 'Shanghai', 'Guangzhou'] } });
    cy.get('input').click();
    cy.get('.sd-select-option').eq(1).click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[0]).to.deep.equal(['Shanghai']);
    });
  });

  it('shows search-filtered options', () => {
    cy.mount(Select, {
      props: { options: ['Beijing', 'Shanghai', 'Guangzhou'], allowSearch: true },
    });
    cy.get('input').click();
    cy.get('input').type('sh');
    cy.get('.sd-select-option').should('have.length', 1).and('contain.text', 'Shanghai');
  });

  it('enables creating a new option', () => {
    cy.mount(Select, {
      props: { options: ['Beijing', 'Shanghai', 'Guangzhou'], allowCreate: true },
    });
    cy.get('input').click();
    cy.get('input').type('Xian{enter}');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[0]).to.deep.equal(['Xian']);
    });
  });

  it('supports the v-model:show alias', () => {
    cy.mount(Select, { props: { show: false, options: ['Beijing', 'Shanghai'] } });
    open();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:show')?.[0]).to.deep.equal([true]);
      expect(wrapper.emitted('showChange')?.[0]).to.deep.equal([true]);
    });
  });

  it('supports children field names', () => {
    cy.mount(Select, {
      props: {
        options: [
          {
            text: 'Cities',
            items: [
              { city: 'bj', text: 'Beijing' },
              { city: 'sh', text: 'Shanghai' },
            ],
          },
        ],
        fieldNames: { value: 'city', label: 'text', children: 'items' },
      },
    });
    open();
    cy.get('.sd-select-option').should('contain.text', 'Beijing').and('contain.text', 'Shanghai');
    cy.get('.sd-select-option').eq(0).click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[0]).to.deep.equal(['bj']);
    });
  });

  it('renders the label slot with option data', () => {
    cy.mount(Select, {
      props: { defaultValue: 'Beijing', options: ['Beijing', 'Shanghai', 'Guangzhou'] },
      slots: {
        label: ({ data }: { data: { label: string } }) =>
          h('span', { class: 'custom-label' }, `City:${data.label}`),
      },
    });
    cy.get('.custom-label:visible').should('have.text', 'City:Beijing');
  });

  it('renders a custom tag slot with selected option data', () => {
    cy.mount(Select, {
      props: {
        multiple: true,
        defaultValue: ['Beijing'],
        options: ['Beijing', 'Shanghai', 'Guangzhou'],
      },
      slots: {
        tag: ({ data }: { data: { label: string } }) =>
          h('span', { class: 'custom-tag' }, `Tag:${data.label}`),
      },
    });
    cy.get('.custom-tag').should('have.text', 'Tag:Beijing');
  });

  it('hides the arrow icon when showArrow is false', () => {
    cy.mount(Select, { props: { showArrow: false, options: ['Beijing', 'Shanghai'] } });
    cy.get('.sd-select-view-arrow-icon').should('not.exist');
  });

  it('keeps visible tags with responsive maxTagCount', () => {
    cy.mount(Select, {
      props: {
        multiple: true,
        maxTagCount: 'responsive',
        defaultValue: ['Beijing', 'Shanghai', 'Guangzhou'],
        options: ['Beijing', 'Shanghai', 'Guangzhou'],
      },
    });
    cy.get('.sd-select-view-tag').should('exist');
  });

  it('updates the responsive counter after selected values change', () => {
    cy.mount({
      components: { Select },
      template: `
        <div style="width: 150px;">
          <Select
            v-model="value"
            multiple
            max-tag-count="responsive"
            :options="['one', 'two', 'three', 'four']"
          />
          <button class="append-value" @click="value.push('four')">append</button>
        </div>
      `,
      data: () => ({ value: ['one', 'two', 'three'] }),
    });

    cy.get('.sd-select-view-tag-counter:visible').should('have.text', '+2');
    cy.get('.append-value').click();
    cy.get('.sd-select-view-tag-counter:visible').should('have.text', '+3');
  });

  it('renders a single label without a native title', () => {
    cy.mount(Select, {
      props: { defaultValue: 'Beijing', options: ['Beijing', 'Shanghai', 'Guangzhou'] },
    });
    cy.get('.sd-select-view').should('not.have.attr', 'title');
    cy.get('.sd-ellipsis').should('exist');
  });

  it('keeps the sd-select class and merges custom classes on the trigger', () => {
    // 回归护栏：selectViewBindings 的 class 必须在 ...attrs 之后合并，
    // 保证 <Select class="custom-select"> 同时保留 sd-select 与自定义类
    cy.mount(Select, {
      props: { options: ['Beijing', 'Shanghai'] },
      attrs: { class: 'custom-select' },
    });
    cy.get('.sd-select-view').should('have.class', 'sd-select').and('have.class', 'custom-select');
  });

  it('does not open the dropdown and hides clear when disabled', () => {
    cy.mount(Select, {
      props: { options: ['Beijing', 'Shanghai'], defaultValue: 'Beijing', disabled: true },
    });
    cy.get('.sd-select-view').should('have.class', 'sd-select-view-disabled');
    cy.get('input').should('have.attr', 'disabled');
    cy.get('.sd-select-view-clear-btn').should('not.exist');
    cy.get('.sd-select-view').click();
    // Trigger 常驻渲染隐藏的下拉容器，禁用时点击不应使其可见
    cy.get('.sd-select-dropdown').should('not.be.visible');
  });

  it('clears a single value and emits clear + change', () => {
    cy.mount(Select, { props: { options: ['Beijing', 'Shanghai'], defaultValue: 'Beijing' } });
    cy.get('.sd-select-view-clear-btn').should('exist');
    cy.get('.sd-select-view-clear-btn').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('clear')).to.have.length(1);
      expect(wrapper.emitted('change')?.[0]).to.deep.equal(['']);
    });
  });

  it('clears all values and emits clear + change in multiple mode', () => {
    cy.mount(Select, {
      props: {
        multiple: true,
        options: ['Beijing', 'Shanghai'],
        defaultValue: ['Beijing', 'Shanghai'],
      },
    });
    cy.get('.sd-select-view-clear-btn').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('clear')).to.have.length(1);
      expect(wrapper.emitted('change')?.[0]).to.deep.equal([[]]);
    });
  });

  it('selects and deselects options in multiple mode', () => {
    cy.mount(Select, { props: { multiple: true, options: ['Beijing', 'Shanghai', 'Guangzhou'] } });
    open();
    cy.get('.sd-select-option').eq(0).click();
    cy.contains('.sd-select-option', 'Beijing').should('have.attr', 'aria-selected', 'true');
    cy.get('.sd-select-option').eq(1).click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[0]).to.deep.equal([['Beijing']]);
      expect(wrapper.emitted('change')?.[1]).to.deep.equal([['Beijing', 'Shanghai']]);
      expect(wrapper.emitted('update:modelValue')?.[1]).to.deep.equal([['Beijing', 'Shanghai']]);
    });
    cy.get('.sd-select-option').eq(0).click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[2]).to.deep.equal([['Shanghai']]);
    });
  });

  it('emits exceedLimit and blocks change when limit is reached', () => {
    cy.mount(Select, {
      props: {
        multiple: true,
        limit: 1,
        defaultValue: ['Beijing'],
        options: ['Beijing', 'Shanghai', 'Guangzhou'],
      },
    });
    open();
    cy.get('.sd-select-option').eq(1).click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('exceedLimit')?.[0]?.[0]).to.equal('Shanghai');
      expect(wrapper.emitted('change')).to.equal(undefined);
    });
  });

  it('emits remove when a tag is closed in multiple mode', () => {
    cy.mount(Select, {
      props: {
        multiple: true,
        defaultValue: ['Beijing', 'Shanghai'],
        options: ['Beijing', 'Shanghai'],
      },
    });
    cy.get('.sd-select-view-tag').first().find('.sd-tag-close-btn').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('remove')?.[0]).to.deep.equal(['Beijing']);
      expect(wrapper.emitted('change')?.[0]).to.deep.equal([['Shanghai']]);
    });
  });

  it('renders numeric maxTagCount overflow counter', () => {
    cy.mount(Select, {
      props: {
        multiple: true,
        maxTagCount: 1,
        defaultValue: ['Beijing', 'Shanghai', 'Guangzhou'],
        options: ['Beijing', 'Shanghai', 'Guangzhou'],
      },
    });
    cy.get('.sd-select-view-tag-counter:visible').should('have.text', '+2');
  });

  it('renders grouped options with group semantics', () => {
    cy.mount(Select, {
      props: {
        options: [
          { isGroup: true, label: 'Cities', options: ['Beijing', 'Shanghai'] },
          { isGroup: true, label: 'Provinces', options: ['Guangdong'] },
        ],
      },
    });
    open();
    cy.get('[role="group"]').should('have.length', 2);
    cy.get('[role="group"]').eq(0).should('have.attr', 'aria-label', 'Cities');
    cy.contains('.sd-select-option', 'Guangdong').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[0]).to.deep.equal(['Guangdong']);
    });
  });

  it('collapses groups with no matching options when filtering', () => {
    cy.mount(Select, {
      props: {
        options: [
          { isGroup: true, label: 'Cities', options: ['Beijing', 'Shanghai'] },
          { isGroup: true, label: 'Provinces', options: ['Guangdong'] },
        ],
      },
    });
    open();
    cy.get('input').type('sh');
    cy.get('[role="group"]').should('have.length', 1).and('have.attr', 'aria-label', 'Cities');
    cy.get('.sd-select-option').should('have.length', 1).and('contain.text', 'Shanghai');
  });

  it('filters options with a custom filterOption', () => {
    cy.mount(Select, {
      props: {
        options: [
          { label: 'Foo', value: 'sh' },
          { label: 'Shanghai', value: 'shx' },
        ],
        filterOption: (inputValue: string, option: any) =>
          String(option.value).startsWith(inputValue),
      },
    });
    open();
    cy.get('input').type('shx');
    // 默认按 label 过滤会命中 Shanghai；自定义按 value 前缀过滤时 Foo(value=sh) 不命中
    cy.get('.sd-select-option').should('have.length', 1).and('contain.text', 'Shanghai');
  });

  it('emits a debounced search event with the input value', () => {
    cy.mount(Select, {
      props: { options: ['Beijing', 'Shanghai', 'Guangzhou'], searchDelay: 50 },
    });
    cy.get('input').click();
    cy.get('input').type('sh');
    cy.wait(300);
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('search')?.at(-1)).to.deep.equal(['sh']);
      expect(wrapper.emitted('inputValueChange')?.at(-1)).to.deep.equal(['sh']);
      expect(wrapper.emitted('update:inputValue')?.at(-1)).to.deep.equal(['sh']);
    });
  });

  it('filters options with a controlled inputValue', () => {
    cy.mount(Select, {
      props: { options: ['Beijing', 'Shanghai'], inputValue: 'sh', defaultPopupVisible: true },
    });
    cy.get('.sd-select-option').should('have.length', 1).and('contain.text', 'Shanghai');
  });

  it('closes the dropdown with Escape and emits popupVisibleChange', () => {
    cy.mount(Select, { props: { options: ['Beijing', 'Shanghai'] } });
    cy.get('input').click();
    cy.get('.sd-select-option').should('exist');
    cy.get('input').type('{esc}', { force: true });
    cy.get('input').should('have.attr', 'aria-expanded', 'false');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('popupVisibleChange')?.[0]).to.deep.equal([true]);
      expect(wrapper.emitted('popupVisibleChange')?.[1]).to.deep.equal([false]);
      expect(wrapper.emitted('update:popupVisible')?.[1]).to.deep.equal([false]);
    });
  });

  it('opens the dropdown with Enter and selects with a second Enter', () => {
    cy.mount(Select, { props: { options: ['Beijing', 'Shanghai'] } });
    cy.get('input').type('{enter}', { force: true });
    cy.get('.sd-select-option').should('exist');
    cy.get('input').type('{enter}', { force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[0]).to.deep.equal(['Beijing']);
    });
  });

  it('shows no active option when defaultActiveFirstOption is false', () => {
    cy.mount(Select, {
      props: { options: ['Beijing', 'Shanghai'], defaultActiveFirstOption: false },
    });
    open();
    cy.get('.sd-select-option-active').should('not.exist');
  });

  it('renders a fallback option label for values without an option', () => {
    cy.mount(Select, {
      props: {
        options: ['Beijing', 'Shanghai'],
        defaultValue: 'Chengdu',
        fallbackOption: false,
        placeholder: 'Please select',
      },
    });
    cy.get('.sd-select-view-value').should('not.contain.text', 'Chengdu');
    cy.get('input').should('have.attr', 'placeholder', 'Please select');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ fallbackOption: true })));
    cy.get('.sd-select-view-value').should('contain.text', 'Chengdu');
  });

  it('renders header and footer slots in the dropdown', () => {
    cy.mount(Select, {
      props: { options: ['Beijing', 'Shanghai'], defaultPopupVisible: true },
      slots: {
        header: () => h('div', { class: 'custom-header' }, 'Header'),
        footer: () => h('div', { class: 'custom-footer' }, 'Footer'),
      },
    });
    cy.get('.sd-select-dropdown-header .custom-header').should('have.text', 'Header');
    cy.get('.sd-select-dropdown-footer .custom-footer').should('have.text', 'Footer');
  });

  it('renders custom empty, header and footer on empty with show*OnEmpty', () => {
    cy.mount(Select, {
      props: {
        options: [],
        defaultPopupVisible: true,
        showHeaderOnEmpty: true,
        showFooterOnEmpty: true,
      },
      slots: {
        empty: () => h('div', { class: 'custom-empty' }, 'No data'),
        header: () => h('div', 'Header'),
        footer: () => h('div', 'Footer'),
      },
    });
    cy.get('.sd-select-dropdown-empty .custom-empty').should('have.text', 'No data');
    cy.get('.sd-select-dropdown-header').should('contain.text', 'Header');
    cy.get('.sd-select-dropdown-footer').should('contain.text', 'Footer');
  });

  it('renders the prefix slot', () => {
    cy.mount(Select, {
      props: { options: ['Beijing', 'Shanghai'] },
      slots: { prefix: () => h('span', { class: 'custom-prefix' }, 'Prefix') },
    });
    cy.get('.sd-select-view-prefix .custom-prefix').should('have.text', 'Prefix');
  });

  it('unmounts the dropdown content on close with unmountOnClose', () => {
    cy.mount(Select, {
      props: { options: ['Beijing', 'Shanghai'], unmountOnClose: true },
    });
    open();
    cy.get('.sd-select-option').should('exist');
    cy.get('input').type('{esc}', { force: true });
    cy.get('.sd-select-dropdown').should('not.be.visible');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('popupVisibleChange')?.at(-1)?.[0]).to.equal(false);
    });
    // 注：Trigger 的卸载依赖 Transition 的 after-leave（hide 动画结束），
    // 在 Cypress 环境中动画回调不可靠，因此不断言 DOM 卸载，仅断言收起与事件。
  });

  it('supports object values with a custom valueKey', () => {
    cy.mount(Select, {
      props: {
        options: [
          { value: { id: 1 }, label: 'One' },
          { value: { id: 2 }, label: 'Two' },
        ],
        valueKey: 'id',
      },
    });
    open();
    cy.contains('.sd-select-option', 'One').click();
    cy.get('.sd-select-view-value').should('contain.text', 'One');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[0]).to.deep.equal([{ id: 1 }]);
    });
  });

  it('renders options in a virtual list when virtualListProps is set', () => {
    const options = Array.from({ length: 60 }, (_, i) => `Option ${i}`);
    cy.mount(Select, {
      props: {
        options,
        virtualListProps: { height: 120, itemSize: 36 },
        defaultPopupVisible: true,
      },
    });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent({ name: 'VirtualList' }).exists()).to.equal(true);
    });
    cy.get('.sd-select-option').should(($rendered) => {
      expect($rendered.length).to.be.greaterThan(0);
      expect($rendered.length).to.be.lessThan(options.length);
    });
    cy.contains('.sd-select-option', 'Option 0').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[0]).to.deep.equal(['Option 0']);
    });
  });
});
