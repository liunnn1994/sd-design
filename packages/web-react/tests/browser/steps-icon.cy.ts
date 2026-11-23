describe('React Steps icons', () => {
  beforeEach(() => cy.visit('/steps.html'));

  it('centers finished and error step icons at default and small sizes', () => {
    for (const small of [false, true]) {
      cy.get(`[data-testid="icon-steps-${small}"] .sd-steps-icon > svg`)
        .should('have.length', 2)
        .each(($svg) => {
          const icon = $svg[0].getBoundingClientRect();
          const circle = $svg[0].parentElement!.getBoundingClientRect();
          expect(
            Math.abs(icon.left + icon.width / 2 - circle.left - circle.width / 2),
          ).to.be.lessThan(2);
          expect(
            Math.abs(icon.top + icon.height / 2 - circle.top - circle.height / 2),
          ).to.be.lessThan(2);
        });
    }
  });
});
