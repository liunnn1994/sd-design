export {};
const visit = (query = '') =>
  cy.visit(`/markdown-cache.html${query}`, {
    onBeforeLoad(window) {
      window.requestIdleCallback = () => 1;
      window.cancelIdleCallback = () => undefined;
    },
  });
const lastPlaceholder = () => cy.get('.node-slot').last().find('.node-placeholder');
describe('React Markdown standalone height cache', () => {
  it('seeds compatible placeholders and preserves actual measurements on repeated reads', () => {
    visit();
    lastPlaceholder().should('have.css', 'height', '140px');
    cy.contains('button', 'Read').click();
    cy.get('output')
      .invoke('text')
      .then((text) => {
        const state = JSON.parse(text);
        expect(state.heightCache).to.have.length(60);
        expect(
          state.heightCache.find((entry: { index: number }) => entry.index === 0).height,
        ).to.equal(80);
        expect(
          state.heightCache.find((entry: { index: number }) => entry.index === 59).height,
        ).to.equal(140);
      });
    cy.contains('button', 'Read').click();
    cy.get('output')
      .invoke('text')
      .then((text) => expect(JSON.parse(text).heightCache[0].height).to.equal(80));
  });
  it('rejects unsigned, wrong-width and disabled caches', () => {
    for (const query of ['?unsigned', '?wrong-width', '?disabled']) {
      visit(query);
      lastPlaceholder().should('have.css', 'height', query === '?disabled' ? '40px' : '80px');
    }
  });
  it('invalidates on width changes and accepts a subsequently compatible seed', () => {
    visit();
    lastPlaceholder().should('have.css', 'height', '140px');
    cy.contains('button', 'Resize').click();
    lastPlaceholder().should('have.css', 'height', '80px');
    cy.contains('button', 'Match width').click();
    lastPlaceholder().should('have.css', 'height', '140px');
  });
});
