import { defineComponent, h, ref } from 'vue';

import Split from '../index';

describe('Split interaction cleanup', () => {
  beforeEach(() => {
    cy.get('body').then(($body) => {
      $body[0].style.cursor = 'default';
    });
  });
  afterEach(() => {
    cy.get('body').then(($body) => {
      $body[0].style.cursor = '';
    });
  });
  it('does not begin dragging when moveStart disables the split', () => {
    const disabled = ref(false);
    cy.mount(
      defineComponent({
        setup: () => () =>
          h(Split, {
            disabled: disabled.value,
            onMoveStart: () => {
              disabled.value = true;
            },
          }),
      }),
    );
    cy.get('.sd-split-trigger').trigger('mousedown');
    cy.get('.sd-split-trigger').should('not.exist');
    cy.get('body').should('have.css', 'cursor', 'default');
  });
  it('stops updating when disabled during a drag', () => {
    const update = cy.spy().as('update');
    cy.mount(Split, { props: { 'onUpdate:size': update }, attrs: { style: 'width:400px' } });
    cy.get('.sd-split-trigger').trigger('mousedown');
    cy.get('body').should('have.css', 'cursor', 'col-resize');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ disabled: true }));
    cy.window().then((win) => win.dispatchEvent(new MouseEvent('mousemove', { clientX: 100 })));
    cy.get('@update').should('not.have.been.called');
    cy.get('body').should('have.css', 'cursor', 'default');
  });

  it('preserves the body cursor when an idle split unmounts', () => {
    cy.mount(Split);
    cy.get('body').then(($body) => {
      $body[0].style.cursor = 'crosshair';
    });
    cy.get('@vue').then(({ wrapper }) => wrapper.unmount());
    cy.get('body').should('have.css', 'cursor', 'crosshair');
    cy.get('body').then(($body) => {
      $body[0].style.cursor = '';
    });
  });

  it('restores the previous body cursor after a drag', () => {
    cy.mount(Split, { attrs: { style: 'width:400px' } });
    cy.get('body').then(($body) => {
      $body[0].style.cursor = 'crosshair';
    });
    cy.get('.sd-split-trigger').trigger('mousedown');
    cy.get('body').should('have.css', 'cursor', 'col-resize');
    cy.window().then((win) => win.dispatchEvent(new MouseEvent('mouseup')));
    cy.get('body').should('have.css', 'cursor', 'crosshair');
    cy.get('body').then(($body) => {
      $body[0].style.cursor = '';
    });
  });
});
