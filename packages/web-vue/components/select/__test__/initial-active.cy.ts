import Select from '../index';

describe('Select initial active option', () => {
  it('activates the first option in an initially open popup for keyboard selection', () => {
    const change = cy.spy().as('change');
    cy.mount(Select, {
      props: { defaultPopupVisible: true, options: ['One', 'Two'], onChange: change },
    });
    cy.get('.sd-select-option-active').should('contain.text', 'One');
    cy.get('input').trigger('keydown', { key: 'Enter' });
    cy.get('@change').should('have.been.calledOnceWith', 'One');
  });
});
