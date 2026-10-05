import Tree from '../index';

describe('Tree title negative spacing', () => {
  for (const [spacing, expected] of [
    [undefined, '-4px'],
    ['10px', '-10px'],
  ] as const) {
    it(`applies negative title spacing with ${spacing ?? 'default'} token`, () => {
      cy.mount(Tree, {
        props: { data: [{ key: 'one', title: 'One' }] },
        attrs: { style: spacing ? { '--component-tree-padding-title-horizontal': spacing } : {} },
      });
      cy.get('.sd-tree-node-title').should('have.css', 'margin-left', expected);
    });
  }
});
