import { h } from 'vue';

import Dropdown from '../index';

const transitions = () => ({
  global: { stubs: { 'transition': false, 'transition-group': false } },
});

describe('Dropdown browser lifecycle', () => {
  it('focuses the first enabled item again after closing and reopening', () => {
    cy.mount(Dropdown, {
      ...transitions(),
      slots: {
        default: () => h('button', { class: 'menu-trigger' }, 'Menu'),
        content: () => [
          h(Dropdown.Option, { disabled: true }, () => 'Disabled'),
          h(Dropdown.Option, { value: 'first' }, () => 'First'),
          h(Dropdown.Option, { value: 'last' }, () => 'Last'),
        ],
      },
    });
    cy.get('.menu-trigger').click();
    cy.contains('[role="menuitem"]', 'First').should('be.focused');
    cy.contains('[role="menuitem"]', 'Last').click();
    cy.get('.sd-dropdown').should('not.exist');
    cy.get('.menu-trigger').click();
    cy.contains('[role="menuitem"]', 'First').should('be.focused');
    cy.get('@vue').then(({ wrapper }) => wrapper.unmount());
    cy.get('.sd-dropdown').should('not.exist');
  });

  it('selects a nested item once and closes both popup levels', () => {
    cy.mount(Dropdown, {
      ...transitions(),
      slots: {
        default: () => h('button', 'Menu'),
        content: () =>
          h(
            Dropdown.Submenu,
            {},
            {
              default: () => 'Submenu',
              content: () => h(Dropdown.Option, { value: 'nested' }, () => 'Nested item'),
            },
          ),
      },
    });
    cy.contains('button', 'Menu').click();
    cy.contains('.sd-dropdown-option', 'Submenu').click();
    cy.contains('.sd-dropdown-submenu [role="menuitem"]', 'Nested item').should('be.focused');
    cy.contains('.sd-dropdown-submenu [role="menuitem"]', 'Nested item').trigger('keydown', {
      key: 'Enter',
    });
    cy.get('.sd-dropdown').should('not.exist');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('select')).to.have.length(1);
      expect(wrapper.emitted('select')![0][0]).to.equal('nested');
    });
  });

  it('emits scroll and reachBottom after the actual viewport scrolls', () => {
    cy.mount(Dropdown, {
      ...transitions(),
      props: { popupMaxHeight: 120 },
      slots: {
        default: () => h('button', 'Menu'),
        content: () =>
          Array.from({ length: 30 }, (_, index) =>
            h(Dropdown.Option, { value: index }, () => `Option ${index}`),
          ),
      },
    });
    cy.contains('button', 'Menu').click();
    cy.get('.sd-dropdown [data-overlayscrollbars-viewport]').scrollTo('bottom');
    cy.get('.sd-dropdown [data-overlayscrollbars-viewport]').should(($viewport) => {
      expect($viewport[0].scrollTop).to.be.greaterThan(0);
    });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('scroll')).to.have.length.greaterThan(0);
      expect(wrapper.emitted('reachBottom')).to.have.length.greaterThan(0);
    });
    cy.contains('.sd-dropdown-option', 'Option 29').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('select')![0][0]).to.equal(29);
    });
  });
});
