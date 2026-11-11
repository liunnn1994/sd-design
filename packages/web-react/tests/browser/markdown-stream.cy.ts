export {};
const control = (name: string) => cy.contains('button', new RegExp(`^${name}$`)).click();
const ready = (query = '') => {
  cy.visit(`/markdown-stream.html${query}`);
  cy.get('.markdown-renderer').should('contain.text', 'An ordinary paragraph');
};
describe('React Markdown streaming parse coalescing', () => {
  it('holds ordinary appends and immediately parses a structural boundary with all pending text', () => {
    ready();
    control('Append');
    control('Append');
    cy.get('[data-testid="source"]').should('contain.text', 'alpha alpha');
    cy.get('.markdown-renderer').should('not.contain.text', 'alpha');
    cy.window().then((window) => {
      expect(
        (window as unknown as { markdownParsedSources: string[] }).markdownParsedSources.some(
          (value) => value.includes('alpha'),
        ),
      ).to.equal(false);
    });
    control('Heading');
    cy.get('.markdown-renderer h2').should('have.text', 'Boundary');
    cy.get('.markdown-renderer').should('contain.text', 'alpha alpha');
  });
  it('commits the latest queued text on its real coalescing timer', () => {
    ready('?timer');
    control('Append');
    control('Append');
    cy.get('.markdown-renderer').should('contain.text', 'alpha alpha');
  });
  for (const action of ['Finish', 'Change parser options', 'Flush pending']) {
    it(`flushes queued plain text on ${action}`, () => {
      ready();
      control('Append');
      cy.get('.markdown-renderer').should('not.contain.text', 'alpha');
      control(action);
      cy.get('.markdown-renderer').should('contain.text', 'alpha');
    });
  }
  it('flushes replacements and table structure without waiting for the plain text timer', () => {
    ready();
    control('Append');
    control('Table');
    cy.get('.markdown-renderer table').should('contain.text', 'C');
    control('Replace');
    cy.get('.markdown-renderer').should('have.text', 'Replacement');
  });
  for (const query of ['?sync', '?zero']) {
    it(`does not delay ordinary appends for ${query}`, () => {
      ready(query);
      control('Append');
      cy.get('.markdown-renderer').should('contain.text', 'alpha');
    });
  }
  it('releases pending parsing and initializes remounted content from the latest source', () => {
    ready();
    control('Append');
    cy.get('.markdown-renderer').should('not.contain.text', 'alpha');
    control('Toggle renderer');
    cy.get('.markdown-renderer').should('not.exist');
    control('Toggle renderer');
    cy.get('.markdown-renderer').should('contain.text', 'alpha');
    control('Append');
    cy.get('.markdown-renderer').should('not.contain.text', 'alpha alpha');
    control('Finish');
    cy.get('.markdown-renderer').should('contain.text', 'alpha alpha');
  });
});
