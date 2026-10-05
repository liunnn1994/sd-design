import SelectableCard from '../index';

describe('SelectableCard nested controls', () => {
  it('leaves a nested input label independent', () => {
    const change = cy.spy().as('change');
    cy.mount(SelectableCard, {
      props: { label: 'Card', isSelected: false, onChange: change },
      slots: {
        actions:
          '<label class="nested-label">Inner control<input class="nested-checkbox" type="checkbox"></label>',
      },
    });
    cy.get('.nested-label').click();
    cy.get('.nested-checkbox').should('be.checked');
    cy.get('@change').should('not.have.been.called');
  });
});
