import { defineComponent, h, ref } from 'vue';

import { LayoutSider } from '../index';

describe('Layout shared foundation adapter', () => {
  it('keeps controlled requests and the last accepted state when control is removed', () => {
    const collapsed = ref<boolean | undefined>(false);
    const requests = ref<boolean[]>([]);
    cy.mount(
      defineComponent({
        setup: () => () =>
          h('div', [
            h(
              LayoutSider,
              {
                collapsed: collapsed.value,
                collapsible: true,
                scrollbar: false,
                onCollapse(value: boolean) {
                  requests.value.push(value);
                },
              },
              () => 'Sider',
            ),
            h('output', JSON.stringify(requests.value)),
            h(
              'button',
              {
                id: 'accept-collapse',
                onClick: () => {
                  collapsed.value = requests.value.at(-1);
                },
              },
              'Accept',
            ),
            h(
              'button',
              {
                id: 'release-collapse',
                onClick: () => {
                  collapsed.value = undefined;
                },
              },
              'Release',
            ),
          ]),
      }),
    );
    cy.get('.sd-layout-sider-trigger').click();
    cy.get('output').should('have.text', '[true]');
    cy.get('.sd-layout-sider').should('not.have.class', 'sd-layout-sider-collapsed');
    cy.get('#accept-collapse').click();
    cy.get('.sd-layout-sider').should('have.class', 'sd-layout-sider-collapsed');
    cy.get('#release-collapse').click();
    cy.get('.sd-layout-sider').should('have.class', 'sd-layout-sider-collapsed');
    cy.get('.sd-layout-sider-trigger').trigger('keydown', { key: ' ' });
    cy.get('output').should('have.text', '[true,false]');
    cy.get('.sd-layout-sider').should('not.have.class', 'sd-layout-sider-collapsed');
  });

  it('tracks real media queries across breakpoint replacement, removal and unmount', () => {
    const breakpoint = ref<'md' | 'lg' | undefined>('md');
    const visible = ref(true);
    const notifications = ref<boolean[]>([]);
    cy.viewport(850, 700);
    cy.mount(
      defineComponent({
        setup: () => () =>
          h('div', [
            visible.value
              ? h(
                  LayoutSider,
                  {
                    breakpoint: breakpoint.value,
                    collapsedWidth: 0,
                    scrollbar: false,
                    onBreakpoint(value: boolean) {
                      notifications.value.push(value);
                    },
                  },
                  () => 'Sider',
                )
              : null,
            h('output', JSON.stringify(notifications.value)),
            h(
              'button',
              {
                id: 'replace-breakpoint',
                onClick: () => {
                  breakpoint.value = 'lg';
                },
              },
              'Replace',
            ),
            h(
              'button',
              {
                id: 'remove-breakpoint',
                onClick: () => {
                  breakpoint.value = undefined;
                },
              },
              'Remove',
            ),
            h(
              'button',
              {
                id: 'unmount-sider',
                onClick: () => {
                  visible.value = false;
                },
              },
              'Unmount',
            ),
          ]),
      }),
    );
    cy.get('output').should('have.text', '[false]');
    cy.get('#replace-breakpoint').click();
    cy.get('output').should('have.text', '[false,true]');
    cy.get('.sd-layout-sider').should('have.class', 'sd-layout-sider-below');
    cy.viewport(1100, 700);
    cy.get('output').should('have.text', '[false,true,false]');
    cy.get('#remove-breakpoint').click();
    cy.viewport(500, 700);
    cy.get('.sd-layout-sider').should('not.have.class', 'sd-layout-sider-below');
    cy.get('output').should('have.text', '[false,true,false]');
    cy.get('#replace-breakpoint').click();
    cy.get('output').should('have.text', '[false,true,false,true]');
    cy.get('#unmount-sider').click();
    cy.viewport(1200, 700);
    cy.get('output').should('have.text', '[false,true,false,true]');
  });
});
