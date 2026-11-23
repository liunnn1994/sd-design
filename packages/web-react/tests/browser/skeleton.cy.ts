describe('React skeleton', () => {
  beforeEach(() => cy.visit('/skeleton.html'));

  it('updates skeleton rows, dimensions, spacing, shape and animation', () => {
    cy.get('[data-testid="skeleton"]').should('have.attr', 'aria-busy', 'true');
    cy.get('[data-testid="skeleton"] .sd-skeleton-line-row')
      .should('have.length', 3)
      .first()
      .should('have.css', 'width', '120px')
      .and('have.css', 'animation-name', 'sd-skeleton-circle');
    cy.get('[data-testid="skeleton"] .sd-skeleton-line-row')
      .eq(1)
      .should('have.css', 'width', '160px')
      .and('have.css', 'margin-top', '15px');
    cy.get('[data-testid="skeleton"] .sd-skeleton-shape')
      .should('have.class', 'sd-skeleton-shape-large')
      .and('have.css', 'border-radius', '50%');
    cy.get('[data-testid="skeleton"] .sd-skeleton-line-row').should(([$first, $second, $third]) => {
      expect($second.getBoundingClientRect().top - $first.getBoundingClientRect().bottom).to.equal(
        15,
      );
      expect($third.getBoundingClientRect().top - $second.getBoundingClientRect().bottom).to.equal(
        15,
      );
    });
    cy.contains('button', '更新骨架样式').click();
    cy.get('[data-testid="skeleton"]').should('not.have.class', 'sd-skeleton-animation');
    cy.get('[data-testid="skeleton"] .sd-skeleton-line-row')
      .should('have.length', 2)
      .first()
      .should('have.css', 'width', '0px')
      .and('have.css', 'height', '10px')
      .and('have.css', 'animation-name', 'none');
    cy.get('[data-testid="skeleton"] .sd-skeleton-line-row')
      .eq(1)
      .should('have.css', 'width', '100px')
      .and('have.css', 'margin-top', '0px');
    cy.get('[data-testid="skeleton"] .sd-skeleton-shape')
      .should('have.class', 'sd-skeleton-shape-small')
      .and('have.class', 'sd-skeleton-shape-square');
    cy.get('[data-testid="skeleton"] .sd-skeleton-line-row').should(([$first, $second]) => {
      expect($second.getBoundingClientRect().top - $first.getBoundingClientRect().bottom).to.equal(
        0,
      );
    });
  });

  it('switches between skeleton placeholders and content without retaining inactive elements', () => {
    cy.get('[data-testid="skeleton"] button').should('not.exist');
    cy.contains('button', '切换骨架加载').click();
    cy.get('[data-testid="skeleton"]').should('not.have.attr', 'aria-busy');
    cy.get('[data-testid="skeleton"] .sd-skeleton-line').should('not.exist');
    cy.get('[data-testid="skeleton"] button').should('have.text', '真实内容');
    cy.contains('button', '切换骨架加载').click();
    cy.get('[data-testid="skeleton"] .sd-skeleton-line').should('exist');
    cy.get('[data-testid="skeleton"] button').should('not.exist');
  });
});
