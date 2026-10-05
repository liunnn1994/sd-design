import { defineComponent, h, ref } from 'vue';

import Layout, { LayoutSider } from '../index';

describe('Layout sider registration', () => {
  it('keeps the layout horizontal when one of two opaque sider wrappers is removed', () => {
    const WrappedSider = defineComponent({ setup: () => () => h(LayoutSider) });
    const first = ref(true);
    const second = ref(true);
    cy.mount({
      setup: () => () =>
        h(Layout, {}, () => [
          first.value ? h(WrappedSider, { key: 'first' }) : null,
          second.value ? h(WrappedSider, { key: 'second' }) : null,
        ]),
    });
    cy.get('.sd-layout-sider').should('have.length', 2);
    cy.get('.sd-layout').should('have.class', 'sd-layout-has-sider');
    cy.then(() => {
      first.value = false;
    });
    cy.get('.sd-layout-sider').should('have.length', 1);
    cy.get('.sd-layout').should('have.class', 'sd-layout-has-sider');
    cy.then(() => {
      second.value = false;
    });
    cy.get('.sd-layout-sider').should('not.exist');
    cy.get('.sd-layout').should('not.have.class', 'sd-layout-has-sider');
  });

  it('drops the static sider detection when a render-function slot is replaced', () => {
    const visible = ref(true);
    cy.mount({
      setup: () => () => {
        const children = visible.value ? [h(LayoutSider)] : [];
        return h(Layout, {}, () => children);
      },
    });
    cy.get('.sd-layout').should('have.class', 'sd-layout-has-sider');
    cy.then(() => {
      visible.value = false;
    });
    cy.get('.sd-layout-sider').should('not.exist');
    cy.get('.sd-layout').should('not.have.class', 'sd-layout-has-sider');
  });
});
