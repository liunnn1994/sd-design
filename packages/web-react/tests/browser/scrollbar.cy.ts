describe('React scrollbar', () => {
  beforeEach(() => cy.visit('/scrollbar.html'));

  it('scrolls through the shared scrollbar API and preserves React child updates', () => {
    cy.get('[data-testid="scrollbar"] .os-scrollbar-vertical').should('exist');
    cy.contains('button', '滚动到 80').click();
    cy.get('[data-testid="scrollbar"] [data-overlayscrollbars-viewport]').should(($viewport) =>
      expect($viewport[0].scrollTop).to.eq(80),
    );
    cy.get('[data-testid="scroll-events"]').should(($output) =>
      expect(Number($output.text())).to.be.greaterThan(0),
    );
    cy.contains('button', '改变滚动内容').click();
    cy.get('[data-testid="scrollbar"] p').should('have.length', 2);
    cy.contains('button', '改变滚动内容').click();
    cy.get('[data-testid="scrollbar"] p').should('have.length', 10);
    cy.contains('button', '切换滚动条类型').click();
    cy.get('[data-testid="scrollbar"] .sd-scrollbar-theme-track').should('exist');
  });

  it('updates the live instance options and exposes its viewport through the ref', () => {
    function expectOptions(x: string, type: string) {
      cy.contains('button', 'Inspect scrollbar').click();
      cy.get('[data-testid="scrollbar-state"]').should(($output) =>
        expect(JSON.parse($output.text())).to.deep.equal({
          x,
          y: 'scroll',
          theme: `sd-scrollbar-theme-${type}`,
          viewport: true,
          instance: true,
        }),
      );
    }
    expectOptions('scroll', 'embed');
    cy.contains('button', '切换滚动条类型').click();
    expectOptions('hidden', 'track');
    cy.contains('button', '切换滚动条类型').click();
    expectOptions('scroll', 'embed');
  });

  it('resizes implicit dimensions, applies an explicit height and destroys the native instance', () => {
    const container = () => cy.get('[data-testid="auto-scrollbar"]');
    const outer = () => container().closest('.sd-scrollbar');
    const viewport = () => container().find('[data-overlayscrollbars-viewport]');
    cy.contains('button', 'Toggle auto scrollbar').click();
    outer().should('have.css', 'width', '100px').and('have.css', 'height', '100px');
    cy.contains('button', 'Expand scroll limits').click();
    outer().should('have.css', 'width', '180px').and('have.css', 'height', '180px');
    cy.contains('button', 'Set explicit scroll height').click();
    outer().should('have.css', 'width', '180px').and('have.css', 'height', '80px');
    cy.contains('button', 'Scroll both axes').click();
    viewport().should(([$viewport]) => {
      expect($viewport.scrollLeft).to.equal(50);
      expect($viewport.scrollTop).to.equal(60);
    });
    cy.contains('button', 'Toggle auto scrollbar').click();
    container().should('not.exist');
    cy.contains('button', 'Read destroyed scrollbar').click();
    cy.get('[data-testid="scrollbar-destroyed"]').should('have.text', 'true');
  });
});
