import { defineComponent, h, ref } from 'vue';

import DropdownPanel from '../dropdown-panel.vue';
import Dropdown from '../index';

describe('Dropdown dynamic state', () => {
  it('uses the latest rendered text for an option without an explicit value', () => {
    const label = ref('Before');
    const onSelect = cy.spy().as('selected');
    cy.mount(
      defineComponent({
        setup: () => () =>
          h(
            Dropdown,
            { defaultPopupVisible: true, hideOnSelect: false, onSelect },
            {
              default: () => h('button', 'Menu'),
              content: () => h(Dropdown.Option, {}, () => label.value),
            },
          ),
      }),
    );
    cy.contains('.sd-dropdown-option', 'Before').click();
    cy.get('@selected').should('have.been.calledWith', 'Before');
    cy.then(() => {
      label.value = 'After';
    });
    cy.contains('.sd-dropdown-option', 'After').click();
    cy.get('@selected').should('have.been.calledWith', 'After');
  });

  it('updates footer styling when its slot is inserted and removed', () => {
    const footer = ref(false);
    cy.mount(
      defineComponent({
        setup: () => () =>
          h(
            DropdownPanel,
            {},
            {
              default: () => h('li', 'Option'),
              ...(footer.value ? { footer: () => 'Footer' } : {}),
            },
          ),
      }),
    );
    cy.get('.sd-dropdown').should('not.have.class', 'sd-dropdown-has-footer');
    cy.then(() => {
      footer.value = true;
    });
    cy.get('.sd-dropdown-footer').should('have.text', 'Footer');
    cy.get('.sd-dropdown').should('have.class', 'sd-dropdown-has-footer');
    cy.then(() => {
      footer.value = false;
    });
    cy.get('.sd-dropdown-footer').should('not.exist');
    cy.get('.sd-dropdown').should('not.have.class', 'sd-dropdown-has-footer');
  });

  it('skips a disabled submenu during keyboard navigation', () => {
    cy.mount(DropdownPanel, {
      slots: {
        default: () => [
          h(Dropdown.Option, { value: 'first' }, () => 'First'),
          h(Dropdown.Submenu, { disabled: true }, { default: () => 'Disabled submenu' }),
          h(Dropdown.Option, { value: 'last' }, () => 'Last'),
        ],
      },
    });
    cy.contains('[role="menuitem"]', 'First').should('be.focused');
    cy.get('.sd-dropdown-list').trigger('keydown', { key: 'ArrowDown' });
    cy.contains('[role="menuitem"]', 'Last').should('be.focused');
    cy.contains('[role="menuitem"]', 'Disabled submenu').should(
      'have.attr',
      'aria-disabled',
      'true',
    );
  });
});
