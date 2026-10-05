import RegexVis from '../index';

describe('RegexVis robustness', () => {
  it('keeps a Unicode surrogate escape pair and its quantifier in one node', () => {
    const pattern = String.raw`\uD83D\uDE00+`;
    expect(new RegExp(`^(?:${pattern})$`, 'u').test('😀😀')).to.equal(true);
    cy.mount(RegexVis, { props: { modelValue: pattern, flags: ['u'] } });
    cy.get('.sd-regex-vis-node-character')
      .should('have.length', 1)
      .and('have.text', pattern.slice(0, -1));
    cy.get('.sd-regex-vis-quantifier').should('have.text', '1 - ∞');
  });

  it('decodes surrogate escape pairs as Unicode range endpoints', () => {
    const onSelect = cy.spy().as('onSelect');
    cy.mount(RegexVis, {
      props: { modelValue: String.raw`[\uD83D\uDE00-\uD83D\uDE4F]`, flags: ['u'], onSelect },
    });
    cy.get('.sd-regex-vis-node-character').click();
    cy.get('@onSelect').its('firstCall.args.0.node.ranges').should('have.length', 1);
    cy.get('@onSelect')
      .its('firstCall.args.0.node.ranges.0')
      .should('include', { from: '😀', to: '🙏' });
  });

  it('keeps surrogate escape pairs separate without Unicode mode', () => {
    cy.mount(RegexVis, { props: { modelValue: String.raw`\uD83D\uDE00+` } });
    cy.get('.sd-regex-vis-node-character').should('have.length', 2);
    cy.get('.sd-regex-vis-node-character')
      .last()
      .should('have.text', String.raw`\uDE00`);
  });
});
