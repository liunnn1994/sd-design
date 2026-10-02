import RegexVis from '../index';

describe('RegexVis Unicode characters', () => {
  it('preserves code-unit quantifiers without the Unicode flag', () => {
    const onSelect = cy.spy().as('onSelect');
    cy.mount(RegexVis, { props: { modelValue: '😀+', onSelect } });

    cy.get('.sd-regex-vis-node-character').should('have.length', 2).last().click();
    cy.get('@onSelect').should('have.been.calledWithMatch', {
      node: { value: '\ude00', quantifier: { min: 1, max: Infinity } },
    });
  });

  it('keeps a literal Unicode character and its quantifier together', () => {
    const onSelect = cy.spy().as('onSelect');
    cy.mount(RegexVis, { props: { modelValue: 'a😀+', flags: ['u'], onSelect } });

    cy.get('.sd-regex-vis-node-character').should('have.length', 2);
    cy.get('.sd-regex-vis-node-character').last().should('have.text', '"😀"').click();
    cy.get('@onSelect').should('have.been.calledWithMatch', {
      node: { value: '😀', quantifier: { min: 1, max: Infinity } },
    });
  });

  it('keeps literal Unicode character range endpoints intact', () => {
    const onSelect = cy.spy().as('onSelect');
    cy.mount(RegexVis, { props: { modelValue: '[😀-🙏]', flags: ['u'], onSelect } });

    cy.get('.sd-regex-vis-node-character').click();
    cy.get('@onSelect').its('firstCall.args.0.node.ranges').should('have.length', 1);
    cy.get('@onSelect').its('firstCall.args.0.node.ranges.0').should('include', {
      from: '😀',
      to: '🙏',
    });
  });
});
