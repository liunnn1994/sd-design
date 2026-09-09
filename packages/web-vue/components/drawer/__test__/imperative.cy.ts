import { defineComponent, h } from 'vue';

import Drawer, { type DrawerReturn } from '../index';

describe('Drawer imperative API', () => {
  let drawer: DrawerReturn | undefined;
  afterEach(() => {
    drawer?.close();
    drawer = undefined;
  });

  it('updates an open drawer and removes its overlay on programmatic close', () => {
    const onClose = cy.spy().as('closed');
    cy.mount(
      defineComponent({
        setup: () => () =>
          h(
            'button',
            {
              onClick: () => {
                drawer = Drawer.open({
                  title: 'Imperative',
                  content: 'Content',
                  width: 300,
                  onClose,
                });
              },
            },
            'Open',
          ),
      }),
      { global: { stubs: { 'transition': false, 'transition-group': false } } },
    );
    cy.contains('button', 'Open').click();
    cy.get('.sd-drawer').should('have.css', 'width', '300px');
    cy.then(() => drawer!.update({ width: 420, okText: 'Save', hideCancel: true }));
    cy.get('.sd-drawer').should('have.css', 'width', '420px');
    cy.get('.sd-drawer-footer button').should('have.length', 1).and('have.text', 'Save');
    cy.then(() => drawer!.close());
    cy.get('@closed').should('have.been.calledOnce');
    cy.get('.sd-drawer-container').should('not.exist');
    cy.contains('button', 'Open').should('be.focused');
  });

  it('calls onOk and cleans up after asynchronous confirmation', () => {
    let finish!: (closed: boolean) => void;
    const onOk = cy.spy().as('confirmed');
    const onClose = cy.spy().as('closed');
    cy.mount(
      defineComponent({
        setup: () => () =>
          h(
            'button',
            {
              onClick: () => {
                drawer = Drawer.open({
                  content: 'Async content',
                  onOk,
                  onClose,
                  onBeforeOk: (done) => {
                    finish = done;
                  },
                });
              },
            },
            'Open',
          ),
      }),
      { global: { stubs: { 'transition': false, 'transition-group': false } } },
    );
    cy.contains('button', 'Open').click();
    cy.get('.sd-drawer-footer button').last().click();
    cy.get('.sd-drawer-footer button').last().should('have.class', 'sd-btn-loading');
    cy.then(() => finish(true));
    cy.get('@confirmed').should('have.been.calledOnce');
    cy.get('@closed').should('have.been.calledOnce');
    cy.get('.sd-drawer-container').should('not.exist');
  });
});
