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

  it('avatar prop should render an img with the given src', () => {
    const src = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';

    cy.mount(Comment, { props: { avatar: src } });
    cy.get('.sd-comment-avatar img')
      .should('have.attr', 'src', src)
      .should('have.attr', 'alt', 'comment-avatar');
  });

  it('avatar slot should render instead of the img', () => {
    cy.mount(Comment, {
      slots: { avatar: '<div class="custom-avatar"/>' },
    });
    cy.get('.sd-comment-avatar .custom-avatar').should('exist');
    cy.get('.sd-comment-avatar img').should('not.exist');
  });

  it('author slot should render', () => {
    cy.mount(Comment, { slots: { author: '<span class="custom-author">Hannah</span>' } });
    cy.get('.sd-comment-author .custom-author').should('contain.text', 'Hannah');
  });

  it('datetime slot should render', () => {
    cy.mount(Comment, { slots: { datetime: '<span class="custom-datetime">yesterday</span>' } });
    cy.get('.sd-comment-datetime .custom-datetime').should('contain.text', 'yesterday');
  });

  it('default slot should render nested comments', () => {
    cy.mount(Comment, {
      props: { content: 'outer' },
      slots: {
        default: `<sd-comment content="inner" />`,
      },
    });
    cy.get('.sd-comment-inner-comment .sd-comment').should('exist');
    cy.get('.sd-comment-inner-comment .sd-comment-content').should('contain.text', 'inner');
  });

  it('default align should apply the left classes', () => {
    cy.mount(Comment, {
      props: { author: 'Stephen', datetime: '1 hour' },
      slots: { actions: `<div class="custom-action"/>` },
    });
    cy.get('.sd-comment-title').should('have.class', 'sd-comment-title-align-left');
    cy.get('.sd-comment-actions').should('have.class', 'sd-comment-actions-align-left');
  });

  it('prop should take precedence over the same-name slot', () => {
    cy.mount(Comment, {
      props: { author: 'Stephen' },
      slots: { author: '<span class="slot-author">Hannah</span>' },
    });
    cy.get('.sd-comment-author').should('contain.text', 'Stephen');
    cy.get('.sd-comment-author .slot-author').should('not.exist');
  });

  it('should not render title or content wrappers when nothing is provided', () => {
    cy.mount(Comment);
    cy.get('.sd-comment-title').should('not.exist');
    cy.get('.sd-comment-content').should('not.exist');
    cy.get('.sd-comment-avatar').should('not.exist');
    cy.get('.sd-comment-inner-comment').should('not.exist');
  });
});
