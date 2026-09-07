import { h } from 'vue';

import Cascader from '../cascader.vue';
import { CascaderPanel } from '../index';

const options = [
  {
    value: 'beijing',
    label: 'Beijing',
    children: [
      { value: 'chaoyang', label: 'ChaoYang' },
      { value: 'haidian', label: 'Haidian' },
    ],
  },
  {
    value: 'shanghai',
    label: 'Shanghai',
    children: [{ value: 'huangpu', label: 'Huangpu' }],
  },
];

const mountCascader = (opts: Record<string, unknown>) => cy.mount(Cascader, opts);

describe('Cascader', () => {
  it('opens without a transition root warning', () => {
    cy.window().then((win) => {
      cy.spy(win.console, 'warn').as('consoleWarn');
    });

    mountCascader({ props: { options } });
    cy.get('input').click();
    cy.get('.sd-cascader-dropdown-panel').should('be.visible');
    cy.get('@consoleWarn').should((consoleWarn) => {
      expect(consoleWarn).not.to.have.been.calledWithMatch(
        Cypress.sinon.match('Component inside <Transition> renders non-element root node'),
      );
    });
  });

  it('opens the panel from a custom trigger slot', () => {
    mountCascader({
      props: { options, defaultValue: 'haidian' },
      slots: {
        trigger: (scope: any) =>
          h(
            'button',
            { class: 'custom-trigger' },
            `${scope.displayValue}|${scope.selectedPaths[0]?.length}|${scope.popupVisible}`,
          ),
      },
    });
    cy.get('.sd-select-view').should('not.exist');
    cy.get('.custom-trigger').should('have.text', 'Beijing / Haidian|2|false');
    cy.get('.custom-trigger').click();
    cy.get('.custom-trigger').should('have.text', 'Beijing / Haidian|2|true');
    cy.get('.sd-cascader-dropdown-panel').should('be.visible');
  });

  it('passes spinProps to the loading panel', () => {
    mountCascader({
      props: {
        options,
        loading: true,
        defaultPopupVisible: true,
        spinProps: { tip: '级联加载中', dot: true },
      },
    });
    cy.get('.sd-cascader-panel .sd-dot-loading').should('exist');
    cy.get('.sd-cascader-panel .sd-spin-tip').should('have.text', '级联加载中');
  });

  it('supports the show alias (update:show & showChange)', () => {
    mountCascader({ props: { show: false, options } });
    cy.get('input').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:show')?.[0]).to.deep.equal([true]);
      expect(wrapper.emitted('showChange')?.[0]).to.deep.equal([true]);
    });
  });

  it('trigger exposes aria-haspopup=menu and aria-expanded', () => {
    mountCascader({ props: { options } });
    cy.get('.sd-select-view').should('have.attr', 'aria-haspopup', 'menu');
    cy.get('.sd-select-view').should('have.attr', 'aria-expanded', 'false');
    // combobox 语义落到可聚焦的 input（经 inputAttrs）
    cy.get('input').should('have.attr', 'role', 'combobox');
    cy.get('input').should('have.attr', 'aria-haspopup', 'menu');
    cy.get('input').should('have.attr', 'aria-expanded', 'false');
  });

  it('supports the filterable alias', () => {
    mountCascader({
      props: { options, filterable: true, inputValue: 'hai', defaultPopupVisible: true },
    });
    cy.get('.sd-cascader-search-panel').should('contain.text', 'Haidian');
  });

  it('supports the clearable alias', () => {
    mountCascader({ props: { options, clearable: true, defaultValue: 'chaoyang' } });
    cy.get('.sd-select-view-clear-btn').should('exist');
  });

  it('supports showPath and separator', () => {
    mountCascader({ props: { options, defaultValue: 'chaoyang', showPath: true } });
    // RichLineClamp 根节点内含 aria-hidden 测量探针（全文副本），断言可见文本而非根节点 textContent
    cy.get('.sd-select-view-value [data-part="body"]').should('have.text', 'Beijing / ChaoYang');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ showPath: false })));
    cy.get('.sd-select-view-value [data-part="body"]').should('have.text', 'ChaoYang');
    cy.get('@vue').then(({ wrapper }) =>
      cy.wrap(wrapper.setProps({ showPath: true, separator: ' | ' })),
    );
    cy.get('.sd-select-view-value [data-part="body"]').should('have.text', 'Beijing | ChaoYang');
  });

  it('renders multiple tags with responsive maxTagCount', () => {
    mountCascader({
      props: {
        options,
        multiple: true,
        maxTagCount: 'responsive',
        defaultValue: ['chaoyang', 'haidian'],
      },
    });
    cy.get('.sd-select-view-tag').should(($tags) => {
      expect($tags.length).to.be.greaterThan(0);
    });
  });

  it('renders every default option with Ellipsis', () => {
    mountCascader({ props: { options, defaultPopupVisible: true } });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findAllComponents({ name: 'Ellipsis' })).to.have.length(2);
      expect(wrapper.findComponent({ name: 'PerformantEllipsis' }).exists()).to.equal(false);
    });
  });

  it('left-aligns option button content', () => {
    mountCascader({ props: { options, defaultPopupVisible: true } });
    cy.get('.sd-cascader-option').should('have.css', 'text-align', 'left');
  });

  it('supports performant and disabled option ellipsis modes', () => {
    mountCascader({
      props: {
        options,
        defaultPopupVisible: true,
        ellipsis: 'performant-ellipsis',
      },
    });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findAllComponents({ name: 'PerformantEllipsis' })).to.have.length(2);
    });
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ ellipsis: false })));
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent({ name: 'Ellipsis' }).exists()).to.equal(false);
      expect(wrapper.findComponent({ name: 'PerformantEllipsis' }).exists()).to.equal(false);
    });
  });

  it('renders the option slot and ignores the option render function', () => {
    mountCascader({
      props: {
        options,
        defaultPopupVisible: true,
        optionRender: (option: { label: string }) =>
          h('span', { class: 'legacy-render' }, `Legacy:${option.label}`),
      },
      slots: {
        option: ({ data }: { data: { label: string } }) =>
          h('span', { class: 'custom-option' }, `Slot:${data.label}`),
      },
    });
    cy.get('.custom-option').first().should('have.text', 'Slot:Beijing');
    cy.get('.legacy-render').should('not.exist');
  });

  it('renders the dropdown panel', () => {
    mountCascader({ props: { options, defaultPopupVisible: true } });
    cy.get('.sd-cascader-dropdown-panel').should('exist');
    cy.get('.sd-cascader-option').first().click();
  });

  it('emits change event on selection', () => {
    mountCascader({ props: { options, defaultPopupVisible: true } });
    cy.get('.sd-cascader-option').first().click();
    cy.get('.sd-cascader-option').eq(2).click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[0]).to.deep.equal(['chaoyang']);
    });
  });

  it('emits change event in path mode', () => {
    mountCascader({ props: { options, pathMode: true, defaultPopupVisible: true } });
    cy.get('.sd-cascader-option').first().click();
    cy.get('.sd-cascader-option').eq(2).click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[0]).to.deep.equal([['beijing', 'chaoyang']]);
    });
  });

  it('emits change event in multiple mode', () => {
    mountCascader({ props: { options, multiple: true, defaultPopupVisible: true } });
    cy.get('.sd-cascader-option').first().click();
    cy.get('.sd-checkbox').eq(2).click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[0]).to.deep.equal([['chaoyang']]);
    });
  });

  it('supports keyboard navigation', () => {
    mountCascader({ props: { options, defaultPopupVisible: true } });
    cy.get('input').type('{downarrow}', { force: true });
    cy.get('.sd-cascader-option-active').should('contain.text', 'Beijing');
    cy.get('input').type('{rightarrow}', { force: true });
    cy.get('.sd-cascader-panel-column').should('have.length', 2);
    cy.get('input').type('{downarrow}{enter}', { force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[0]).to.deep.equal(['haidian']);
    });
  });

  it('emits update:modelValue with change and closes the popup on selection', () => {
    mountCascader({ props: { options, defaultPopupVisible: true } });
    cy.get('.sd-cascader-option').first().click();
    cy.get('.sd-cascader-option').eq(2).click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:modelValue')?.[0]).to.deep.equal(['chaoyang']);
      expect(wrapper.emitted('change')?.[0]).to.deep.equal(['chaoyang']);
      expect(wrapper.emitted('popupVisibleChange')?.at(-1)).to.deep.equal([false]);
      expect(wrapper.emitted('update:popupVisible')?.at(-1)).to.deep.equal([false]);
    });
  });

  it('emits popupVisibleChange / update:popupVisible on open and Esc close', () => {
    mountCascader({ props: { options } });
    cy.get('input').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('popupVisibleChange')?.[0]).to.deep.equal([true]);
      expect(wrapper.emitted('update:popupVisible')?.[0]).to.deep.equal([true]);
    });
    cy.get('input').type('{esc}', { force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('popupVisibleChange')?.at(-1)).to.deep.equal([false]);
      expect(wrapper.emitted('update:popupVisible')?.at(-1)).to.deep.equal([false]);
    });
  });

  it('does not open the panel and hides clear when disabled', () => {
    mountCascader({
      props: { options, disabled: true, allowClear: true, defaultValue: 'chaoyang' },
    });
    cy.get('.sd-select-view').should('have.class', 'sd-select-view-disabled');
    cy.get('input').should('have.attr', 'disabled');
    cy.get('.sd-select-view-clear-btn').should('not.exist');
    cy.get('.sd-select-view').click();
    // 禁用时不渲染下拉面板
    cy.get('.sd-cascader-dropdown-panel').should('not.exist');
  });

  it('does not expand or select a disabled option', () => {
    mountCascader({
      props: {
        defaultPopupVisible: true,
        options: [
          {
            value: 'beijing',
            label: 'Beijing',
            disabled: true,
            children: [{ value: 'chaoyang', label: 'ChaoYang' }],
          },
        ],
      },
    });
    // .sd-cascader-option 本身就是 <button>
    cy.get('.sd-cascader-option').first().click({ force: true });
    cy.get('.sd-cascader-panel-column').should('have.length', 1);
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.equal(undefined);
    });
  });

  it('clears a single value and emits clear + change with allowClear', () => {
    mountCascader({ props: { options, allowClear: true, defaultValue: 'chaoyang' } });
    cy.get('.sd-select-view-clear-btn').should('exist');
    cy.get('.sd-select-view-clear-btn').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('clear')).to.have.length(1);
      expect(wrapper.emitted('change')?.[0]).to.deep.equal(['']);
    });
  });

  it('keeps disabled options when clearing in multiple mode', () => {
    mountCascader({
      props: {
        options: [
          {
            value: 'beijing',
            label: 'Beijing',
            children: [
              { value: 'chaoyang', label: 'ChaoYang', disabled: true },
              { value: 'haidian', label: 'Haidian' },
            ],
          },
          {
            value: 'shanghai',
            label: 'Shanghai',
            children: [{ value: 'huangpu', label: 'Huangpu' }],
          },
        ],
        multiple: true,
        allowClear: true,
        defaultValue: ['chaoyang', 'haidian'],
      },
    });
    cy.get('.sd-select-view-clear-btn').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('clear')).to.have.length(1);
      expect(wrapper.emitted('change')?.[0]).to.deep.equal([['chaoyang']]);
    });
  });

  it('updates the value when a tag is closed in multiple mode', () => {
    mountCascader({ props: { options, multiple: true, defaultValue: ['chaoyang', 'haidian'] } });
    cy.get('.sd-select-view-tag').first().find('.sd-tag-close-btn').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[0]).to.deep.equal([['haidian']]);
      expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).to.deep.equal(['haidian']);
    });
  });

  it('emits focus and blur from the trigger input', () => {
    mountCascader({ props: { options } });
    cy.get('input').focus();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('focus')).to.have.length(1);
    });
    cy.get('input').blur();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('blur')).to.have.length(1);
    });
  });

  it('renders a placeholder on the trigger input', () => {
    mountCascader({ props: { options, placeholder: 'Please pick' } });
    cy.get('input').should('have.attr', 'placeholder', 'Please pick');
  });

  it('filters leaf options by search input and emits inputValueChange + search', () => {
    mountCascader({ props: { options, allowSearch: true, defaultPopupVisible: true } });
    cy.get('input').type('hai');
    // 'hai' 命中 Haidian 与 Shanghai
    cy.get('.sd-cascader-search-option').should('have.length', 2);
    cy.get('.sd-cascader-search-option').should('contain.text', 'Haidian');
    cy.get('.sd-cascader-search-option').should('contain.text', 'Shanghai');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('inputValueChange')?.at(-1)).to.deep.equal(['hai']);
      // search 经过 debounce（默认 500ms），should 重试机制等待其触发
      expect(wrapper.emitted('search')?.[0]).to.deep.equal(['hai']);
    });
  });

  it('shows only the option label in search results with searchOptionOnlyLabel', () => {
    mountCascader({
      props: {
        options,
        allowSearch: true,
        searchOptionOnlyLabel: true,
        inputValue: 'hai',
        defaultPopupVisible: true,
      },
    });
    cy.get('.sd-cascader-search-option')
      .first()
      .should(($el) => {
        expect($el.text()).to.contain('Haidian');
        expect($el.text()).to.not.contain('Beijing');
      });
  });

  it('supports a custom filterOption', () => {
    mountCascader({
      props: {
        options,
        allowSearch: true,
        inputValue: 'a',
        defaultPopupVisible: true,
        filterOption: (inputValue: string, option: { label?: string }) =>
          option.label === 'Huangpu' && inputValue === 'a',
      },
    });
    cy.get('.sd-cascader-search-option').should('have.length', 1);
    cy.get('.sd-cascader-search-option').should('contain.text', 'Huangpu');
  });

  it('renders the empty slot when options are empty', () => {
    mountCascader({
      props: { options: [], defaultPopupVisible: true },
      slots: { empty: () => h('div', { class: 'custom-empty' }, 'No data here') },
    });
    cy.get('.sd-cascader-list-empty').should('contain.text', 'No data here');
    cy.get('.custom-empty').should('be.visible');
  });

  it('renders the empty slot in the search panel when nothing matches', () => {
    mountCascader({
      props: { options, allowSearch: true, inputValue: 'zzz', defaultPopupVisible: true },
      slots: { empty: () => h('div', { class: 'custom-empty' }, 'Nothing matched') },
    });
    cy.get('.sd-cascader-search-panel .sd-cascader-list-empty').should(
      'contain.text',
      'Nothing matched',
    );
  });

  it('selects any node via radio with checkStrictly (single)', () => {
    mountCascader({ props: { options, checkStrictly: true, defaultPopupVisible: true } });
    cy.get('.sd-cascader-option').find('.sd-checkbox').should('not.exist');
    cy.get('.sd-cascader-option').find('.sd-radio').should('have.length', 2);
    cy.get('.sd-cascader-option').first().find('.sd-radio').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[0]).to.deep.equal(['beijing']);
    });
  });

  it('checks parent nodes independently in multiple + checkStrictly mode', () => {
    mountCascader({
      props: { options, multiple: true, checkStrictly: true, defaultPopupVisible: true },
    });
    cy.get('.sd-cascader-option').first().find('.sd-checkbox').click();
    cy.get('@vue').should(({ wrapper }) => {
      // checkStrictly 下选中父节点不再级联叶子
      expect(wrapper.emitted('change')?.[0]).to.deep.equal([['beijing']]);
    });
    cy.get('.sd-cascader-option').should('contain.text', 'ChaoYang');
    cy.contains('.sd-cascader-option', 'Haidian').find('.sd-checkbox').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[1]).to.deep.equal([['beijing', 'haidian']]);
    });
  });

  it('loads children lazily via loadMore', () => {
    mountCascader({
      props: {
        options: [{ value: 'beijing', label: 'Beijing', isLeaf: false }],
        loadMore: (_option: unknown, done: (children?: unknown[]) => void) => {
          setTimeout(() => done([{ value: 'chaoyang', label: 'ChaoYang', isLeaf: true }]), 30);
        },
      },
    });
    cy.get('input').click();
    cy.get('.sd-cascader-option').first().click();
    cy.contains('.sd-cascader-option', 'ChaoYang').should('be.visible');
    cy.get('.sd-cascader-panel-column').should('have.length', 2);
    cy.contains('.sd-cascader-option', 'ChaoYang').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[0]).to.deep.equal(['chaoyang']);
    });
  });

  it('expands columns on hover with expandTrigger=hover', () => {
    mountCascader({ props: { options, expandTrigger: 'hover', defaultPopupVisible: true } });
    cy.get('.sd-cascader-panel-column').should('have.length', 1);
    cy.get('.sd-cascader-option').first().trigger('mouseenter');
    cy.get('.sd-cascader-panel-column').should('have.length', 2);
    cy.get('.sd-cascader-panel-column').eq(1).should('contain.text', 'ChaoYang');
  });

  it('exposes aria-haspopup / aria-expanded on option buttons', () => {
    mountCascader({ props: { options, defaultPopupVisible: true } });
    cy.contains('.sd-cascader-option', 'Beijing')
      .should('have.attr', 'aria-haspopup', 'true')
      .should('have.attr', 'aria-expanded', 'false');
    cy.contains('.sd-cascader-option', 'Beijing').click();
    cy.contains('.sd-cascader-option', 'Beijing').should('have.attr', 'aria-expanded', 'true');
    // 叶子节点 aria-haspopup=false
    cy.contains('.sd-cascader-option', 'Haidian').should('have.attr', 'aria-haspopup', 'false');
  });

  it('renders options from custom fieldNames', () => {
    mountCascader({
      props: {
        options: [{ id: 'beijing', name: 'Beijing', sub: [{ id: 'chaoyang', name: 'ChaoYang' }] }],
        fieldNames: { value: 'id', label: 'name', children: 'sub' },
        defaultValue: 'chaoyang',
      },
    });
    cy.get('.sd-select-view-value [data-part="body"]').should('have.text', 'Beijing / ChaoYang');
  });

  it('falls back to the raw value for unknown values', () => {
    mountCascader({ props: { options, defaultValue: 'notexist' } });
    cy.get('.sd-select-view-value [data-part="body"]').should('have.text', 'notexist');
    cy.get('@vue').then(({ wrapper }) =>
      cy.wrap(wrapper.setProps({ fallback: (value: unknown) => `Missing:${value}` })),
    );
    cy.get('.sd-select-view-value [data-part="body"]').should('have.text', 'Missing:notexist');
  });

  it('supports formatLabel for the display value', () => {
    mountCascader({
      props: {
        options,
        defaultValue: 'chaoyang',
        formatLabel: (opts: { label?: string }[]) => opts.map((o) => o.label).join('>'),
      },
    });
    cy.get('.sd-select-view-value [data-part="body"]').should('have.text', 'Beijing>ChaoYang');
  });

  it('updates the display when the controlled modelValue changes', () => {
    mountCascader({ props: { options, modelValue: 'chaoyang' } });
    cy.get('.sd-select-view-value [data-part="body"]').should('have.text', 'Beijing / ChaoYang');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ modelValue: 'haidian' })));
    cy.get('.sd-select-view-value [data-part="body"]').should('have.text', 'Beijing / Haidian');
  });

  describe('CascaderPanel', () => {
    it('emits change on leaf click', () => {
      cy.mount(CascaderPanel, { props: { options } });
      // 先展开 Beijing，再点击叶子 ChaoYang
      cy.get('.sd-cascader-option').eq(0).click();
      cy.contains('.sd-cascader-option', 'ChaoYang').click();
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('change')?.[0]).to.deep.equal(['chaoyang']);
        expect(wrapper.emitted('update:modelValue')?.[0]).to.deep.equal(['chaoyang']);
      });
    });

    it('supports keyboard navigation and selection', () => {
      cy.mount(CascaderPanel, { props: { options } });
      cy.get('.sd-cascader-panel').trigger('keydown', { key: 'ArrowDown' });
      cy.get('.sd-cascader-option-active').should('contain.text', 'Beijing');
      cy.get('.sd-cascader-panel').trigger('keydown', { key: 'ArrowRight' });
      cy.get('.sd-cascader-panel-column').should('have.length', 2);
      cy.get('.sd-cascader-panel').trigger('keydown', { key: 'Enter' });
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('change')?.[0]).to.deep.equal(['chaoyang']);
      });
    });
  });
});
