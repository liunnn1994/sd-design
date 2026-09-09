import { h } from 'vue';

import DropdownPanel from '../dropdown-panel.vue';
import Dropdown from '../index';

describe('Dropdown editable keyboard content', () => {
  for (const tag of ['input', 'textarea', 'div']) {
    it(`preserves spaces and arrow-key focus in ${tag}`, () => {
      cy.mount(DropdownPanel, {
        slots: {
          default: () => [
            h('li', [
              h(tag, {
                class: 'menu-editor',
                ...(tag === 'div' ? { contenteditable: 'true' } : {}),
              }),
            ]),
            h(Dropdown.Option, { value: 'item' }, () => 'Item'),
          ],
        },
      });
      cy.get('.menu-editor').type('two words');
      if (tag === 'div') cy.get('.menu-editor').should('have.text', 'two words');
      else cy.get('.menu-editor').should('have.value', 'two words');
      cy.get('.menu-editor').trigger('keydown', { key: 'ArrowDown' });
      cy.get('.menu-editor').should('be.focused');
      cy.contains('[role="menuitem"]', 'Item').focus().trigger('keydown', { key: 'Home' });
      cy.contains('[role="menuitem"]', 'Item').should('be.focused');
    });
  }
});
