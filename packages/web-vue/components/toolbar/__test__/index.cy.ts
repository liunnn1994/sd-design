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
});
