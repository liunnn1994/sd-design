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
    ellipsis: { type: Boolean, default: false },
    ellipsisProps: { type: Object, default: undefined },
  },
  template: `
    <Menu :ellipsis="ellipsis" :ellipsis-props="ellipsisProps">
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
