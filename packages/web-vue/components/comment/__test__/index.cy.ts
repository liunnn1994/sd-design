import Comment from '../index';

describe('Comment', () => {
  it('should have the sd-comment class', () => {
    cy.mount(Comment);
    cy.get('.sd-comment').should('exist');
  });

  it('content prop should render', () => {
    cy.mount(Comment, { props: { content: 'hello world' } });
    cy.get('.sd-comment-content').should('contain.text', 'hello world');
  });

  it('content slot should render', () => {
    cy.mount(Comment, { slots: { content: '<div>hello world</div>' } });
    cy.get('.sd-comment-content').should('contain.text', 'hello world');
  });

  it('author should render', () => {
    cy.mount(Comment, { props: { author: 'Stephen' } });
    cy.get('.sd-comment-author').should('contain.text', 'Stephen');
  });

  it('datetime should render', () => {
    cy.mount(Comment, { props: { datetime: '1 hour' } });
    cy.get('.sd-comment-datetime').should('contain.text', '1 hour');
  });

  it('actions slot should render', () => {
    cy.mount(Comment, {
      slots: { actions: [`<div class="custom-action"/>`, `<div class="custom-action"/>`] },
    });
    cy.get('.sd-comment-actions .custom-action').should('have.length', 2);
  });

  it('align should apply the align class', () => {
    cy.mount(Comment, {
      slots: { actions: `<div class="custom-action"/>` },
      props: { align: 'right' },
    });
    cy.get('.sd-comment-actions').should('have.class', 'sd-comment-actions-align-right');
  });

  it('align with object format should also work', () => {
    cy.mount(Comment, {
      slots: { actions: `<div class="custom-action"/>` },
      props: {
        author: 'Stephen',
        align: { datetime: 'right', actions: 'right' },
      },
    });
    cy.get('.sd-comment-actions').should('have.class', 'sd-comment-actions-align-right');
    cy.get('.sd-comment-title').should('have.class', 'sd-comment-title-align-right');
  });
});
