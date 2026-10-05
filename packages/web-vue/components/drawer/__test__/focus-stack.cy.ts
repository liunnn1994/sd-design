import { defineComponent, h, ref } from 'vue';

import Drawer from '../drawer.vue';

describe('Drawer focus stack', () => {
  it('lets Tab advance within the upper drawer and resumes the lower trap after close', () => {
    const upper = ref(true);
    cy.mount(
      defineComponent({
        setup: () => () => [
          h(
            Drawer,
            {
              visible: true,
              renderToBody: false,
              header: false,
              footer: false,
            },
            {
              default: () => [
                h('button', { id: 'lower-first' }, 'First'),
                h('button', { id: 'lower-last' }, 'Last'),
              ],
            },
          ),
          h(
            Drawer,
            {
              visible: upper.value,
              renderToBody: false,
              header: false,
              footer: false,
            },
            {
              default: () => [
                h('button', { id: 'upper-first' }, 'First'),
                h('button', { id: 'upper-last' }, 'Last'),
              ],
            },
          ),
        ],
      }),
      { global: { stubs: { 'transition': false, 'transition-group': false } } },
    );
    cy.get('#upper-first')
      .focus()
      .then(($button) => {
        const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
        $button[0].dispatchEvent(event);
        expect(event.defaultPrevented, 'normal Tab within the top drawer').to.equal(false);
      });
    cy.get('#upper-last').focus().trigger('keydown', { key: 'Tab' });
    cy.get('#upper-first').should('be.focused');
    cy.then(() => {
      upper.value = false;
    });
    cy.get('.sd-drawer-container').eq(1).should('not.be.visible');
    cy.get('#lower-last').focus().trigger('keydown', { key: 'Tab' });
    cy.get('#lower-first').should('be.focused');
  });
});
