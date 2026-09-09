import { defineComponent, ref } from 'vue';

import Badge from '../index';

describe('Badge state transitions', () => {
  it('keeps custom content authoritative when status and count are also provided', () => {
    cy.mount(Badge, {
      props: { status: 'danger', count: 12 },
      slots: { content: '<span>Custom</span>' },
    });
    cy.get('.sd-badge-custom-dot').should('have.text', 'Custom');
    cy.get('.sd-badge-number').should('not.exist');
    cy.get('.sd-badge-status-dot').should('not.exist');
  });

  it('updates standalone positioning when the default slot is added or removed', () => {
    cy.mount(
      defineComponent({
        setup: () => ({ content: ref(false) }),
        template:
          '<button @click="content = !content">Toggle</button><sd-badge :count="3"><template v-if="content" #default><span>Inbox</span></template></sd-badge>',
      }),
    );
    cy.get('.sd-badge').should('have.class', 'sd-badge-no-children');
    cy.get('.sd-badge-number').should('have.css', 'position', 'relative');
    cy.get('button').click();
    cy.get('.sd-badge')
      .should('contain.text', 'Inbox')
      .and('not.have.class', 'sd-badge-no-children');
    cy.get('.sd-badge-number').should('have.css', 'position', 'absolute');
    cy.get('button').click();
    cy.get('.sd-badge').should('have.class', 'sd-badge-no-children');
    cy.get('.sd-badge-number').should('have.css', 'position', 'relative');
  });

  it('updates overflow counts and removes zero values', () => {
    cy.mount(Badge, { props: { count: 99, animation: false } });
    cy.get('.sd-number-flow-content').should('have.text', '99');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ count: 100 })));
    cy.get('.sd-number-flow-content').should('have.text', '99+');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ maxCount: 200 })));
    cy.get('.sd-number-flow-content').should('have.text', '100');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ count: 0 })));
    cy.get('.sd-badge-number').should('not.exist');
  });

  it('removes custom color and offsets when switching back to a preset', () => {
    cy.mount(Badge, { props: { count: 1, color: '#123456', offset: [8, 10] } });
    cy.get('.sd-badge-dot').should('have.css', 'background-color', 'rgb(18, 52, 86)');
    cy.get('@vue').then(({ wrapper }) =>
      cy.wrap(wrapper.setProps({ color: 'green', offset: [0, 0] })),
    );
    cy.get('.sd-badge-dot')
      .should('have.class', 'sd-badge-color-green')
      .and(($dot) => {
        expect($dot[0].style.backgroundColor).to.equal('');
        expect($dot[0].style.marginRight).to.equal('');
        expect($dot[0].style.marginTop).to.equal('');
      });
  });

  it('distinguishes an omitted count from an explicit zero for colored status badges', () => {
    cy.mount(Badge, { props: { color: 'green', text: 'Online' } });
    cy.get('.sd-badge-status-dot').should('exist');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ count: 0 })));
    cy.get('.sd-badge-status-dot').should('not.exist');
    cy.get('.sd-badge-dot').should('not.exist');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ count: undefined })));
    cy.get('.sd-badge-status-text').should('have.text', 'Online');
  });
});
