const captured = {
  'stream': [
    [92, 110, 74, 74, 76, 112, 74, 540],
    [92, 110, 74, 74, 76, 112, 74, 540],
  ],
  'pre': [
    [89, 107, 89, 89, 143, 125, 71, 537],
    [89, 107, 107, 125, 215, 125, 71, 537],
  ],
  'scroll': [
    [89, 107, 71, 71, 89, 125, 71, 537],
    [89, 107, 71, 71, 89, 125, 71, 537],
  ],
  'no-header': [
    [52, 70, 52, 52, 88, 88, 34, 500],
    [52, 70, 52, 88, 142, 88, 34, 500],
  ],
  'configured': [
    [117, 145, 117, 173, 227, 201, 89, 227],
    [117, 145, 173, 227, 227, 201, 89, 227],
  ],
};
function visit(scenario: string) {
  cy.visit(`/markdown-code-height.html?${scenario}`, {
    onBeforeLoad(window) {
      window.requestIdleCallback = () => 1;
      window.cancelIdleCallback = () => undefined;
    },
  });
}
function expectHeights(expected: number[]) {
  cy.get('.node-slot > .node-placeholder').should(($nodes) =>
    expect([...$nodes].map((node) => Number.parseFloat(node.style.height))).to.deep.equal(expected),
  );
}
describe('React Markdown code estimates against captured Vue geometry', () => {
  for (const [scenario, expected] of Object.entries(captured)) {
    it(`matches actual Vue ${scenario} estimates before and after resize`, () => {
      visit(scenario);
      expectHeights(expected[0]);
      cy.contains('button', 'Resize').click();
      expectHeights(expected[1]);
    });
  }
  it('invalidates estimates when a custom code renderer is installed and removed', () => {
    visit('pre');
    expectHeights(captured.pre[0]);
    cy.contains('button', 'Custom code').click();
    expectHeights([96, 96, 96, 96, 96, 112, 96, 2032]);
    cy.contains('button', 'Custom code').click();
    expectHeights(captured.pre[0]);
  });
  it('invalidates geometry after code option changes without changing the content or width', () => {
    visit('pre');
    expectHeights(captured.pre[0]);
    cy.contains('button', 'Change options').click();
    expectHeights(captured.configured[0]);
  });
});
