import AutoComplete from '../index';

describe('AutoComplete style tokens', () => {
  it('applies dropdown and option tokens to the rendered elements', () => {
    cy.mount(AutoComplete, {
      props: {
        data: ['Apple', { value: 'Blocked', disabled: true }],
        triggerProps: {
          popupStyle: {
            '--component-auto-complete-popup-border-radius': '13px',
            '--component-auto-complete-popup-max-height': '123px',
            '--component-auto-complete-popup-padding-vertical': '7px',
            '--component-auto-complete-option-height': '44px',
            '--component-auto-complete-option-padding-horizontal': '19px',
            '--component-auto-complete-option-color-bg-hover': 'rgb(12, 34, 56)',
            '--component-auto-complete-option-color-text-disabled': 'rgb(78, 90, 12)',
          },
        },
      },
    });
    cy.get('input').click();
    cy.get('.sd-auto-complete-dropdown').should('have.css', 'border-radius', '13px');
    cy.get('.sd-auto-complete-dropdown').should('have.css', 'padding-top', '7px');
    cy.get('.sd-auto-complete-dropdown .sd-select-dropdown-list-wrapper').should(
      'have.css',
      'max-height',
      '123px',
    );
    cy.get('.sd-select-option').first().should('have.css', 'height', '44px');
    cy.get('.sd-select-option').first().should('have.css', 'padding-left', '19px');
    cy.get('.sd-select-option-active').should('have.css', 'background-color', 'rgb(12, 34, 56)');
    cy.get('.sd-select-option-disabled').should('have.css', 'color', 'rgb(78, 90, 12)');
  });
});
