import Panel from '../panel.vue';

const data = [
  { key: 0, title: 'Zero' },
  { key: 'a', title: 'Alpha' },
];

describe('TreeSelect panel foundation adapter', () => {
  it('overrides child selected keys and preserves controlled single selection requests', () => {
    cy.mount(Panel, {
      props: { treeProps: { data, animation: false, selectedKeys: ['a'] }, selectedKeys: [0] },
    });
    cy.get('[data-key="0"]').should('have.attr', 'aria-selected', 'true');
    cy.get('[data-key="a"] .sd-tree-node-title').click();
    cy.get('@vue').should(({ wrapper }) =>
      expect(wrapper.emitted('change')?.[0]).to.deep.equal([['a']]),
    );
    cy.get('[data-key="0"]').should('have.attr', 'aria-selected', 'true');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ selectedKeys: ['a'] }));
    cy.get('[data-key="a"]').should('have.attr', 'aria-selected', 'true');
  });

  it('routes a zero-key title click through toggleCheck and forwards checkbox changes once', () => {
    cy.mount(Panel, {
      props: {
        treeProps: { data, checkable: true, animation: false },
        showCheckable: true,
        selectedKeys: [],
      },
    });
    cy.get('[data-key="0"] .sd-tree-node-title').click();
    cy.get('@vue').should(({ wrapper }) =>
      expect(wrapper.emitted('change')?.[0]).to.deep.equal([[0]]),
    );
    cy.get('[data-key="0"] input').should('not.be.checked');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ selectedKeys: [0] }));
    cy.get('[data-key="0"] input').should('be.checked');
    cy.get('[data-key="0"]').should('have.attr', 'aria-selected', 'false');
    cy.get('[data-key="a"] .sd-checkbox').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('change')).to.have.length(2);
      expect(wrapper.emitted('change')?.[1]).to.deep.equal([[0, 'a']]);
    });
  });
});
