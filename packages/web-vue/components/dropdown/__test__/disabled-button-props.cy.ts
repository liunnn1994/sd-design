import { DropdownButton } from '../index';

describe('DropdownButton disabled button props', () => {
  it('keeps its main button disabled when buttonProps requests an enabled button', () => {
    const click = cy.spy().as('click');
    cy.mount(DropdownButton, {
      props: { disabled: true, buttonProps: { disabled: false }, onClick: click },
      slots: { default: 'Disabled action' },
    });
    cy.get('button').first().should('be.visible');
    cy.screenshot('disabled-button-props');
    cy.get('button').first().should('be.disabled');
    cy.get('button').last().should('be.disabled');
    cy.get('button').first().click({ force: true });
    cy.get('@click').should('not.have.been.called');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ disabled: false }));
    cy.get('button').first().should('not.be.disabled').click();
    cy.get('@click').should('have.been.calledOnce');
  });

  it('preserves independently disabling the main button through buttonProps', () => {
    const click = cy.spy().as('click');
    cy.mount(DropdownButton, {
      props: { buttonProps: { disabled: true }, onClick: click },
      slots: { default: 'Disabled main action' },
    });
    cy.get('button').first().should('be.disabled').click({ force: true });
    cy.get('button').last().should('not.be.disabled');
    cy.get('@click').should('not.have.been.called');
  });
});
