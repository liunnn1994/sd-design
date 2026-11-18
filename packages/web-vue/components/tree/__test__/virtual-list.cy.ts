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
    cy.mount(Tree, {
      props: { data: treeOptions, virtualListProps: {}, defaultExpandAll: false },
    });
    flush();
    cy.get('[data-key="option-0-0"]').should('not.exist');
    cy.get('[data-key="parent-0"] .sd-tree-node-switcher-icon').click();
    flush();
    cy.get('[data-key="option-0-0"]').should('exist');
    cy.get('[data-key="parent-0"]').should('have.attr', 'aria-expanded', 'true');
  });

  it('keeps the viewport and scroll offset when expanding and collapsing with shift enabled', () => {
    const children = Array.from({ length: 20 }, (_, index) => ({
      key: `child-${index}`,
      title: `Child ${index}`,
    }));
    const data = treeOptions.map((node, index) => (index === 0 ? { ...node, children } : node));
    cy.mount(Tree, {
      props: {
        data,
        defaultExpandAll: false,
        virtualListProps: { height: 160, itemSize: 32, fixedSize: true, shift: true },
      },
    });

    const scroller = '.sd-virtual-list-scroller';
    cy.get(scroller).then(([viewport]) => {
      const height = viewport.scrollHeight;
      cy.get('[data-key="parent-0"] .sd-tree-node-switcher-icon').click({ scrollBehavior: false });
      cy.get(scroller).should(([current]) => {
        expect(current).to.equal(viewport);
        expect(current.scrollHeight).to.equal(height + 20 * 32);
        expect(current.scrollTop).to.equal(0);
      });
      cy.get('[data-key="child-0"]').should('be.visible');

      cy.get(scroller).scrollTo(0, 64);
      cy.get(scroller).should('have.prop', 'scrollTop', 64);
      cy.get('@vue').then(({ wrapper }) => wrapper.vm.expandNode('parent-0', false));
      cy.get(scroller).should(([current]) => {
        expect(current).to.equal(viewport);
        expect(current.scrollHeight).to.equal(height);
        expect(current.scrollTop).to.equal(64);
      });
    });
  });

  it('compensates for rows added to and removed from the head when shift is enabled', () => {
    cy.mount(Tree, {
      props: {
        data: treeOptions,
        defaultExpandAll: false,
        virtualListProps: { height: 160, itemSize: 32, fixedSize: true, shift: true },
      },
    });

    const scroller = '.sd-virtual-list-scroller';
    cy.get('[data-key="parent-0"]').should('be.visible');
    cy.get(scroller).scrollTo(0, 64);
    cy.get(scroller).should('have.prop', 'scrollTop', 64);
    cy.get('@vue').then(({ wrapper }) =>
      wrapper.setProps({ data: [{ key: 'prepended', title: 'Prepended' }, ...treeOptions] }),
    );
    cy.get(scroller).should('have.prop', 'scrollTop', 96);
    flush();
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ data: treeOptions }));
    cy.get(scroller).should('have.prop', 'scrollTop', 64);
  });

  for (const extraRows of [0, 12]) {
    it(`preserves scroll when collapsing a branch with ${extraRows} rows below it`, () => {
      const data = Array.from({ length: 31 + extraRows }, (_, index) => ({
        key: `root-${index}`,
        title: `Root ${index}`,
        children: index === 30 ? options.slice(0, 2) : undefined,
      }));
      cy.mount(Tree, {
        props: {
          data,
          defaultExpandedKeys: ['root-30'],
          virtualListProps: { height: 240, itemSize: 32, fixedSize: true },
        },
      });
      const scroller = '.sd-virtual-list-scroller';
      cy.get('[data-key="root-0"]').should('be.visible');
      cy.get(scroller).scrollTo(0, extraRows ? 28 * 32 : '100%');
      cy.get('[data-key="root-30"]').should('be.visible');
      cy.get(scroller).then(([viewport]) => {
        const oldTop = viewport.scrollTop;
        const oldHeight = viewport.scrollHeight;
        expect(oldTop).to.be.greaterThan(0);
        cy.get('[data-key="root-30"] .sd-tree-node-switcher-icon').click({ scrollBehavior: false });
        cy.get(scroller).should(([nextViewport]) => {
          expect(nextViewport.scrollHeight).to.equal(oldHeight - 2 * 32);
          expect(nextViewport.scrollTop).to.equal(
            Math.min(oldTop, nextViewport.scrollHeight - nextViewport.clientHeight),
          );
        });
        cy.get('[data-key="root-30"]').should('have.attr', 'aria-expanded', 'false');
      });
    });
  }
});
