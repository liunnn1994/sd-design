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
});
