import { h } from 'vue';

import type { TreeNodeData } from '../interface';

import Tree from '../index';

const treeData: TreeNodeData[] = [{ title: 'Node 1', key: 'node-1' }];

describe('Tree', () => {
  it('exposes tree/treeitem roles and aria-level', () => {
    cy.mount(Tree, { props: { data: treeData } });
    cy.get('.sd-tree').should('have.attr', 'role', 'tree');
    cy.get('.sd-tree-node').should('have.attr', 'role', 'treeitem');
    cy.get('.sd-tree-node').should('have.attr', 'aria-level', '1');
    // 叶子节点不挂 aria-expanded
    cy.get('.sd-tree-node').should('not.have.attr', 'aria-expanded');
  });
  it('emits node dom events with node data and event', () => {
    cy.mount(Tree, { props: { data: treeData } });
    cy.get('.sd-tree-node-title').click();
    cy.get('.sd-tree-node-title').trigger('mouseover');
    cy.get('@vue').should(({ wrapper }) => {
      const nodeClick = wrapper.emitted('nodeClick')?.[0];
      const nodeMouseover = wrapper.emitted('nodeMouseover')?.[0];
      expect(nodeClick?.[0]).to.deep.equal(treeData[0]);
      expect(nodeClick?.[1].type).to.equal('click');
      expect(nodeMouseover?.[0]).to.deep.equal(treeData[0]);
      expect(nodeMouseover?.[1].type).to.equal('mouseover');
    });
  });

  it('emits node long press after holding pointerdown', () => {
    cy.mount(Tree, { props: { data: treeData } });
    cy.get('.sd-tree-node-title').trigger('pointerdown');
    cy.wait(700);
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('nodeLongPress')?.[0]?.[0]).to.deep.equal(treeData[0]);
    });
  });

  it('keeps plain title rendering when ellipsis is disabled', () => {
    cy.mount(Tree, { props: { data: treeData } });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent({ name: 'Ellipsis' }).exists()).to.equal(false);
      expect(wrapper.findComponent({ name: 'PerformantEllipsis' }).exists()).to.equal(false);
    });
    cy.get('.sd-tree-node-title').should('contain.text', 'Node 1');
  });

  it('renders the title with Ellipsis when ellipsis is true', () => {
    cy.mount(Tree, { props: { data: treeData, ellipsis: true } });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent({ name: 'Ellipsis' }).exists()).to.equal(true);
      expect(wrapper.find('.sd-tree-node-title-with-ellipsis').exists()).to.equal(true);
    });
  });

  it('does not wrap a custom title slot with performant ellipsis', () => {
    cy.mount(Tree, {
      props: { data: treeData, ellipsis: 'performant-ellipsis' },
      slots: {
        title: ({ title }: { title: string }) => h('span', { class: 'custom-title' }, title),
      },
    });
    cy.get('.sd-tree-node-title .custom-title').should('exist');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent({ name: 'PerformantEllipsis' }).exists()).to.equal(false);
    });
  });

  it('renders the switcher by default', () => {
    cy.mount(Tree, { props: { data: treeData } });
    cy.get('.sd-tree-node-switcher').should('exist');
  });

  it('does not render the switcher dom when switcher is false', () => {
    cy.mount(Tree, { props: { data: treeData, switcher: false } });
    cy.get('.sd-tree-node-switcher').should('not.exist');
  });

  it('renders the title with PerformantEllipsis when ellipsis is performant-ellipsis', () => {
    cy.mount(Tree, { props: { data: treeData, ellipsis: 'performant-ellipsis' } });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent({ name: 'PerformantEllipsis' }).exists()).to.equal(true);
      expect(wrapper.find('.sd-tree-node-title-with-ellipsis').exists()).to.equal(true);
    });
  });

  const navData: TreeNodeData[] = [
    {
      title: 'A',
      key: 'a',
      children: [
        { title: 'A1', key: 'a1' },
        { title: 'A2', key: 'a2' },
      ],
    },
    { title: 'B', key: 'b' },
  ];

  it('navigates with arrow keys using roving tabindex', () => {
    cy.mount(Tree, { props: { data: navData, defaultExpandAll: true } });
    // only the first (active) node is a tab stop
    cy.get('.sd-tree-node').eq(0).should('have.attr', 'tabindex', '0');
    cy.get('.sd-tree-node').eq(1).should('have.attr', 'tabindex', '-1');
    cy.get('.sd-tree-node').eq(0).focus();
    cy.get('.sd-tree-node').eq(0).trigger('keydown', { key: 'ArrowDown' });
    cy.focused().should('have.attr', 'data-key', 'a1');
    cy.focused().trigger('keydown', { key: 'ArrowDown' });
    cy.focused().should('have.attr', 'data-key', 'a2');
    cy.focused().trigger('keydown', { key: 'ArrowDown' });
    cy.focused().should('have.attr', 'data-key', 'b');
    cy.focused().trigger('keydown', { key: 'Home' });
    cy.focused().should('have.attr', 'data-key', 'a');
    cy.focused().trigger('keydown', { key: 'End' });
    cy.focused().should('have.attr', 'data-key', 'b');
    // Enter selects the focused node
    cy.focused().trigger('keydown', { key: 'Enter' });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('select')?.[0]?.[0]).to.deep.equal(['b']);
    });
  });

  it('expands/collapses and traverses hierarchy with ArrowRight/Left', () => {
    cy.mount(Tree, { props: { data: navData, defaultExpandAll: false, animation: false } });
    cy.get('.sd-tree-node').should('have.length', 2); // a, b (children hidden)
    // ArrowRight on a collapsed parent expands it (no focus move)
    cy.get('[data-key="a"]').trigger('keydown', { key: 'ArrowRight' });
    cy.get('.sd-tree-node').should('have.length', 4); // a, a1, a2, b
    // ArrowRight on an expanded parent moves focus to its first child
    cy.get('[data-key="a"]').trigger('keydown', { key: 'ArrowRight' });
    cy.focused().should('have.attr', 'data-key', 'a1');
    // ArrowLeft on a leaf moves focus to its parent
    cy.get('[data-key="a1"]').trigger('keydown', { key: 'ArrowLeft' });
    cy.focused().should('have.attr', 'data-key', 'a');
    // ArrowLeft on an expanded parent collapses it
    cy.get('[data-key="a"]').trigger('keydown', { key: 'ArrowLeft' });
    cy.get('.sd-tree-node').should('have.length', 2);
  });
});
