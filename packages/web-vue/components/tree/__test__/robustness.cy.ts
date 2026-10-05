import Tree from '../index';

describe('Tree robustness', () => {
  it('focuses string and numeric keys with identical text independently', () => {
    cy.mount(Tree, {
      props: {
        data: [
          { key: 1, title: 'Numeric' },
          { key: '1', title: 'String' },
        ],
      },
    });
    cy.get('.sd-tree-node').eq(0).focus().trigger('keydown', { key: 'ArrowDown' });
    cy.get('.sd-tree-node').eq(1).should('be.focused').and('have.attr', 'tabindex', '0');
    cy.get('.sd-tree-node').eq(1).trigger('keydown', { key: 'ArrowUp' });
    cy.get('.sd-tree-node').eq(0).should('be.focused').and('have.attr', 'tabindex', '0');
  });

  it('loads a lazy branch with ArrowRight', () => {
    const loadMore = cy.spy(() => Promise.resolve()).as('loadMore');
    cy.mount(Tree, {
      props: { data: [{ key: 'lazy', title: 'Lazy', isLeaf: false }], loadMore, animation: false },
    });
    cy.get('.sd-tree-node').focus().trigger('keydown', { key: 'ArrowRight' });
    cy.get('@loadMore').should('have.been.calledOnce');
    cy.get('.sd-tree-node').should('have.attr', 'aria-expanded', 'true');
  });

  it('does not start duplicate loads on repeated title activation while loading', () => {
    let resolveLoad: () => void;
    const loadMore = cy
      .spy(
        () =>
          new Promise<void>((resolve) => {
            resolveLoad = resolve;
          }),
      )
      .as('loadMore');
    cy.mount(Tree, {
      props: {
        data: [{ key: 'lazy', title: 'Lazy', isLeaf: false }],
        loadMore,
        animation: false,
        actionOnNodeClick: 'expand',
      },
    });
    cy.get('.sd-tree-node-title').then(($title) => {
      $title[0].click();
      $title[0].click();
    });
    cy.get('@loadMore').should('have.been.calledOnce');
    cy.then(() => resolveLoad());
    cy.get('.sd-tree-node').should('have.attr', 'aria-expanded', 'true');
  });
  it('preserves selection of a keyless node when presentation props change', () => {
    cy.mount(Tree, { props: { data: [{ title: 'Keyless' }] } });
    cy.get('.sd-tree-node-title').click();
    cy.get('.sd-tree-node').should('have.class', 'sd-tree-node-selected');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ showLine: true }));
    cy.get('.sd-tree-node').should('have.class', 'sd-tree-node-selected');
  });

  it('can collapse an animated branch when its children are all filtered out', () => {
    cy.mount(Tree, {
      props: {
        data: [{ key: 'parent', title: 'Parent', children: [{ key: 'child', title: 'Child' }] }],
        defaultExpandAll: false,
        animation: true,
        filterTreeNode: (node) => node.key === 'parent',
      },
    });
    cy.get('.sd-tree-node-switcher-icon').click();
    cy.get('.sd-tree-node').should('have.attr', 'aria-expanded', 'true');
    cy.get('.sd-tree-node-switcher-icon').click();
    cy.get('.sd-tree-node').should('have.attr', 'aria-expanded', 'false');
  });
  it('keeps separate keys when the same keyless object occurs twice', () => {
    const node = { title: 'Repeated' };
    cy.mount(Tree, { props: { data: [node, node] } });
    cy.get('.sd-tree-node').should('have.length', 2);
    cy.get('.sd-tree-node-title').eq(1).click();
    cy.get('.sd-tree-node').eq(1).should('have.class', 'sd-tree-node-selected');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ showLine: true }));
    cy.get('.sd-tree-node').should('have.length', 2);
    cy.get('.sd-tree-node').eq(1).should('have.class', 'sd-tree-node-selected');
  });
});
