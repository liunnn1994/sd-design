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
});
