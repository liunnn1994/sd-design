import Skeleton from '../index';

describe('Skeleton', () => {
  it('sets aria-busy while loading', () => {
    cy.mount(Skeleton, {
      props: { loading: true },
      slots: { default: '<div>placeholder</div>' },
    });
    cy.get('.sd-skeleton').should('have.attr', 'aria-busy', 'true');
  });

  it('clears aria-busy when not loading', () => {
    cy.mount(Skeleton, {
      props: { loading: false },
      slots: { content: '<div>real content</div>' },
    });
    cy.get('.sd-skeleton').should('not.have.attr', 'aria-busy');
  });
});
