describe('React Markdown static placeholder height contract', () => {
  it('uses node-specific heights and updates text wrapping after a width change', () => {
    cy.visit('/markdown-height.html', {
      onBeforeLoad(window) {
        window.requestIdleCallback = () => 1;
        window.cancelIdleCallback = () => undefined;
      },
    });
    cy.get('.node-placeholder').should('have.length', 10);
    [44, 32, 28, 144, 220, 212, 32, 102, 180, 40].forEach((height, index) =>
      cy
        .get(`.node-slot[data-node-index="${index + 1}"] > .node-placeholder`)
        .should('have.css', 'height', `${height}px`),
    );
    cy.get('.height-estimation-probes').should('not.exist');
    cy.contains('button', 'Resize').click();
    cy.get('.node-slot[data-node-index="4"] > .node-placeholder').should(
      'have.css',
      'height',
      '232px',
    );
    cy.get('.node-content').should('have.length', 1);
  });
});
