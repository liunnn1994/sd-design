describe('React Markdown scroll root refs', () => {
  for (const root of ['empty-ref', 'empty-resolver']) {
    it(`resolves an undefined ${root} through the nearest scrollable ancestor`, () => {
      cy.visit(`/markdown-root.html?${root}`);
      cy.contains('button', /^Settle$/).click();
      cy.contains('button', /^Scroll middle$/).click();
      cy.get('[data-testid="scroll-frame"]').should(($frame) =>
        expect($frame[0].scrollTop).to.be.greaterThan(1000),
      );
      cy.contains('button', /^Capture$/).click();
      cy.get('[data-testid="root-metrics"]')
        .invoke('text')
        .should('not.be.empty')
        .then((text) => {
          const state = JSON.parse(text);
          expect(state.anchorCaptured).to.equal(true);
          expect(state.anchor.type).to.equal('node');
          expect(state.anchor.nodeIndex).to.equal(40);
          expect(state.heightCache).to.have.length(80);
        });
    });
  }
});
