import { defineComponent } from 'vue';

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
});
