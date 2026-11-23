describe('React Comment', () => {
  it('renders custom regions and keeps nested replies independent of parent alignment', () => {
    cy.visit('/layout-primitives.html?fixture=comment');
    cy.get('[data-testid="thread"]').should('have.class', 'comment-thread');
    cy.get('.sd-comment-avatar').find('[aria-label="Custom avatar"]').should('have.text', 'A');
    cy.get('.sd-comment-title-align-left').should('contain.text', 'Author');
    cy.get('time').should('have.attr', 'datetime', '2026-11-23');
    cy.get('.sd-comment-content').should('have.text', 'First message');
    cy.get('.sd-comment-actions-align-right').find('button').click();
    cy.get('.sd-comment-inner-comment .sd-comment').should('contain.text', 'Nested reply');
    cy.get('.sd-comment-inner-comment .sd-comment-actions').should('not.exist');
    cy.contains('button', 'Toggle reply').click();
    cy.get('.sd-comment-inner-comment').should('not.exist');
  });
});
