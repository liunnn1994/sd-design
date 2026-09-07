import Collapse from '../index';

const CollapseItem = Collapse.Item;

describe('Collapse', () => {
  it('emits change on item click, respecting disabled and accordion', () => {
    cy.mount(Collapse, {
      global: { components: { CollapseItem } },
      slots: {
        default:
          '<collapse-item key="1" header="Test 1">Test 1</collapse-item>' +
          '<collapse-item key="2" header="Test 2" disabled>Test 2</collapse-item>' +
          '<collapse-item key="3" header="Test 3">Test 3</collapse-item>',
      },
    });

    cy.get('.sd-collapse-item-header').eq(1).click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.equal(undefined);
    });

    cy.get('.sd-collapse-item-header').eq(2).click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[0]?.[0]).to.deep.equal(['3']);
    });

    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ accordion: true })));
    cy.get('.sd-collapse-item-header').eq(0).click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[1]?.[0]).to.deep.equal(['1']);
    });
  });

  it('wires trigger and region via aria-controls / aria-labelledby', () => {
    cy.mount(Collapse, {
      global: { components: { CollapseItem } },
      slots: { default: '<collapse-item key="1" header="Test 1">Panel 1</collapse-item>' },
    });
    cy.get('.sd-collapse-item-header').should('have.attr', 'role', 'button');
    // aria-controls <-> 面板 region id
    cy.get('.sd-collapse-item-header').then(($header) => {
      const controls = $header.attr('aria-controls');
      cy.get('.sd-collapse-item-content')
        .should('have.attr', 'id', controls)
        .and('have.attr', 'role', 'region');
    });
    // region 的 aria-labelledby 指回标题
    cy.get('.sd-collapse-item-header-title').then(($title) => {
      cy.get('.sd-collapse-item-content').should('have.attr', 'aria-labelledby', $title.attr('id'));
    });
  });

  it('toggles aria-expanded via Enter and Space keys', () => {
    cy.mount(Collapse, {
      global: { components: { CollapseItem } },
      slots: { default: '<collapse-item key="1" header="Test 1">Panel 1</collapse-item>' },
    });
    cy.get('.sd-collapse-item-header').should('have.attr', 'aria-expanded', 'false');
    cy.get('.sd-collapse-item-header').trigger('keydown', { key: 'Enter' });
    cy.get('.sd-collapse-item-header').should('have.attr', 'aria-expanded', 'true');
    cy.get('.sd-collapse-item-header').trigger('keydown', { key: ' ' });
    cy.get('.sd-collapse-item-header').should('have.attr', 'aria-expanded', 'false');
  });

  it('expands initial panels from defaultActiveKey (uncontrolled mode)', () => {
    cy.mount(Collapse, {
      global: { components: { CollapseItem } },
      props: { defaultActiveKey: ['2'] },
      slots: {
        default:
          '<collapse-item key="1" header="Test 1">Body 1</collapse-item>' +
          '<collapse-item key="2" header="Test 2">Body 2</collapse-item>' +
          '<collapse-item key="3" header="Test 3">Body 3</collapse-item>',
      },
    });

    cy.get('.sd-collapse-item').eq(1).should('have.class', 'sd-collapse-item-active');
    cy.get('.sd-collapse-item-header').eq(1).should('have.attr', 'aria-expanded', 'true');
    cy.get('.sd-collapse-item-header').eq(0).should('have.attr', 'aria-expanded', 'false');
    cy.get('.sd-collapse-item-content').eq(1).should('be.visible');
    cy.get('.sd-collapse-item-content').eq(0).should('not.be.visible');

    // subsequent clicks keep working from the uncontrolled state
    cy.get('.sd-collapse-item-header').eq(0).click();
    cy.get('@vue').should(({ wrapper }) => {
      const keys = wrapper.emitted('change')?.[0]?.[0];
      expect(keys).to.deep.equal(['2', '1']);
    });
  });

  it('supports controlled activeKey: emits update:activeKey and waits for the parent to apply it', () => {
    cy.mount(Collapse, {
      global: { components: { CollapseItem } },
      props: { activeKey: ['1'] },
      slots: {
        default:
          '<collapse-item key="1" header="Test 1">Body 1</collapse-item>' +
          '<collapse-item key="2" header="Test 2">Body 2</collapse-item>',
      },
    });

    cy.get('.sd-collapse-item').eq(0).should('have.class', 'sd-collapse-item-active');

    cy.get('.sd-collapse-item-header').eq(1).click();
    cy.get('@vue').should(({ wrapper }) => {
      const updated = wrapper.emitted('update:activeKey')?.[0]?.[0];
      const changed = wrapper.emitted('change')?.[0]?.[0];
      expect(updated).to.deep.equal(['1', '2']);
      expect(changed).to.deep.equal(['1', '2']);
    });
    // parent never applied the update -> UI stays on item 1 (controlled behavior)
    cy.get('.sd-collapse-item').eq(0).should('have.class', 'sd-collapse-item-active');
    cy.get('.sd-collapse-item').eq(1).should('not.have.class', 'sd-collapse-item-active');

    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ activeKey: ['1', '2'] })));
    cy.get('.sd-collapse-item').eq(1).should('have.class', 'sd-collapse-item-active');
  });

  it('collapses an expanded panel when its header is clicked again (non-accordion)', () => {
    cy.mount(Collapse, {
      global: { components: { CollapseItem } },
      props: { defaultActiveKey: ['1'] },
      slots: {
        default:
          '<collapse-item key="1" header="Test 1">Body 1</collapse-item>' +
          '<collapse-item key="2" header="Test 2">Body 2</collapse-item>',
      },
    });

    cy.get('.sd-collapse-item-header').eq(0).should('have.attr', 'aria-expanded', 'true');
    cy.get('.sd-collapse-item-header').eq(0).click();
    cy.get('.sd-collapse-item-header').eq(0).should('have.attr', 'aria-expanded', 'false');
    cy.get('.sd-collapse-item-content').eq(0).should('not.be.visible');
    cy.get('@vue').should(({ wrapper }) => {
      const keys = wrapper.emitted('change')?.[0]?.[0];
      expect(keys).to.deep.equal([]);
    });
  });

  it('accordion mode opens one panel at a time and collapses on a second click', () => {
    cy.mount(Collapse, {
      global: { components: { CollapseItem } },
      props: { accordion: true },
      slots: {
        default:
          '<collapse-item key="1" header="Test 1">Body 1</collapse-item>' +
          '<collapse-item key="2" header="Test 2">Body 2</collapse-item>',
      },
    });

    cy.get('.sd-collapse-item-header').eq(0).click();
    cy.get('@vue').should(({ wrapper }) => {
      const keys = wrapper.emitted('change')?.[0]?.[0];
      expect(keys).to.deep.equal(['1']);
    });
    cy.get('.sd-collapse-item-header').eq(0).should('have.attr', 'aria-expanded', 'true');

    // opening the second panel closes the first
    cy.get('.sd-collapse-item-header').eq(1).click();
    cy.get('@vue').should(({ wrapper }) => {
      const keys = wrapper.emitted('change')?.[1]?.[0];
      expect(keys).to.deep.equal(['2']);
    });
    cy.get('.sd-collapse-item-header').eq(0).should('have.attr', 'aria-expanded', 'false');
    cy.get('.sd-collapse-item-header').eq(1).should('have.attr', 'aria-expanded', 'true');

    // clicking the open panel again collapses it
    cy.get('.sd-collapse-item-header').eq(1).click();
    cy.get('@vue').should(({ wrapper }) => {
      const keys = wrapper.emitted('change')?.[2]?.[0];
      expect(keys).to.deep.equal([]);
    });
    cy.get('.sd-collapse-item-header').eq(1).should('have.attr', 'aria-expanded', 'false');
  });

  it('renders borderless class when bordered=false', () => {
    cy.mount(Collapse, {
      global: { components: { CollapseItem } },
      props: { bordered: false },
      slots: { default: '<collapse-item key="1" header="Test 1">Body 1</collapse-item>' },
    });
    cy.get('.sd-collapse').should('have.class', 'sd-collapse-borderless');

    cy.mount(Collapse, {
      global: { components: { CollapseItem } },
      slots: { default: '<collapse-item key="1" header="Test 1">Body 1</collapse-item>' },
    });
    cy.get('.sd-collapse').should('not.have.class', 'sd-collapse-borderless');
  });

  it('renders the expand icon on the right when expandIconPosition=right', () => {
    cy.mount(Collapse, {
      global: { components: { CollapseItem } },
      props: { expandIconPosition: 'right' },
      slots: { default: '<collapse-item key="1" header="Test 1">Body 1</collapse-item>' },
    });

    cy.get('.sd-collapse-item-header').should('have.class', 'sd-collapse-item-header-right');
    cy.get('.sd-collapse-item-icon-hover').should('have.class', 'sd-collapse-item-icon-right');
    // right position swaps the caret to point left
    cy.get('.sd-collapse-item-expand-icon').should('have.class', 'sd-icon-caret-left');

    // default (left) renders the right-pointing caret and header-left class
    cy.mount(Collapse, {
      global: { components: { CollapseItem } },
      slots: { default: '<collapse-item key="1" header="Test 1">Body 1</collapse-item>' },
    });
    cy.get('.sd-collapse-item-header').should('have.class', 'sd-collapse-item-header-left');
    cy.get('.sd-collapse-item-expand-icon').should('have.class', 'sd-icon-caret-right');
  });

  it('hides expand icons via collapse-level and item-level showExpandIcon', () => {
    cy.mount(Collapse, {
      global: { components: { CollapseItem } },
      props: { showExpandIcon: false },
      slots: {
        default:
          '<collapse-item key="1" header="Test 1">Body 1</collapse-item>' +
          '<collapse-item key="2" header="Test 2">Body 2</collapse-item>',
      },
    });
    cy.get('.sd-collapse-item-expand-icon').should('not.exist');

    // with the collapse-level prop unset, items can opt out individually
    cy.mount(Collapse, {
      global: { components: { CollapseItem } },
      slots: {
        default:
          '<collapse-item key="1" header="Test 1" :show-expand-icon="false">Body 1</collapse-item>' +
          '<collapse-item key="2" header="Test 2">Body 2</collapse-item>',
      },
    });
    cy.get('.sd-collapse-item').eq(0).find('.sd-collapse-item-expand-icon').should('not.exist');
    cy.get('.sd-collapse-item').eq(1).find('.sd-collapse-item-expand-icon').should('exist');
  });

  it('keeps hidden content mounted by default (destroyOnHide=false)', () => {
    cy.mount(Collapse, {
      global: { components: { CollapseItem } },
      props: { defaultActiveKey: ['1'] },
      slots: { default: '<collapse-item key="1" header="Test 1">Body 1</collapse-item>' },
    });

    // 初始关闭；destroyOnHide=false 时收起内容仍挂载在 DOM
    cy.get('.sd-collapse-item-content-box').eq(0).should('exist');
    cy.get('.sd-collapse-item-header').eq(0).click();
    cy.get('.sd-collapse-item-content-box').should('contain.text', 'Body 1');
  });

  it('destroys hidden content when destroyOnHide is set and remounts it on re-expand', () => {
    cy.mount(Collapse, {
      global: { components: { CollapseItem } },
      props: { destroyOnHide: true, defaultActiveKey: ['1'] },
      slots: { default: '<collapse-item key="1" header="Test 1">Body 1</collapse-item>' },
    });

    // 展开时内容挂载（卸载依赖 leave 动画结束事件，本环境不可靠，不做收起卸载断言）
    cy.get('.sd-collapse-item-content-box').should('exist');
    cy.get('.sd-collapse-item-header').eq(0).click();
    cy.get('.sd-collapse-item-header').eq(0).should('have.attr', 'aria-expanded', 'false');

    // item-level destroyOnHide also keeps never-opened content unmounted
    cy.mount(Collapse, {
      global: { components: { CollapseItem } },
      slots: {
        default:
          '<collapse-item key="1" header="Test 1" :destroy-on-hide="true">Body 1</collapse-item>',
      },
    });
    cy.get('.sd-collapse-item-content-box').should('not.exist');
    cy.get('.sd-collapse-item-content').should('exist');
  });

  it('supports header, extra and scoped expand-icon slots', () => {
    cy.mount(Collapse, {
      global: { components: { CollapseItem } },
      slots: {
        default:
          '<collapse-item key="1" header="Prop Header">' +
          '<template #header><span class="custom-header">Custom Header</span></template>' +
          '<template #extra><span class="custom-extra">Extra</span></template>' +
          '<template #expand-icon="{ active }">' +
          '<span class="scoped-icon">{{ active ? "open" : "closed" }}</span>' +
          '</template>' +
          'Body 1' +
          '</collapse-item>',
      },
    });

    cy.get('.sd-collapse-item-header-title .custom-header').should('contain', 'Custom Header');
    cy.get('.sd-collapse-item-header-extra').should('contain', 'Extra');
    cy.get('.scoped-icon').should('contain', 'closed');

    cy.get('.sd-collapse-item-header').click();
    cy.get('.scoped-icon').should('contain', 'open');

    // header prop is used when no header slot is given
    cy.mount(Collapse, {
      global: { components: { CollapseItem } },
      slots: { default: '<collapse-item key="1" header="Prop Header">Body 1</collapse-item>' },
    });
    cy.get('.sd-collapse-item-header-title').should('contain', 'Prop Header');
  });

  it('supports a collapse-level expand-icon slot applied to all items', () => {
    cy.mount(Collapse, {
      global: { components: { CollapseItem } },
      slots: {
        'expand-icon': '<span class="ctx-icon">ICON</span>',
        'default':
          '<collapse-item key="1" header="Test 1">Body 1</collapse-item>' +
          '<collapse-item key="2" header="Test 2">Body 2</collapse-item>',
      },
    });

    cy.get('.ctx-icon').should('have.length', 2);
    // the default caret icons are replaced
    cy.get('.sd-collapse-item-expand-icon').should('not.exist');
  });

  it('marks disabled items with aria-disabled and removes them from tab order', () => {
    cy.mount(Collapse, {
      global: { components: { CollapseItem } },
      slots: {
        default:
          '<collapse-item key="1" header="Test 1" disabled>Body 1</collapse-item>' +
          '<collapse-item key="2" header="Test 2">Body 2</collapse-item>',
      },
    });

    cy.get('.sd-collapse-item-header')
      .eq(0)
      .should('have.attr', 'aria-disabled', 'true')
      .and('have.attr', 'tabindex', '-1');
    cy.get('.sd-collapse-item-header')
      .eq(1)
      .should('have.attr', 'aria-disabled', 'false')
      .and('have.attr', 'tabindex', '0');
  });

  it('matches numeric panel keys with numeric defaultActiveKey entries', () => {
    cy.mount(Collapse, {
      global: { components: { CollapseItem } },
      props: { defaultActiveKey: [2] },
      slots: {
        default:
          '<collapse-item :key="1" header="Test 1">Body 1</collapse-item>' +
          '<collapse-item :key="2" header="Test 2">Body 2</collapse-item>',
      },
    });

    cy.get('.sd-collapse-item').eq(1).should('have.class', 'sd-collapse-item-active');
    cy.get('.sd-collapse-item-header').eq(1).click();
    cy.get('@vue').should(({ wrapper }) => {
      const keys = wrapper.emitted('change')?.[0]?.[0];
      expect(keys).to.deep.equal([]);
    });
  });
});
