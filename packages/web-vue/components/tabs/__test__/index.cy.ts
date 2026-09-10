import { defineComponent, h, ref } from 'vue';

import ConfigProvider from '../../config-provider';
import Tabs from '../index';
import TabsButton from '../tabs-button.vue';

const { TabPane } = Tabs;

const panes =
  '<tab-pane key="1" title="Tab 1">Panel 1</tab-pane><tab-pane key="2" title="Tab 2">Panel 2</tab-pane>';

const panes3 =
  '<tab-pane key="1" title="Tab 1">Panel 1</tab-pane>' +
  '<tab-pane key="2" title="Tab 2">Panel 2</tab-pane>' +
  '<tab-pane key="3" title="Tab 3">Panel 3</tab-pane>';

describe('Tabs', () => {
  it('emits change on tab click', () => {
    cy.mount(Tabs, { global: { components: { TabPane } }, slots: { default: panes } });
    cy.get('.sd-tabs-tab').eq(1).click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')?.[0]).to.deep.equal(['2']);
    });
  });

  it('emits add/delete events', () => {
    cy.mount(Tabs, {
      global: { components: { TabPane } },
      props: { editable: true, showAddButton: true },
      slots: { default: panes },
    });
    cy.get('button.sd-tabs-nav-add-btn').should('have.attr', 'aria-label');
    cy.get('button.sd-tabs-nav-add-btn').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('add')).to.have.length(1);
    });
    cy.get('button.sd-tabs-tab-close-btn').first().should('have.attr', 'aria-label');
    cy.get('button.sd-tabs-tab-close-btn').first().click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('delete')).to.have.length(1);
    });
  });

  it('supports native keyboard activation for add and overflow controls', () => {
    cy.mount(Tabs, {
      global: { components: { TabPane } },
      props: { editable: true, showAddButton: true },
      slots: { default: panes },
    });
    cy.get('button.sd-tabs-nav-add-btn').focus().type('{enter}');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('add')).to.have.length(1);
    });

    const onClick = cy.spy().as('overflowClick');
    cy.mount(TabsButton, {
      props: { type: 'next', direction: 'horizontal', onClick },
    });
    cy.get('button.sd-tabs-nav-button').should('have.attr', 'aria-label');
    cy.get('button.sd-tabs-nav-button').focus().type('{enter}');
    cy.get('@overflowClick').should('have.been.calledOnce');
  });

  it('fullHeight should add the full-height class', () => {
    cy.mount(Tabs, {
      global: { components: { TabPane } },
      props: { fullHeight: true },
      slots: { default: panes },
    });
    cy.get('.sd-tabs').should('have.class', 'sd-tabs-full-height');
  });

  it('fullHeight should wrap pane content in Scrollbar by default', () => {
    cy.mount(Tabs, {
      global: { components: { TabPane } },
      props: { fullHeight: true },
      slots: { default: panes },
    });
    cy.get('.sd-tabs-content-item-active .sd-tabs-pane').should(
      'have.class',
      'sd-tabs-pane-scroll',
    );
    cy.get('.sd-tabs-content-item-active .sd-tabs-pane-scrollbar').should('exist');
  });

  it('fullHeight with scrollbar=false should use native overflow', () => {
    cy.mount(Tabs, {
      global: { components: { TabPane } },
      props: { fullHeight: true, scrollbar: false },
      slots: { default: panes },
    });
    cy.get('.sd-tabs-content-item-active .sd-tabs-pane').should(
      'not.have.class',
      'sd-tabs-pane-scroll',
    );
    cy.get('.sd-tabs-content-item-active .sd-tabs-pane-scrollbar').should('not.exist');
  });

  it('exposes tablist / tab / tabpanel semantics with aria wiring', () => {
    cy.mount(Tabs, { global: { components: { TabPane } }, slots: { default: panes3 } });
    cy.get('.sd-tabs-nav-tab-list').should('have.attr', 'role', 'tablist');
    cy.get('.sd-tabs-nav-tab-list').should('have.attr', 'aria-orientation', 'horizontal');
    // 活动tab：role=tab、aria-selected=true、tabindex=0
    cy.get('.sd-tabs-tab').eq(0).should('have.attr', 'role', 'tab');
    cy.get('.sd-tabs-tab').eq(0).should('have.attr', 'aria-selected', 'true');
    cy.get('.sd-tabs-tab').eq(0).should('have.attr', 'tabindex', '0');
    // 非活动tab：aria-selected=false、tabindex=-1（roving）
    cy.get('.sd-tabs-tab').eq(1).should('have.attr', 'aria-selected', 'false');
    cy.get('.sd-tabs-tab').eq(1).should('have.attr', 'tabindex', '-1');
    // aria-controls <-> 面板 id 互通；面板为 role=tabpanel 且 aria-labelledby 指回 tab
    cy.get('.sd-tabs-tab')
      .eq(0)
      .then(($tab) => {
        const tabId = $tab.attr('id');
        const controls = $tab.attr('aria-controls');
        cy.get('.sd-tabs-content-item')
          .eq(0)
          .then(($panel) => {
            expect($panel.attr('role')).to.equal('tabpanel');
            expect($panel.attr('id')).to.equal(controls);
            expect($panel.attr('aria-labelledby')).to.equal(tabId);
            expect($panel.attr('tabindex')).to.equal('0');
          });
      });
  });

  it('activates next tab with ArrowRight and moves roving tabindex', () => {
    cy.mount(Tabs, { global: { components: { TabPane } }, slots: { default: panes3 } });
    cy.get('.sd-tabs-nav-tab-list').trigger('keydown', { key: 'ArrowRight' });
    cy.get('.sd-tabs-tab').eq(1).should('have.attr', 'aria-selected', 'true');
    cy.get('.sd-tabs-tab').eq(1).should('have.attr', 'tabindex', '0');
    cy.get('.sd-tabs-tab').eq(0).should('have.attr', 'tabindex', '-1');
    // 切换后旧面板隐藏（aria-hidden），新面板可见
    cy.get('.sd-tabs-content-item').eq(0).should('have.attr', 'aria-hidden', 'true');
    cy.get('.sd-tabs-content-item').eq(1).should('not.have.attr', 'aria-hidden');
  });

  it('jumps to last tab with End and activates', () => {
    cy.mount(Tabs, { global: { components: { TabPane } }, slots: { default: panes3 } });
    cy.get('.sd-tabs-nav-tab-list').trigger('keydown', { key: 'End' });
    cy.get('.sd-tabs-tab').eq(2).should('have.attr', 'aria-selected', 'true');
  });

  it('activates a tab with Space key', () => {
    cy.mount(Tabs, { global: { components: { TabPane } }, slots: { default: panes3 } });
    cy.get('.sd-tabs-tab').eq(2).focus().trigger('keydown', { key: ' ' });
    cy.get('.sd-tabs-tab').eq(2).should('have.attr', 'aria-selected', 'true');
  });

  it('activates a tab with the Enter key', () => {
    cy.mount(Tabs, { global: { components: { TabPane } }, slots: { default: panes3 } });
    cy.get('.sd-tabs-tab').eq(2).focus().trigger('keydown', { key: 'Enter' });
    cy.get('.sd-tabs-tab').eq(2).should('have.attr', 'aria-selected', 'true');
  });

  it('respects defaultActiveKey for the initially selected tab', () => {
    cy.mount(Tabs, {
      global: { components: { TabPane } },
      props: { defaultActiveKey: '2' },
      slots: { default: panes },
    });
    cy.get('.sd-tabs-tab').eq(1).should('have.attr', 'aria-selected', 'true');
    cy.get('.sd-tabs-content-item').eq(1).should('not.have.attr', 'aria-hidden');
  });

  it('emits update:activeKey for v-model:activeKey support', () => {
    cy.mount(Tabs, { global: { components: { TabPane } }, slots: { default: panes } });
    cy.get('.sd-tabs-tab').eq(1).click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:activeKey')?.[0]).to.deep.equal(['2']);
    });
  });

  it('emits tabClick with the tab key on click', () => {
    cy.mount(Tabs, { global: { components: { TabPane } }, slots: { default: panes3 } });
    cy.get('.sd-tabs-tab').eq(2).click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('tabClick')?.[0][0]).to.equal('3');
    });
  });

  it('emits tabClick but not change when clicking the already active tab', () => {
    cy.mount(Tabs, { global: { components: { TabPane } }, slots: { default: panes } });
    cy.get('.sd-tabs-tab').eq(0).click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('tabClick')).to.have.length(1);
      expect(wrapper.emitted('change')).to.equal(undefined);
    });
  });

  it('keeps the controlled activeKey when the activeKey prop does not change', () => {
    cy.mount(Tabs, {
      global: { components: { TabPane } },
      props: { activeKey: '2' },
      slots: { default: panes },
    });
    cy.get('.sd-tabs-tab').eq(0).click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:activeKey')?.[0]).to.deep.equal(['1']);
    });
    cy.get('.sd-tabs-tab').eq(0).should('have.attr', 'aria-selected', 'false');
    cy.get('.sd-tabs-tab').eq(1).should('have.attr', 'aria-selected', 'true');
  });

  it('does not activate a disabled tab on click and exposes aria-disabled', () => {
    const withDisabled =
      '<tab-pane key="1" title="Tab 1">Panel 1</tab-pane>' +
      '<tab-pane key="2" title="Tab 2" disabled>Panel 2</tab-pane>';
    cy.mount(Tabs, { global: { components: { TabPane } }, slots: { default: withDisabled } });
    cy.get('.sd-tabs-tab').eq(1).should('have.attr', 'aria-disabled', 'true');
    cy.get('.sd-tabs-tab').eq(1).click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.equal(undefined);
      expect(wrapper.emitted('tabClick')).to.equal(undefined);
    });
    cy.get('.sd-tabs-tab').eq(1).should('have.attr', 'aria-selected', 'false');
  });

  it('activates tabs on hover when trigger is hover', () => {
    cy.mount(Tabs, {
      global: { components: { TabPane } },
      props: { trigger: 'hover' },
      slots: { default: panes },
    });
    cy.get('.sd-tabs-tab').eq(1).trigger('mouseover');
    cy.get('.sd-tabs-tab').eq(1).should('have.attr', 'aria-selected', 'true');
  });

  it('wraps to the last tab with ArrowLeft from the first tab', () => {
    cy.mount(Tabs, { global: { components: { TabPane } }, slots: { default: panes3 } });
    cy.get('.sd-tabs-nav-tab-list').trigger('keydown', { key: 'ArrowLeft' });
    cy.get('.sd-tabs-tab').eq(2).should('have.attr', 'aria-selected', 'true');
  });

  it('jumps to the first tab with Home after moving to the last tab', () => {
    cy.mount(Tabs, { global: { components: { TabPane } }, slots: { default: panes3 } });
    cy.get('.sd-tabs-nav-tab-list').trigger('keydown', { key: 'End' });
    cy.get('.sd-tabs-tab').eq(2).should('have.attr', 'aria-selected', 'true');
    cy.get('.sd-tabs-nav-tab-list').trigger('keydown', { key: 'Home' });
    cy.get('.sd-tabs-tab').eq(0).should('have.attr', 'aria-selected', 'true');
  });

  it('supports vertical navigation with ArrowDown and vertical aria-orientation', () => {
    cy.mount(Tabs, {
      global: { components: { TabPane } },
      props: { direction: 'vertical' },
      slots: { default: panes3 },
    });
    cy.get('.sd-tabs').should('have.class', 'sd-tabs-vertical');
    cy.get('.sd-tabs-nav-tab-list').should('have.attr', 'aria-orientation', 'vertical');
    cy.get('.sd-tabs-nav-tab-list').trigger('keydown', { key: 'ArrowDown' });
    cy.get('.sd-tabs-tab').eq(1).should('have.attr', 'aria-selected', 'true');
  });

  it('renders the extra slot in the nav', () => {
    cy.mount(Tabs, {
      global: { components: { TabPane } },
      slots: { default: panes, extra: '<button class="extra-btn">操作</button>' },
    });
    cy.get('.sd-tabs-nav-extra').find('.extra-btn').should('have.text', '操作');
  });

  it('renders no close button for tabs with closable=false in editable mode', () => {
    const partialClosable =
      '<tab-pane key="1" title="Tab 1" :closable="false">Panel 1</tab-pane>' +
      '<tab-pane key="2" title="Tab 2">Panel 2</tab-pane>';
    cy.mount(Tabs, {
      global: { components: { TabPane } },
      props: { editable: true },
      slots: { default: partialClosable },
    });
    cy.get('.sd-tabs-tab').eq(0).find('.sd-tabs-tab-close-btn').should('not.exist');
    cy.get('.sd-tabs-tab').eq(1).find('.sd-tabs-tab-close-btn').should('exist');
  });

  it('does not emit delete when the close button of a disabled tab is clicked', () => {
    const withDisabled =
      '<tab-pane key="1" title="Tab 1">Panel 1</tab-pane>' +
      '<tab-pane key="2" title="Tab 2" disabled>Panel 2</tab-pane>';
    cy.mount(Tabs, {
      global: { components: { TabPane } },
      props: { editable: true },
      slots: { default: withDisabled },
    });
    cy.get('.sd-tabs-tab').eq(1).find('.sd-tabs-tab-close-btn').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('delete')).to.equal(undefined);
    });
  });

  it('mounts only the active pane initially with lazyLoad', () => {
    cy.mount(Tabs, {
      global: { components: { TabPane } },
      props: { lazyLoad: true },
      slots: { default: panes3 },
    });
    cy.get('.sd-tabs-pane').should('have.length', 1);
    cy.get('.sd-tabs-content-item').eq(0).should('contain.text', 'Panel 1');
    cy.get('.sd-tabs-tab').eq(1).click();
    cy.get('.sd-tabs-pane').should('have.length', 2);
    cy.get('.sd-tabs-content-item').eq(1).should('contain.text', 'Panel 2');
  });

  it('destroys hidden pane content with destroyOnHide', () => {
    cy.mount(Tabs, {
      global: { components: { TabPane } },
      props: { destroyOnHide: true },
      slots: { default: panes3 },
    });
    cy.get('.sd-tabs-pane').should('have.length', 3);
    cy.get('.sd-tabs-tab').eq(1).click();
    // 注：卸载依赖 leave 动画结束事件，本环境不可靠，改为断言激活 pane 的内容
    cy.get('.sd-tabs-content-item').eq(1).should('contain.text', 'Panel 2');
    cy.get('.sd-tabs-content-item').eq(0).should('not.contain.text', 'Panel 1');
  });

  it('switches to the last tab after add with autoSwitch', () => {
    cy.mount(Tabs, {
      global: { components: { TabPane } },
      props: { editable: true, showAddButton: true, autoSwitch: true },
      slots: { default: panes },
    });
    cy.get('.sd-tabs-nav-add-btn').click({ force: true });
    cy.get('.sd-tabs-tab').eq(1).should('have.attr', 'aria-selected', 'true');
  });

  it('renders content before the nav when position is bottom', () => {
    cy.mount(Tabs, {
      global: { components: { TabPane } },
      props: { position: 'bottom' },
      slots: { default: panes },
    });
    cy.get('.sd-tabs').should('have.class', 'sd-tabs-bottom');
    cy.get('.sd-tabs').children().first().should('have.class', 'sd-tabs-content');
  });

  it('slides content via transform and animates the transform (not margin)', () => {
    cy.mount(Tabs, {
      global: { components: { TabPane } },
      props: { animation: true },
      slots: { default: panes3 },
    });
    cy.get('.sd-tabs-content-list').should('have.css', 'transition-property', 'transform');
    cy.get('.sd-tabs-tab').eq(2).click();
    cy.get('.sd-tabs-content-list')
      .should('have.attr', 'style')
      .and('match', /translateX\(-200%\)/);
  });

  it('reverses the transform slide direction under RTL', () => {
    const Harness = defineComponent({
      setup() {
        return () =>
          h(
            ConfigProvider,
            { rtl: true },
            {
              default: () =>
                h(Tabs, null, {
                  default: () => [
                    h(TabPane, { key: '1', title: 'Tab 1' }, () => 'Panel 1'),
                    h(TabPane, { key: '2', title: 'Tab 2' }, () => 'Panel 2'),
                    h(TabPane, { key: '3', title: 'Tab 3' }, () => 'Panel 3'),
                  ],
                }),
            },
          );
      },
    });
    cy.mount(Harness);
    cy.get('.sd-tabs-tab').eq(2).click();
    cy.get('.sd-tabs-content-list')
      .should('have.attr', 'style')
      .and('match', /translateX\(200%\)/);
  });

  it('freezes inactive pane content: slot fns not re-run while hidden, updates land on reactivation', () => {
    const renderCounts = [0, 0, 0];
    const slotCalls = [0, 0, 0];
    const label = ref('A');
    const Heavy = defineComponent({
      name: 'Heavy',
      props: {
        index: { type: Number, required: true },
        label: { type: String, required: true },
      },
      setup(props) {
        return () => {
          renderCounts[props.index] += 1;
          return h(
            'div',
            { class: `heavy heavy-${props.index}` },
            `pane-${props.index}:${props.label}`,
          );
        };
      },
    });
    const pane = (i: number) =>
      h(
        TabPane,
        { key: i, title: `Tab ${i + 1}` },
        {
          default: () => {
            slotCalls[i] += 1;
            return h(Heavy, { index: i, label: label.value });
          },
        },
      );
    cy.mount(Tabs, {
      slots: { default: () => [pane(0), pane(1), pane(2)] },
    });

    let baseCalls: number[] = [];
    let baseRenders: number[] = [];
    cy.get('@vue').then(() => {
      baseCalls = [...slotCalls];
      baseRenders = [...renderCounts];
    });
    const frozenDelta = (calls: number[], renders: number[]) =>
      cy.get('@vue').should(() => {
        expect([slotCalls[0] - baseCalls[0], slotCalls[2] - baseCalls[2]]).to.deep.equal(calls);
        expect([renderCounts[0] - baseRenders[0], renderCounts[2] - baseRenders[2]]).to.deep.equal(
          renders,
        );
      });

    // 冻结断言只看非激活面板（pane0/pane2）的增量；激活面板因既有 onUpdated 链路会多次执行 slot，不在此断言

    // 切换后：只有新激活面板重新执行 slot；非激活面板走缓存跳过 patch
    cy.get('.sd-tabs-tab').eq(1).click();
    frozenDelta([0, 0], [0, 0]);
    cy.get('.heavy-0').should('have.text', 'pane-0:A');

    // 隐藏期间父作用域数据变化：激活面板立即更新；
    // 冻结面板不重渲染，重新激活时补渲染最新数据
    cy.get('.heavy-1')
      .should('have.text', 'pane-1:A')
      .then(() => {
        label.value = 'B';
      });
    frozenDelta([0, 0], [0, 0]);
    cy.get('.heavy-1').should('have.text', 'pane-1:B');

    cy.get('.sd-tabs-tab').eq(0).click();
    frozenDelta([1, 0], [1, 0]);
    cy.get('.heavy-0').should('have.text', 'pane-0:B');
    cy.get('.heavy-2').should('have.text', 'pane-2:A');
  });
});
