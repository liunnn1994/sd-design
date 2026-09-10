import { defineComponent, ref } from 'vue';

import Ellipsis from '../../ellipsis';
import Menu from '../index';

const MenuHarness = defineComponent({
  components: {
    Menu,
    MenuItem: Menu.Item,
    SubMenu: Menu.SubMenu,
  },
  props: {
    mode: { type: String, default: 'vertical' },
    ellipsis: { type: Boolean, default: false },
    ellipsisProps: { type: Object, default: undefined },
  },
  template: `
    <Menu :mode="mode" :ellipsis="ellipsis" :ellipsis-props="ellipsisProps">
      <MenuItem key="item-1">A very long menu item title</MenuItem>
      <SubMenu key="sub-1" title="A very long submenu title">
        <MenuItem key="sub-1-item-1">Nested menu item</MenuItem>
      </SubMenu>
    </Menu>
  `,
});

describe('Menu', () => {
  it('keeps plain menu text rendering when ellipsis is disabled', () => {
    cy.mount(MenuHarness);
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent(Ellipsis).exists()).to.equal(false);
    });
    cy.contains('A very long menu item title').should('exist');
  });

  it('renders the ellipsis component and forwards ellipsis props', () => {
    cy.mount(MenuHarness, {
      props: {
        ellipsis: true,
        ellipsisProps: { lineClamp: 2, tooltip: false },
      },
    });
    cy.get('@vue').should(({ wrapper }) => {
      const ellipsisList = wrapper.findAllComponents(Ellipsis);
      expect(ellipsisList.length).to.be.greaterThan(0);
      expect(ellipsisList[0].props('lineClamp')).to.equal(2);
      expect(ellipsisList[0].props('tooltip')).to.equal(false);
    });
  });

  it('does not forward overflow template bindings to the DOM', () => {
    cy.window().then((win) => {
      cy.spy(win.console, 'warn').as('consoleWarn');
    });

    cy.mount(MenuHarness, {
      props: {
        mode: 'horizontal',
      },
    });

    cy.get('@consoleWarn').should('not.be.calledWithMatch', 'Failed setting prop "children"');
  });

  it('collapses overflowing horizontal items into the ... submenu', () => {
    const WideMenu = defineComponent({
      components: { Menu, MenuItem: Menu.Item },
      template: `
        <div style="width: 120px;">
          <Menu mode="horizontal">
            <MenuItem key="a">AAAA</MenuItem>
            <MenuItem key="b">BBBB</MenuItem>
            <MenuItem key="c">CCCC</MenuItem>
          </Menu>
        </div>
      `,
    });
    cy.mount(WideMenu);
    cy.wait(400);
    cy.get('.sd-menu-overflow-wrap').should('exist');
    cy.get('.sd-menu-overflow-sub-menu:visible').should('exist');
    cy.get('.sd-menu-overflow-sub-menu-mirror').should('not.be.visible');
    cy.get('.sd-menu-overflow-wrap .sd-menu-item:visible').should('have.length.lessThan', 3);
    cy.get('.sd-menu-overflow-wrap').should(($wrap) => {
      expect($wrap[0].getBoundingClientRect().height, 'single-row overflow height').to.be.lessThan(
        80,
      );
    });
  });

  it('recalculates horizontal overflow when menu item content grows', () => {
    const DynamicMenu = defineComponent({
      components: { Menu, MenuItem: Menu.Item },
      setup() {
        const label = ref('A');
        return { label };
      },
      template: `
        <div>
          <button
            data-testid="resize-item"
            @click="label = label === 'A' ? 'A menu item with much longer content' : 'A'"
          >
            Resize item
          </button>
          <div style="width: 320px;">
            <Menu mode="horizontal">
              <MenuItem key="a">{{ label }}</MenuItem>
              <MenuItem key="b">B</MenuItem>
            </Menu>
          </div>
        </div>
      `,
    });

    cy.mount(DynamicMenu);
    cy.get('.sd-menu-overflow-sub-menu').should('not.exist');
    cy.get('[data-testid="resize-item"]').click();
    cy.get('.sd-menu-overflow-sub-menu:visible').should('exist');
    cy.get('[data-testid="resize-item"]').click();
    cy.get('.sd-menu-overflow-sub-menu').should('not.exist');
  });

  it('keeps menu and trigger positioning classes on popup submenus', () => {
    const PopMenu = defineComponent({
      components: { Menu, MenuItem: Menu.Item, SubMenu: Menu.SubMenu },
      template: `
        <div style="width: 200px;">
          <Menu mode="pop">
            <SubMenu key="cities" title="Cities">
              <MenuItem key="beijing">Beijing</MenuItem>
            </SubMenu>
          </Menu>
        </div>
      `,
    });
    cy.mount(PopMenu);
    cy.get('.sd-menu-pop-header').trigger('mouseenter');
    cy.get('.sd-trigger-popup.sd-trigger-position-rt.sd-menu-pop-trigger:visible').should(
      ($popup) => {
        const triggerRect = Cypress.$('.sd-menu-pop-header')[0].getBoundingClientRect();
        const popupGap = $popup[0].getBoundingClientRect().left - triggerRect.right;
        expect(popupGap, 'popup leaves room for its arrow').to.be.at.least(11.5);
      },
    );
  });

  it('exposes menu/menubar + menuitem roles and keyboard activation', () => {
    cy.mount(MenuHarness);
    // 垂直菜单（默认）→ role=menu；菜单项 role=menuitem + tabindex
    cy.get('.sd-menu-inner').should('have.attr', 'role', 'menu');
    cy.get('.sd-menu-item').first().should('have.attr', 'role', 'menuitem');
    cy.get('.sd-menu-item').first().should('have.attr', 'tabindex', '0');
    // Enter 激活首个菜单项 → 选中态切到该项（aria-current=page）
    cy.get('.sd-menu-item').first().trigger('keydown', { key: 'Enter' });
    cy.get('.sd-menu-item').first().should('have.attr', 'aria-current', 'page');
  });

  it('moves focus with ArrowDown/ArrowUp and Home/End', () => {
    const FlatMenu = defineComponent({
      components: { Menu, MenuItem: Menu.Item },
      template: `
        <Menu>
          <MenuItem key="a">AAA</MenuItem>
          <MenuItem key="b">BBB</MenuItem>
          <MenuItem key="c">CCC</MenuItem>
        </Menu>
      `,
    });
    cy.mount(FlatMenu);
    cy.get('.sd-menu-item').eq(0).focus();
    cy.get('.sd-menu-item').eq(0).trigger('keydown', { key: 'ArrowDown' });
    cy.focused().should('contain.text', 'BBB');
    cy.focused().trigger('keydown', { key: 'End' });
    cy.focused().should('contain.text', 'CCC');
    cy.focused().trigger('keydown', { key: 'Home' });
    cy.focused().should('contain.text', 'AAA');
    // ArrowUp at the first item stays put
    cy.focused().trigger('keydown', { key: 'ArrowUp' });
    cy.focused().should('contain.text', 'AAA');
  });

  it('applies the dark theme class', () => {
    const DarkMenu = defineComponent({
      components: { Menu, MenuItem: Menu.Item },
      template: `
        <Menu theme="dark">
          <MenuItem key="a">AAA</MenuItem>
        </Menu>
      `,
    });
    cy.mount(DarkMenu);
    cy.get('.sd-menu').should('have.class', 'sd-menu-dark');
  });

  it('selects items on click and emits menu-item-click / update:selectedKeys', () => {
    const itemClicks: string[] = [];
    const selectedUpdates: string[][] = [];
    const SelectableMenu = defineComponent({
      components: { Menu, MenuItem: Menu.Item },
      setup() {
        return {
          onItemClick: (key: string) => itemClicks.push(key),
          onSelectedKeysUpdate: (keys: string[]) => selectedUpdates.push(keys),
        };
      },
      template: `
        <Menu
          :default-selected-keys="['b']"
          @menu-item-click="onItemClick"
          @update:selectedKeys="onSelectedKeysUpdate"
        >
          <MenuItem key="a">AAA</MenuItem>
          <MenuItem key="b">BBB</MenuItem>
        </Menu>
      `,
    });
    cy.mount(SelectableMenu);
    cy.get('.sd-menu-item').eq(1).should('have.class', 'sd-menu-selected');
    cy.get('.sd-menu-item').eq(0).click();
    cy.get('.sd-menu-item').eq(0).should('have.class', 'sd-menu-selected');
    cy.get('.sd-menu-item').eq(1).should('not.have.class', 'sd-menu-selected');
    cy.get('@vue').should(() => {
      expect(itemClicks).to.deep.equal(['a']);
      expect(selectedUpdates).to.deep.equal([['a']]);
    });
    // Enter 同样触发激活
    cy.get('.sd-menu-item').eq(1).focus();
    cy.get('.sd-menu-item').eq(1).trigger('keydown', { key: 'Enter' });
    cy.get('.sd-menu-item').eq(1).should('have.attr', 'aria-current', 'page');
    cy.get('@vue').should(() => {
      expect(itemClicks).to.deep.equal(['a', 'b']);
    });
  });

  it('ignores clicks on disabled menu items and removes their tab stop', () => {
    const itemClicks: string[] = [];
    const DisabledMenu = defineComponent({
      components: { Menu, MenuItem: Menu.Item },
      setup() {
        return { onItemClick: (key: string) => itemClicks.push(key) };
      },
      template: `
        <Menu @menu-item-click="onItemClick">
          <MenuItem key="a">AAA</MenuItem>
          <MenuItem key="b" disabled>BBB</MenuItem>
        </Menu>
      `,
    });
    cy.mount(DisabledMenu);
    cy.get('.sd-menu-disabled').should('have.attr', 'aria-disabled', 'true');
    cy.get('.sd-menu-item').eq(1).should('not.have.attr', 'tabindex');
    cy.get('.sd-menu-disabled').click();
    cy.get('@vue').should(() => {
      expect(itemClicks).to.deep.equal([]);
    });
  });

  it('toggles inline submenus and emits sub-menu-click / update:openKeys', () => {
    const subMenuClicks: Array<[string, string[]]> = [];
    const openKeyUpdates: string[][] = [];
    const SubMenuMenu = defineComponent({
      components: { Menu, MenuItem: Menu.Item, SubMenu: Menu.SubMenu },
      setup() {
        return {
          onSubMenuClick: (key: string, openKeys: string[]) => subMenuClicks.push([key, openKeys]),
          onOpenKeysUpdate: (keys: string[]) => openKeyUpdates.push(keys),
        };
      },
      template: `
        <Menu
          @sub-menu-click="onSubMenuClick"
          @update:openKeys="onOpenKeysUpdate"
        >
          <SubMenu key="sub-1" title="Sub 1">
            <MenuItem key="sub-1-item-1">Nested</MenuItem>
          </SubMenu>
        </Menu>
      `,
    });
    cy.mount(SubMenuMenu);
    cy.contains('.sd-menu-inline-header', 'Sub 1').click();
    cy.get('.sd-menu-inline-content').should('be.visible');
    cy.get('@vue').should(() => {
      expect(subMenuClicks).to.deep.equal([['sub-1', ['sub-1']]]);
      expect(openKeyUpdates).to.deep.equal([['sub-1']]);
    });
    cy.contains('.sd-menu-inline-header', 'Sub 1').click();
    cy.get('@vue').should(() => {
      expect(subMenuClicks).to.deep.equal([
        ['sub-1', ['sub-1']],
        ['sub-1', []],
      ]);
    });
  });

  it('keeps only one submenu open with accordion enabled', () => {
    const AccordionMenu = defineComponent({
      components: { Menu, MenuItem: Menu.Item, SubMenu: Menu.SubMenu },
      template: `
        <Menu accordion>
          <SubMenu key="sub-1" title="Sub 1">
            <MenuItem key="sub-1-item-1">Nested 1</MenuItem>
          </SubMenu>
          <SubMenu key="sub-2" title="Sub 2">
            <MenuItem key="sub-2-item-1">Nested 2</MenuItem>
          </SubMenu>
        </Menu>
      `,
    });
    cy.mount(AccordionMenu);
    cy.contains('.sd-menu-inline-header', 'Sub 1').click();
    cy.get('.sd-menu-inline-content').eq(0).should('be.visible');
    cy.contains('.sd-menu-inline-header', 'Sub 2').click();
    cy.get('.sd-menu-inline-content').eq(1).should('be.visible');
    cy.get('.sd-menu-inline-content').eq(0).should('not.be.visible');
  });

  it('opens submenus from defaultOpenKeys', () => {
    const DefaultOpenMenu = defineComponent({
      components: { Menu, MenuItem: Menu.Item, SubMenu: Menu.SubMenu },
      template: `
        <Menu :default-open-keys="['sub-1']">
          <SubMenu key="sub-1" title="Sub 1">
            <MenuItem key="sub-1-item-1">Nested 1</MenuItem>
          </SubMenu>
        </Menu>
      `,
    });
    cy.mount(DefaultOpenMenu);
    cy.get('.sd-menu-inline-content').should('be.visible');
  });

  it('expands all submenus with autoOpen', () => {
    const AutoOpenMenu = defineComponent({
      components: { Menu, MenuItem: Menu.Item, SubMenu: Menu.SubMenu },
      template: `
        <Menu auto-open>
          <SubMenu key="sub-1" title="Sub 1">
            <MenuItem key="sub-1-item-1">Nested 1</MenuItem>
          </SubMenu>
          <SubMenu key="sub-2" title="Sub 2">
            <MenuItem key="sub-2-item-1">Nested 2</MenuItem>
          </SubMenu>
        </Menu>
      `,
    });
    cy.mount(AutoOpenMenu);
    cy.get('.sd-menu-inline-content').eq(0).should('be.visible');
    cy.get('.sd-menu-inline-content').eq(1).should('be.visible');
  });

  it('opens the path to the selected item with autoOpenSelected', () => {
    const AutoOpenSelectedMenu = defineComponent({
      components: { Menu, MenuItem: Menu.Item, SubMenu: Menu.SubMenu },
      template: `
        <Menu auto-open-selected :default-selected-keys="['sub-1-item-1']">
          <SubMenu key="sub-1" title="Sub 1">
            <MenuItem key="sub-1-item-1">Nested 1</MenuItem>
          </SubMenu>
          <SubMenu key="sub-2" title="Sub 2">
            <MenuItem key="sub-2-item-1">Nested 2</MenuItem>
          </SubMenu>
        </Menu>
      `,
    });
    cy.mount(AutoOpenSelectedMenu);
    cy.get('.sd-menu-inline-content').eq(0).should('be.visible');
    cy.get('.sd-menu-inline-content').eq(1).should('not.be.visible');
  });

  it('marks a submenu whose child is selected and keeps controlled openKeys until update', () => {
    const openKeyUpdates: string[][] = [];
    const ControlledMenu = defineComponent({
      components: { Menu, MenuItem: Menu.Item, SubMenu: Menu.SubMenu },
      setup() {
        return { onOpenKeysUpdate: (keys: string[]) => openKeyUpdates.push(keys) };
      },
      template: `
        <Menu
          :open-keys="['sub-1']"
          :default-selected-keys="['sub-1-item-1']"
          @update:openKeys="onOpenKeysUpdate"
        >
          <SubMenu key="sub-1" title="Sub 1">
            <MenuItem key="sub-1-item-1">Nested</MenuItem>
          </SubMenu>
        </Menu>
      `,
    });
    cy.mount(ControlledMenu);
    cy.get('.sd-menu-inline-header').should('have.class', 'sd-menu-selected');
    cy.contains('.sd-menu-inline-header', 'Sub 1').click();
    // 受控模式：update:openKeys 已发出（收起请求），但父级未更新前保持展开
    cy.get('@vue').should(() => {
      expect(openKeyUpdates).to.deep.equal([[]]);
    });
    cy.get('.sd-menu-inline-content').should('be.visible');
  });

  it('collapses via the built-in collapse button and emits collapse', () => {
    const collapses: Array<[boolean, string]> = [];
    const collapsedUpdates: boolean[] = [];
    const CollapsibleMenu = defineComponent({
      components: { Menu, MenuItem: Menu.Item },
      setup() {
        return {
          onCollapse: (collapsed: boolean, type: string) => collapses.push([collapsed, type]),
          onCollapsedUpdate: (collapsed: boolean) => collapsedUpdates.push(collapsed),
        };
      },
      template: `
        <Menu
          show-collapse-button
          :collapsed-width="64"
          @collapse="onCollapse"
          @update:collapsed="onCollapsedUpdate"
        >
          <MenuItem key="a">AAA</MenuItem>
        </Menu>
      `,
    });
    cy.mount(CollapsibleMenu);
    cy.get('.sd-menu').should('not.have.class', 'sd-menu-collapsed');
    cy.get('.sd-menu-collapse-button').click();
    cy.get('.sd-menu').should('have.class', 'sd-menu-collapsed').and('have.css', 'width', '64px');
    cy.get('@vue').should(() => {
      expect(collapses).to.deep.equal([[true, 'clickTrigger']]);
      expect(collapsedUpdates).to.deep.equal([true]);
    });
  });

  it('recalculates collapsed state when breakpoint changes', () => {
    cy.viewport(1000, 600);
    cy.mount(Menu, {
      props: { breakpoint: 'md' },
      slots: { default: () => 'Menu content' },
    });

    cy.get('.sd-menu').should('not.have.class', 'sd-menu-collapsed');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ breakpoint: 'xl' }));
    cy.get('.sd-menu').should('have.class', 'sd-menu-collapsed');
  });

  it('renders collapsed with defaultCollapsed and shows level-1 item tooltips on hover', () => {
    const CollapsedMenu = defineComponent({
      components: { Menu, MenuItem: Menu.Item },
      template: `
        <Menu :default-collapsed="true">
          <MenuItem key="a">AAA</MenuItem>
        </Menu>
      `,
    });
    cy.mount(CollapsedMenu);
    cy.get('.sd-menu').should('have.class', 'sd-menu-collapsed');
    // tooltip 的 class 挂在 Trigger 弹层元素上（unmount-on-close 默认 true），
    // 首次 hover 展开菜单项时才挂载，需 hover 后断言
    cy.get('.sd-menu-item').trigger('mouseenter');
    cy.get('.sd-menu-item-tooltip').should('contain.text', 'AAA');
  });

  it('uses menubar role and left/right roving focus in horizontal mode', () => {
    const HorizontalMenu = defineComponent({
      components: { Menu, MenuItem: Menu.Item },
      template: `
        <Menu mode="horizontal">
          <MenuItem key="a">AAA</MenuItem>
          <MenuItem key="b">BBB</MenuItem>
          <MenuItem key="c">CCC</MenuItem>
        </Menu>
      `,
    });
    cy.mount(HorizontalMenu);
    cy.get('.sd-menu-inner').should('have.attr', 'role', 'menubar');
    cy.get('.sd-menu-item').eq(0).focus();
    cy.get('.sd-menu-item').eq(0).trigger('keydown', { key: 'ArrowRight' });
    cy.focused().should('contain.text', 'BBB');
    cy.focused().trigger('keydown', { key: 'ArrowLeft' });
    cy.focused().should('contain.text', 'AAA');
  });

  it('renders item groups with a title', () => {
    const GroupMenu = defineComponent({
      components: { Menu, MenuItem: Menu.Item, ItemGroup: Menu.ItemGroup },
      template: `
        <Menu>
          <ItemGroup title="Group">
            <MenuItem key="a">AAA</MenuItem>
          </ItemGroup>
        </Menu>
      `,
    });
    cy.mount(GroupMenu);
    cy.get('.sd-menu-group').should('exist');
    cy.contains('.sd-menu-group-title', 'Group').should('be.visible');
  });

  it('applies popupMaxHeight to pop submenus', () => {
    const PopHeightMenu = defineComponent({
      components: { Menu, MenuItem: Menu.Item, SubMenu: Menu.SubMenu },
      template: `
        <Menu mode="pop" :popup-max-height="100">
          <SubMenu key="cities" title="Cities">
            <MenuItem key="b">Beijing</MenuItem>
          </SubMenu>
        </Menu>
      `,
    });
    cy.mount(PopHeightMenu);
    cy.get('.sd-menu-pop-header').trigger('mouseenter');
    // 弹层内的菜单使用 sd-trigger-menu 前缀（prefix-cls 透传）
    cy.get('.sd-menu-pop-trigger .sd-trigger-menu').should('have.css', 'max-height', '100px');
  });

  it('selects selectable pop submenu headers on click', () => {
    const itemClicks: string[] = [];
    const SelectablePopMenu = defineComponent({
      components: { Menu, MenuItem: Menu.Item, SubMenu: Menu.SubMenu },
      setup() {
        return { onItemClick: (key: string) => itemClicks.push(key) };
      },
      template: `
        <Menu mode="pop" @menu-item-click="onItemClick">
          <SubMenu key="cities" title="Cities" selectable>
            <MenuItem key="b">Beijing</MenuItem>
          </SubMenu>
        </Menu>
      `,
    });
    cy.mount(SelectablePopMenu);
    cy.get('.sd-menu-pop-header').click();
    cy.get('@vue').should(() => {
      expect(itemClicks).to.deep.equal(['cities']);
    });
    cy.get('.sd-menu-pop-header').should('have.class', 'sd-menu-selected');
  });
});
