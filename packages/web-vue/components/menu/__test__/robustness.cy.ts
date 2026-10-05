import { h, ref } from 'vue';

import Menu, { MenuItem, SubMenu } from '../index';

describe('Menu robustness', () => {
  for (const initial of [false, true]) {
    it(`updates collapse-icon slots starting ${initial ? 'present' : 'absent'}`, () => {
      const visible = ref(initial);
      cy.mount({
        setup: () => () =>
          h(
            Menu,
            { showCollapseButton: true },
            visible.value
              ? { 'collapse-icon': () => h('output', { 'data-test': 'collapse' }, 'Custom') }
              : {},
          ),
      });
      cy.then(() => {
        visible.value = !initial;
      });
      cy.get('[data-test="collapse"]').should(initial ? 'not.exist' : 'exist');
    });

    for (const slot of ['title', 'icon']) {
      it(`updates submenu ${slot} slots starting ${initial ? 'present' : 'absent'}`, () => {
        const visible = ref(initial);
        cy.mount({
          setup: () => () =>
            h(Menu, {}, () =>
              h(
                SubMenu,
                { key: 'sub', title: 'Title' },
                {
                  default: () => h(MenuItem, { key: 'child' }, () => 'Child'),
                  ...(visible.value
                    ? { [slot]: () => h('output', { 'data-test': slot }, 'Custom') }
                    : {}),
                },
              ),
            ),
        });
        cy.then(() => {
          visible.value = !initial;
        });
        cy.get(`[data-test="${slot}"]`).should(initial ? 'not.exist' : 'exist');
      });
    }
  }

  it('updates replaced horizontal default-slot VNodes', () => {
    const label = ref('First');
    cy.mount({
      setup: () => () => {
        const text = label.value;
        const item = h(MenuItem, { key: 'item' }, () => text);
        return h(Menu, { mode: 'horizontal' }, () => item);
      },
    });
    cy.get('.sd-menu-item').should('have.text', 'First');
    cy.then(() => {
      label.value = 'Second';
    });
    cy.get('.sd-menu-item').should('have.text', 'Second');
  });

  it('updates the item title class when its icon slot is added', () => {
    const visible = ref(false);
    cy.mount({
      setup: () => () =>
        h(Menu, { ellipsis: true }, () =>
          h(
            MenuItem,
            { key: 'item' },
            {
              default: () => 'Item',
              ...(visible.value ? { icon: () => 'Icon' } : {}),
            },
          ),
        ),
    });
    cy.then(() => {
      visible.value = true;
    });
    cy.get('.sd-menu-item-inner').should('have.class', 'sd-menu-title');
  });

  it('removes an unmounted selected descendant from ancestor selection state', () => {
    const visible = ref(true);
    cy.mount({
      setup: () => () =>
        h(Menu, { defaultSelectedKeys: ['child'] }, () =>
          h(SubMenu, { key: 'outer', title: 'Outer' }, () =>
            h(SubMenu, { key: 'inner', title: 'Inner' }, () =>
              visible.value ? h(MenuItem, { key: 'child' }, () => 'Child') : null,
            ),
          ),
        ),
    });
    cy.contains('.sd-menu-inline-header', 'Outer').should('have.class', 'sd-menu-selected');
    cy.then(() => {
      visible.value = false;
    });
    cy.contains('.sd-menu-inline-header', 'Outer').should('not.have.class', 'sd-menu-selected');
  });

  it('preserves an empty string item key', () => {
    cy.mount(Menu, {
      attrs: { selectedKeys: [''] },
      slots: { default: () => h(MenuItem, { key: '' }, () => 'Item') },
    });
    cy.get('.sd-menu-item').should('have.class', 'sd-menu-selected');
  });

  it('removes an unmounted nested submenu from ancestor selection state', () => {
    const visible = ref(true);
    cy.mount({
      setup: () => () =>
        h(Menu, { defaultSelectedKeys: ['child'] }, () =>
          h(SubMenu, { key: 'outer', title: 'Outer' }, () =>
            h(SubMenu, { key: 'middle', title: 'Middle' }, () =>
              visible.value
                ? h(SubMenu, { key: 'inner', title: 'Inner' }, () =>
                    h(MenuItem, { key: 'child' }, () => 'Child'),
                  )
                : null,
            ),
          ),
        ),
    });
    cy.contains('.sd-menu-inline-header', 'Outer').should('have.class', 'sd-menu-selected');
    cy.then(() => {
      visible.value = false;
    });
    cy.contains('.sd-menu-inline-header', 'Outer').should('not.have.class', 'sd-menu-selected');
  });
});
