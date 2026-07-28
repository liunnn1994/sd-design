import { h } from 'vue';

import Select from '../index';

const open = () => cy.get('.sd-select-view').click();

describe('Select', () => {
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

  it('renders the default option with performant ellipsis', () => {
    cy.mount(Select, { props: { options: ['Beijing long long long', 'Shanghai'] } });
    open();
    cy.get('.sd-select-option .sd-ellipsis').should('exist');
  });

  it('does not wrap a custom option slot with performant ellipsis', () => {
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
    cy.get('.custom-label').should('have.text', 'City:Beijing');
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

  it('renders a single label without a native title', () => {
    cy.mount(Select, {
      props: { defaultValue: 'Beijing', options: ['Beijing', 'Shanghai', 'Guangzhou'] },
    });
    cy.get('.sd-select-view').should('not.have.attr', 'title');
    cy.get('.sd-ellipsis').should('exist');
  });
});
