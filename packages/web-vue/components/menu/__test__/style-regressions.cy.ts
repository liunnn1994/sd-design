import { h } from 'vue';

import { mount } from 'cypress/vue';

import Menu, { MenuItem, SubMenu } from '../index';
import '../style';

describe('Menu styles', () => {
  let disabledSheets: CSSStyleSheet[] = [];

  beforeEach(() => {
    cy.document().then((doc) => {
      for (const sheet of Array.from(doc.styleSheets)) {
        const id = (sheet.ownerNode as HTMLElement | null)?.getAttribute('data-vite-dev-id');
        if (id?.endsWith('/components/index.scss') && !sheet.disabled) {
          sheet.disabled = true;
          disabledSheets.push(sheet);
        }
      }
    });
  });

  afterEach(() => {
    for (const sheet of disabledSheets) sheet.disabled = false;
    disabledSheets = [];
  });

  it('positions the horizontal selected indicator below the menu item', () => {
    mount(Menu, {
      props: { mode: 'horizontal' },
      attrs: { selectedKeys: ['item'] },
      slots: { default: () => h(MenuItem, { key: 'item' }, () => 'Item') },
    });
    cy.get('.sd-menu-selected-label').should('have.css', 'bottom', '-14px');
  });

  it('extends the horizontal popup hover area below the submenu', () => {
    mount(Menu, {
      props: { mode: 'horizontal' },
      slots: {
        default: () =>
          h(SubMenu, { title: 'Submenu' }, () => h(MenuItem, { key: 'child' }, () => 'Child')),
      },
    });
    cy.get('.sd-menu-pop').should(($submenu) => {
      expect(getComputedStyle($submenu[0], '::after').bottom).to.equal('-14px');
    });
  });
});
