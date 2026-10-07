import { InputSearch } from '../index';

describe('InputSearch button state props', () => {
  it('keeps the search button disabled when the input is disabled', () => {
    cy.mount(InputSearch, {
      props: { searchButton: true, disabled: true, buttonProps: { disabled: false } },
    });
    cy.get('input').should('be.disabled');
    cy.screenshot('disabled-search-button-props');
    cy.get('button').should('be.disabled');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ disabled: false }));
    cy.get('input').should('not.be.disabled');
    cy.get('button').should('not.be.disabled');
  });

  it('keeps loading active when buttonProps requests a non-loading button', () => {
    const search = cy.spy().as('search');
    cy.mount(InputSearch, {
      props: {
        searchButton: true,
        loading: true,
        buttonProps: { loading: false },
        onSearch: search,
      },
    });
    cy.screenshot('loading-search-button-props');
    cy.get('button').click();
    cy.get('@search').should('not.have.been.called');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ loading: false }));
    cy.get('button').should('not.have.class', 'sd-btn-loading').click();
    cy.get('@search').should('have.been.calledOnce');
  });

  it('preserves independently disabling and loading the search button', () => {
    cy.mount(InputSearch, {
      props: { searchButton: true, buttonProps: { disabled: true, loading: true } },
    });
    cy.get('input').should('not.be.disabled');
    cy.get('button').should('be.disabled').and('have.class', 'sd-btn-loading');
  });
});
