describe('TreeSelect and Cascader public configuration parity', () => {
  it('resolves root ellipsis before nested settings and releases popup width in plain mode', () => {
    cy.visit('/tree-select-parity.html');
    cy.get('.sd-tree-node .sd-ellipsis').should('have.length', 2);
    cy.get('.sd-tree-select-popup').invoke('outerWidth').should('be.closeTo', 220, 1);
    cy.contains('button', 'Nested plain', { matchCase: true }).click();
    cy.get('.sd-tree-node .sd-ellipsis').should('not.exist');
    cy.get('.sd-tree-select-popup').invoke('outerWidth').should('be.greaterThan', 220);
    cy.contains('button', 'Ellipsis', { matchCase: true }).click();
    cy.get('.sd-tree-node .sd-ellipsis').should('have.length', 2);
    cy.contains('button', 'Plain', { matchCase: true }).click();
    cy.contains('button', 'Nested ellipsis', { matchCase: true }).click();
    cy.get('.sd-tree-node .sd-ellipsis').should('not.exist');
    cy.contains('button', 'Performant', { matchCase: true }).click();
    cy.get('.sd-tree-node .sd-ellipsis').should('have.length', 2);
    cy.get('.sd-tree-node [data-ellipsis-measure]').should('not.exist');
    cy.contains('button', 'Default', { matchCase: true }).click();
    cy.get('.sd-tree-node [data-ellipsis-measure]').should('have.length', 2);
  });

  for (const mode of ['search', 'columns']) {
    it(`merges global, component and local Spin props in ${mode} mode`, () => {
      cy.visit(`/tree-select-parity.html?loading&${mode}`);
      for (const [component, size] of [
        ['tree-select', 29],
        ['cascader', 23],
      ] as const) {
        const label = component === 'tree-select' ? 'tree' : 'cascader';
        const container =
          component === 'tree-select' ? '.sd-tree-select-popup' : '.sd-cascader-panel';
        cy.get(`${container} .sd-spin-tip`).should('have.text', `${label} provider`);
        cy.get(`${container} .sd-spin-icon`).should('have.css', 'font-size', `${size}px`);
      }
      cy.contains('button', 'Local spin').click();
      cy.get('.sd-tree-select-popup .sd-spin-tip').should('have.text', 'tree local');
      cy.get('.sd-cascader-panel .sd-spin-tip').should('have.text', 'cascader local');
      cy.get('.sd-tree-select-popup .sd-dot-loading').should('exist');
      cy.get('.sd-tree-select-popup .sd-spin-icon').should('have.css', 'font-size', '29px');
      cy.contains('button', 'Update provider').click();
      cy.get('.sd-tree-select-popup .sd-spin-tip').should('have.text', 'tree local');
      cy.contains('button', 'Local spin').click();
      cy.get('.sd-tree-select-popup .sd-spin-tip').should('have.text', 'tree updated');
      cy.get('.sd-cascader-panel .sd-spin-tip').should('have.text', 'cascader updated');
      cy.contains('button', 'Specific spin').click();
      cy.get('.sd-tree-select-popup .sd-spin-tip').should('have.text', 'global');
      cy.get('.sd-cascader-panel .sd-spin-tip').should('have.text', 'global');
      cy.get('.sd-tree-select-popup .sd-spin-icon').should('have.css', 'font-size', '11px');
    });
  }
});
describe('React TreeSelect provider empty content', () => {
  it('updates inherited empty content in the open popup', () => {
    cy.visit('/tree-select-parity.html?empty');
    const popup = () => cy.get('.sd-tree-select-popup');
    popup().should('be.visible').and('contain.text', 'Provider empty provider');
    cy.contains('button', 'Update provider').click();
    popup().should('be.visible').and('contain.text', 'Provider empty updated');
  });
});
