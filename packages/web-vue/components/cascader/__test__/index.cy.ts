import { h } from 'vue';

import Cascader from '../cascader.vue';

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
});
