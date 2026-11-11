describe('React ModelSelector provider logos', () => {
  it('decodes every bundled original SVG and uses the generic logo for unknown and prototype names', () => {
    cy.visit('/model-selector.html?logos');
    cy.get<HTMLImageElement>('img')
      .should('have.length', 54)
      .each(($image) => {
        const image = $image[0] as HTMLImageElement;
        cy.wrap($image).should(($node) => {
          expect(image.complete).to.equal(true);
          expect(image.naturalWidth, String($node.attr('data-provider'))).to.be.greaterThan(0);
        });
        expect(image.alt).to.equal(`${image.dataset.provider} logo`);
        expect(image.width).to.equal(16);
        expect(image.height).to.equal(16);
      });
    cy.get('img[data-provider="default"]')
      .invoke('attr', 'src')
      .then((source) => {
        cy.get('img[data-provider="constructor"], img[data-provider="unknown-provider"]').each(
          ($node) => expect($node.attr('src')).to.equal(source),
        );
      });
  });
});
