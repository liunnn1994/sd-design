import Toolbar, { type ToolbarInstance } from '../index';

const SEARCH_TEXT = '查询';
const RESET_TEXT = '重置';

describe('Toolbar', () => {
  it('renders schema-driven filter items and default action buttons', () => {
    cy.mount(Toolbar, {
      props: { schemas: [{ field: 'name', label: '名称', type: 'input' }] },
    });
    cy.get('.sd-toolbar').should('exist');
    cy.get('input').should('exist');
    cy.contains('button', SEARCH_TEXT).should('exist');
    cy.contains('button', RESET_TEXT).should('exist');
  });

  it('emits search when the search button is clicked', () => {
    cy.mount(Toolbar, {
      props: { modelValue: { name: 'foo' }, schemas: [{ field: 'name', type: 'input' }] },
    });
    cy.contains('button', SEARCH_TEXT).click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('search')?.[0]?.[0]).to.deep.equal({ name: 'foo' });
    });
  });

  it('emits search when Enter is pressed inside the toolbar', () => {
    cy.mount(Toolbar, {
      props: { modelValue: { name: 'bar' }, schemas: [{ field: 'name', type: 'input' }] },
    });
    cy.get('input').type('{enter}');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('search')?.[0]?.[0]).to.deep.equal({ name: 'bar' });
    });
  });

  it('does not duplicate button actions when they are activated with Enter', () => {
    const onSearch = cy.spy().as('onSearch');
    const onReset = cy.spy().as('onReset');
    cy.mount(Toolbar, {
      props: { modelValue: { name: 'value' }, onSearch, onReset },
    });

    cy.contains('button', SEARCH_TEXT).focus().type('{enter}');
    cy.get('@onSearch').should('have.been.calledOnce');

    cy.contains('button', RESET_TEXT).focus().type('{enter}');
    cy.get('@onReset').should('have.been.calledOnce');
    cy.get('@onSearch').should('have.been.calledOnce');
  });

  it('does not search from multiline or composing input', () => {
    const onSearch = cy.spy().as('onSearch');
    cy.mount(Toolbar, {
      props: { onSearch },
      slots: { default: '<textarea class="notes"></textarea>' },
    });
    cy.get('.notes').type('{enter}');
    cy.get('@onSearch').should('not.have.been.called');

    cy.get('.notes').trigger('keydown', { key: 'Enter', isComposing: true });
    cy.get('@onSearch').should('not.have.been.called');
  });

  it('toggles the action buttons with show-search / show-reset', () => {
    cy.mount(Toolbar, {
      props: { showSearch: false, showReset: false, schemas: [{ field: 'name', type: 'input' }] },
    });
    cy.contains('button', SEARCH_TEXT).should('not.exist');
    cy.contains('button', RESET_TEXT).should('not.exist');
  });

  it('forwards searchBtn and resetBtn to the built-in buttons', () => {
    cy.mount(Toolbar, {
      props: {
        searchBtn: { disabled: true },
        resetBtn: { disabled: true },
      },
    });
    cy.contains('button', SEARCH_TEXT).should('be.disabled');
    cy.contains('button', RESET_TEXT).should('be.disabled');
  });

  it('renders the default slot and skips the schema form', () => {
    cy.mount(Toolbar, {
      props: { schemas: [{ field: 'name', type: 'input' }] },
      slots: { default: '<div class="custom-filter">自定义筛选项</div>' },
    });
    cy.get('.custom-filter').should('exist');
    cy.get('input').should('not.exist');
  });

  it('forwards a named schema slot into the form item', () => {
    cy.mount(Toolbar, {
      props: { modelValue: {}, schemas: [{ field: 'keyword', slotName: 'keyword' }] },
      slots: { keyword: '<span class="keyword-slot">关键字自定义</span>' },
    });
    cy.get('.keyword-slot').should('exist');
  });

  it('exposed search() and reset() drive events', () => {
    cy.mount(Toolbar, { props: { modelValue: { name: 'baz' } } });
    cy.get('@vue').then(({ wrapper }) => {
      (wrapper.vm as unknown as ToolbarInstance).search();
    });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('search')?.[0]?.[0]).to.deep.equal({ name: 'baz' });
    });
    cy.get('@vue').then(({ wrapper }) => {
      (wrapper.vm as unknown as ToolbarInstance).reset();
    });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('reset')).to.have.length(1);
    });
  });

  it('reset restores the initial model and preserves skipped keys', () => {
    cy.mount(Toolbar, {
      props: {
        modelValue: { name: 'init', page: 1 },
        resetSkipKeys: ['page'],
        schemas: [{ field: 'name', type: 'input' }],
      },
    });
    cy.get('@vue').then(({ wrapper }) =>
      cy.wrap(wrapper.setProps({ modelValue: { name: 'changed', page: 3, extra: 'x' } })),
    );
    cy.get('@vue').then(({ wrapper }) => {
      (wrapper.vm as unknown as ToolbarInstance).reset();
    });
    cy.get('@vue').should(({ wrapper }) => {
      const updateEvents = wrapper.emitted('update:modelValue');
      expect(updateEvents?.at(-1)?.[0]).to.deep.equal({ name: 'init', page: 3 });
    });
  });

  it('does not render the expand toggle when allow-expand is disabled', () => {
    cy.mount(Toolbar, {
      props: { allowExpand: false, schemas: [{ field: 'name', type: 'input' }] },
    });
    cy.get('.sd-toolbar-expand').should('not.exist');
  });

  it('passes spinProps to the loading overlay', () => {
    cy.clock();
    cy.mount(Toolbar, {
      props: { loading: true, spinProps: { delay: 100, tip: '筛选项加载中' } },
    });
    cy.get('.sd-spin-mask').should('not.exist');
    cy.tick(100);
    cy.get('.sd-spin-mask').should('exist');
    cy.get('.sd-spin-tip').should('have.text', '筛选项加载中');
  });

  it('shows the loading mask immediately without a spin delay', () => {
    cy.mount(Toolbar, { props: { loading: true } });
    cy.get('.sd-spin-mask').should('exist');
  });

  it('hides the whole actions area with show-actions false', () => {
    cy.mount(Toolbar, {
      props: { showActions: false, schemas: [{ field: 'name', type: 'input' }] },
    });
    cy.get('.sd-toolbar-actions').should('not.exist');
    cy.contains('button', SEARCH_TEXT).should('not.exist');
  });

  it('toggles the bottom divider with show-border-bottom', () => {
    cy.mount(Toolbar, { props: { schemas: [{ field: 'name', type: 'input' }] } });
    cy.get('.sd-toolbar').should('have.class', 'sd-toolbar-with-border');

    cy.mount(Toolbar, { props: { showBorderBottom: false } });
    cy.get('.sd-toolbar').should('not.have.class', 'sd-toolbar-with-border');
  });

  it('supports custom search and reset texts', () => {
    cy.mount(Toolbar, {
      props: { searchText: '搜索', resetText: '清空' },
    });
    cy.contains('button', '搜索').should('exist');
    cy.contains('button', '清空').should('exist');
    cy.contains('button', SEARCH_TEXT).should('not.exist');
    cy.contains('button', RESET_TEXT).should('not.exist');
  });

  it('replaces built-in actions with the extra slot', () => {
    cy.mount(Toolbar, {
      slots: { extra: '<span class="toolbar-extra">导出</span>' },
    });
    cy.get('.toolbar-extra').should('exist');
    cy.contains('button', SEARCH_TEXT).should('not.exist');
    cy.contains('button', RESET_TEXT).should('not.exist');
  });

  it('supports the action-prepend and action-append slots', () => {
    cy.mount(Toolbar, {
      slots: {
        'action-prepend': '<span class="action-prepend-slot">前置</span>',
        'action-append': '<span class="action-append-slot">后置</span>',
      },
    });
    cy.get('.action-prepend-slot').should('exist');
    cy.get('.action-append-slot').should('exist');
    cy.contains('button', SEARCH_TEXT).should('exist');
    cy.contains('button', RESET_TEXT).should('exist');
  });

  it('search emits the live model after typing', () => {
    // JsonForm mutates the bound object in place (no update:modelValue while typing),
    // so search must carry the mutated live object.
    cy.mount(Toolbar, {
      props: { modelValue: { name: '' }, schemas: [{ field: 'name', type: 'input' }] },
    });
    cy.get('input').type('abc');
    cy.contains('button', SEARCH_TEXT).click();
    cy.get('@vue').should(({ wrapper }) => {
      const searchEvents = wrapper.emitted('search');
      const searchPayload = searchEvents?.[0]?.[0];
      expect(searchPayload).to.deep.equal({ name: 'abc' });
    });
  });

  it('exposed reset(false) updates the model without emitting reset', () => {
    cy.mount(Toolbar, { props: { modelValue: { name: 'a' } } });
    cy.get('@vue').then(({ wrapper }) => {
      (wrapper.vm as unknown as ToolbarInstance).reset(false);
    });
    cy.get('@vue').should(({ wrapper }) => {
      const updates = wrapper.emitted('update:modelValue');
      const lastUpdate = updates?.at(-1)?.[0];
      expect(lastUpdate).to.deep.equal({ name: 'a' });
      expect(wrapper.emitted('reset')).to.equal(undefined);
    });
  });

  it('exposes layout CSS variables and the max-width body modifier', () => {
    cy.mount(Toolbar, {
      props: { itemHeight: 40, spanWidth: 180, itemMaxWidth: '320px' },
    });
    cy.get('.sd-toolbar').then(($el) => {
      const style = ($el[0] as HTMLElement).style;
      expect(style.getPropertyValue('--toolbar-item-height')).to.equal('40px');
      expect(style.getPropertyValue('--toolbar-span-width')).to.equal('180px');
      expect(style.getPropertyValue('--toolbar-item-max-width')).to.equal('320px');
    });
    cy.get('.sd-toolbar-body').should('have.class', 'sd-toolbar-body--max-width');
  });

  it('shows the expand toggle on overflow and toggles expand/collapse', () => {
    cy.mount(Toolbar, {
      props: { allowExpand: true, itemHeight: 32 },
      slots: { default: '<div class="tall-content" style="height:100px">内容</div>' },
    });
    cy.get('.sd-toolbar-expand').should('exist');
    cy.get('.sd-toolbar-expand-text').should('contain.text', '展开');
    cy.get('.sd-toolbar').then(($el) => {
      const maxHeight = ($el[0] as HTMLElement).style.getPropertyValue('--toolbar-body-max-height');
      expect(maxHeight).to.equal('32px');
    });
    cy.get('.sd-toolbar-expand').click();
    cy.get('.sd-toolbar-expand-text').should('contain.text', '收起');
    cy.get('.sd-toolbar').then(($el) => {
      const maxHeight = ($el[0] as HTMLElement).style.getPropertyValue('--toolbar-body-max-height');
      expect(maxHeight).to.not.equal('32px');
    });
    cy.get('.sd-toolbar-expand').click();
    cy.get('.sd-toolbar-expand-text').should('contain.text', '展开');
    cy.get('.sd-toolbar').then(($el) => {
      const maxHeight = ($el[0] as HTMLElement).style.getPropertyValue('--toolbar-body-max-height');
      expect(maxHeight).to.equal('32px');
    });
  });

  it('starts expanded with default-expand', () => {
    cy.mount(Toolbar, {
      props: { allowExpand: true, defaultExpand: true },
      slots: { default: '<div class="tall-content" style="height:100px">内容</div>' },
    });
    cy.get('.sd-toolbar-expand-text').should('contain.text', '收起');
    cy.get('.sd-toolbar-expand-icon').should('have.class', 'sd-toolbar-expand-icon--up');
  });

  it('supports custom expand/collapse texts and a custom expand icon', () => {
    cy.mount(Toolbar, {
      props: { allowExpand: true, expandText: '更多', collapseText: '更少' },
      slots: {
        'default': '<div class="tall-content" style="height:100px">内容</div>',
        'expand-icon': '<span class="custom-expand-icon">^</span>',
      },
    });
    cy.get('.sd-toolbar-expand-text').should('have.text', '更多');
    cy.get('.custom-expand-icon').should('exist');
    cy.get('.sd-toolbar-expand').click();
    cy.get('.sd-toolbar-expand-text').should('contain.text', '更少');
  });
});
