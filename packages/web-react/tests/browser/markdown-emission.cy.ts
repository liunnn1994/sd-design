export {};
const control = (name: string) => cy.contains('button', new RegExp(`^${name}$`)).click();
const events = () => cy.window().its('markdownEmissions');
const prepare = (query = '') => {
  cy.visit(`/markdown-emission.html${query}`);
  events().should((events) => expect(events.at(-1)?.width).to.equal(480));
  control('Reset events');
  control('Force measure');
  events().should('have.length', 1);
};
describe('React Markdown emission interval', () => {
  it('coalesces layout notifications according to emitIntervalMs', () => {
    prepare();
    control('Resize');
    cy.wait(100);
    events().should('have.length', 1);
    events().should((events) => expect(events.at(-1)?.width).to.equal(320));
    events().should('have.length', 2);
  });
  it('forceMeasure emits immediately and cancels the delayed duplicate', () => {
    prepare();
    control('Resize');
    cy.wait(100);
    events().should('have.length', 1);
    control('Force measure');
    events().should('have.length', 2);
    events().should((events) => expect(events.at(-1)?.width).to.equal(320));
    cy.wait(850);
    events().should('have.length', 2);
  });
  it('flushes the last snapshot on unmount and cancels the delayed duplicate', () => {
    prepare();
    control('Resize');
    cy.wait(100);
    events().should('have.length', 1);
    control('Toggle renderer');
    events().should('have.length', 2);
    events().should((events) => expect(events.at(-1)?.width).to.equal(320));
    cy.wait(850);
    events().should('have.length', 2);
  });
  it('releases pending notifications even when the final consumer callback throws', () => {
    prepare('?throw-unmount');
    control('Resize');
    cy.wait(100);
    events().should('have.length', 1);
    control('Toggle renderer');
    cy.get('.markdown-renderer').should('not.exist');
    events().should('have.length', 2);
    cy.wait(850);
    events().should('have.length', 2);
  });
  it('reports a thread replacement when layout and content stay unchanged', () => {
    prepare();
    control('Change thread');
    events().should((events) => expect(events.at(-1)?.threadKey).to.equal('two'));
  });
});
