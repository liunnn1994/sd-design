import Tabs from '../index';

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
    cy.get('.sd-tabs-nav-add-btn').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('add')).to.have.length(1);
    });
    cy.get('.sd-tabs-tab-close-btn').first().click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('delete')).to.have.length(1);
    });
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
});
