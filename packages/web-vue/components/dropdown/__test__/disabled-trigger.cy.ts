import Dropdown from '../index';

describe('DropdownButton disabled triggers', () => {
  it('blocks hover while disabled and allows it after enabling', () => {
    cy.mount(Dropdown.Button, {
      props: { disabled: true, trigger: 'hover' },
      slots: {
        default: 'Main',
        content: '<sd-doption value="1">Option</sd-doption>',
      },
    });
    cy.get('button').last().trigger('mouseenter', { force: true });
    cy.wait(150);
    cy.get('button').last().should('have.attr', 'aria-expanded', 'false');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ disabled: false }));
    cy.get('button').last().trigger('mouseenter');
    cy.get('.sd-dropdown-option').should('be.visible');
  });
});
