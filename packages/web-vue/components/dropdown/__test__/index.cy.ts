import DropdownPanel from '../dropdown-panel.vue';

describe('DropdownPanel', () => {
  it('disables the horizontal scrollbar', () => {
    cy.mount(DropdownPanel, {
      slots: { default: '<li class="sd-dropdown-option">Option</li>' },
    });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent({ name: 'Scrollbar' }).props('disableHorizontal')).to.equal(
        true,
      );
    });
  });

  it('exposes role=menu and supports arrow-key navigation between menuitems', () => {
    cy.mount(DropdownPanel, {
      slots: {
        default:
          '<li role="menuitem" tabindex="-1">A</li>' +
          '<li role="menuitem" tabindex="-1">B</li>' +
          '<li role="menuitem" tabindex="-1">C</li>',
      },
    });
    cy.get('.sd-dropdown-list').should('have.attr', 'role', 'menu');
    // 打开（挂载）时焦点进入首项
    cy.get('[role="menuitem"]').eq(0).should('have.focus');
    // ArrowDown → 第二项
    cy.get('.sd-dropdown-list').trigger('keydown', { key: 'ArrowDown' });
    cy.get('[role="menuitem"]').eq(1).should('have.focus');
    // End → 末项
    cy.get('.sd-dropdown-list').trigger('keydown', { key: 'End' });
    cy.get('[role="menuitem"]').eq(2).should('have.focus');
  });
});
