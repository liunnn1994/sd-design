import { h } from 'vue';

import type { TreeNodeData } from '../interface';

import Tree from '../index';

const treeData: TreeNodeData[] = [{ title: 'Node 1', key: 'node-1' }];

describe('Tree', () => {
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
});
