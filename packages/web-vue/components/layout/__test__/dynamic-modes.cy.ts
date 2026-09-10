import { defineComponent, ref } from 'vue';

import { LayoutSider } from '../index';

const stubMatchMedia = () =>
  cy.window().then((win) => {
    cy.stub(win, 'matchMedia').callsFake((query: string) => ({
      matches: query.includes('max-width: 767.98px'),
      media: query,
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() {
        return false;
      },
    }));
  });

describe('LayoutSider dynamic modes', () => {
  it('clears breakpoint state when responsive behavior is removed', () => {
    cy.viewport(500, 700);
    stubMatchMedia();
    cy.mount(
      defineComponent({
        components: { LayoutSider },
        setup() {
          return { responsive: ref(true) };
        },
        template:
          '<LayoutSider :breakpoint="responsive ? \'md\' : undefined" :collapsed-width="0">Content</LayoutSider><button @click="responsive = false">Remove breakpoint</button>',
      }),
    );
    cy.get('.sd-layout-sider').should('have.class', 'sd-layout-sider-below');
    cy.contains('button', 'Remove breakpoint').click();
    cy.get('.sd-layout-sider').should('not.have.class', 'sd-layout-sider-below');
    cy.get('.sd-layout-sider-zero-width-trigger').should('not.exist');
  });

  it('does not restore stale hover expansion after hover mode is reenabled', () => {
    cy.mount(
      defineComponent({
        components: { LayoutSider },
        setup() {
          return { hover: ref(true) };
        },
        template:
          '<LayoutSider rail :expand-on-hover="hover" style="height: 200px">Content</LayoutSider><button @click="hover = !hover">Toggle hover</button>',
      }),
    );
    cy.get('.sd-layout-sider').trigger('mouseenter', { force: true });
    cy.get('.sd-layout-sider-rail-overlay').should('have.class', 'sd-layout-sider-rail-expand');
    cy.contains('button', 'Toggle hover').click();
    cy.get('.sd-layout-sider').trigger('mouseleave', { force: true });
    cy.contains('button', 'Toggle hover').click();
    cy.get('.sd-layout-sider-rail-overlay').should('not.have.class', 'sd-layout-sider-rail-expand');
    cy.get('.sd-layout-sider').trigger('mouseenter', { force: true });
    cy.get('.sd-layout-sider-rail-overlay').should('have.class', 'sd-layout-sider-rail-expand');
  });
});
