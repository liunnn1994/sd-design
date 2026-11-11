export {};
const visit = (query = '') =>
  cy.visit(`/markdown-restore.html${query}`, {
    onBeforeLoad(window) {
      window.requestIdleCallback = () => 1;
      window.cancelIdleCallback = () => undefined;
    },
  });
const control = (name: string) => cy.contains('button', new RegExp(`^${name}$`)).click();
const read = () => {
  control('Read');
  return cy
    .get('output')
    .invoke('text')
    .then((text) => JSON.parse(text));
};
describe('React Markdown queued virtual restore', () => {
  it('keeps an imperative restore until nodes and layout width are available', () => {
    visit('?empty');
    control('Restore');
    control('Populate');
    control('Expand');
    cy.get('[data-testid="viewport"]').should(($element) =>
      expect($element[0].scrollTop).to.be.greaterThan(6000),
    );
    read().then((state) =>
      expect(
        state.heightCache.find((entry: { index: number }) => entry.index === 30).height,
      ).to.equal(140),
    );
  });
  it('restores cache once width becomes available without moving the viewport', () => {
    visit('?no-anchor');
    cy.get('.node-slot').should('have.length', 60);
    control('Restore');
    control('Expand');
    cy.get('.node-slot').last().find('.node-placeholder').should('have.css', 'height', '140px');
    cy.get('[data-testid="viewport"]').should(($element) =>
      expect($element[0].scrollTop).to.equal(0),
    );
  });
  it('drops queued restores when their session is replaced', () => {
    visit('?empty');
    control('Restore');
    control('Change session');
    control('Populate');
    control('Expand');
    cy.get('.node-slot').last().find('.node-placeholder').should('have.css', 'height', '80px');
    cy.get('[data-testid="viewport"]').should(($element) =>
      expect($element[0].scrollTop).to.equal(0),
    );
  });
});
