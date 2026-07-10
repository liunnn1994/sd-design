import Tree from '../index';

const options = Array.from({ length: 10 }, (_, index) => ({
  label: `Option ${index}`,
  key: `option-0-${index}`,
  value: `option-0-${index}`,
}));

const treeOptions = Array.from({ length: 10 }, (_, index) => ({
  label: `parent-${index}`,
  key: `parent-${index}`,
  value: `parent-${index}`,
  children: options.map((option) => ({
    ...option,
    key: option.key.replace('0', String(index)),
    value: option.value.replace('0', String(index)),
  })),
}));

// virtua renders asynchronously; flush a few macrotask cycles before asserting.
const flush = () =>
  cy.then(async () => {
    for (let i = 0; i < 4; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  });

describe('Tree virtual list', () => {
  it('renders a virtualized tree', () => {
    cy.mount(Tree, {
      props: { data: treeOptions, virtualListProps: { height: 240, minItemSize: 32 } },
    });
    flush();
    cy.get('.sd-virtual-list-content').should('exist');
    cy.get('.sd-tree-node').should('exist');
  });

  it('expands a parent node in a virtual tree', () => {
    cy.mount(Tree, { props: { data: treeOptions, virtualListProps: {} } });
    flush();
    cy.get('.sd-tree-node-switcher').first().click({ force: true });
    flush();
    cy.get('.sd-tree-node').should('have.length.greaterThan', 1);
  });
});
