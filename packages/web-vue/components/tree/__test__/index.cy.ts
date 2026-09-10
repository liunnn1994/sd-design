import { h } from 'vue';

import type { TreeInstance } from '../index';
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

  it('moves focus up with ArrowUp', () => {
    cy.mount(Tree, { props: { data: navData, defaultExpandAll: true } });
    cy.get('[data-key="b"]').focus();
    cy.get('[data-key="b"]').trigger('keydown', { key: 'ArrowUp' });
    cy.focused().should('have.attr', 'data-key', 'a2');
  });

  it('restores a tab stop when dynamic data removes the active node', () => {
    cy.mount(Tree, { props: { data: navData, defaultExpandAll: true } });
    cy.get('[data-key="b"]').focus().trigger('keydown', { key: 'Home' });
    cy.get('[data-key="a"]').should('have.attr', 'tabindex', '0');
    cy.get('[data-key="a"]').trigger('keydown', { key: 'End' });
    cy.get('[data-key="b"]').should('have.attr', 'tabindex', '0');

    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ data: [navData[0]] }));
    cy.get('[data-key="b"]').should('not.exist');
    cy.get('[data-key="a"]').should('have.attr', 'tabindex', '0');
    cy.get('.sd-tree-node[tabindex="0"]').should('have.length', 1);
  });

  it('toggles the checkbox with Space on a focused checkable node', () => {
    cy.mount(Tree, { props: { data: navData, checkable: true, defaultExpandAll: true } });
    cy.get('[data-key="a1"]').trigger('keydown', { key: ' ' });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('check')?.[0]?.[0]).to.deep.equal(['a1']);
      expect(wrapper.emitted('update:checkedKeys')?.[0]?.[0]).to.deep.equal(['a1']);
      // checkable nodes are toggled, not selected, by keyboard
      expect(wrapper.emitted('select')).to.equal(undefined);
    });
    cy.get('[data-key="a"] .sd-checkbox-indeterminate').should('exist');
  });

  it('selects a node on title click and emits select with node data', () => {
    cy.mount(Tree, { props: { data: navData, defaultExpandAll: true } });
    cy.get('[data-key="a1"] .sd-tree-node-title').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('select')?.[0]?.[0]).to.deep.equal(['a1']);
      expect(wrapper.emitted('select')?.[0]?.[1].selected).to.equal(true);
      expect(wrapper.emitted('select')?.[0]?.[1].node?.key).to.equal('a1');
      expect(wrapper.emitted('select')?.[0]?.[1].selectedNodes).to.have.length(1);
      expect(wrapper.emitted('update:selectedKeys')?.[0]?.[0]).to.deep.equal(['a1']);
    });
    cy.get('[data-key="a1"]').should('have.class', 'sd-tree-node-selected');
  });

  it('supports toggling multiple selection with multiple', () => {
    cy.mount(Tree, { props: { data: navData, defaultExpandAll: true, multiple: true } });
    cy.get('[data-key="a1"] .sd-tree-node-title').click();
    cy.get('[data-key="a2"] .sd-tree-node-title').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('select')?.[1]?.[0]).to.deep.equal(['a1', 'a2']);
    });
    cy.get('[data-key="a1"] .sd-tree-node-title').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('select')?.[2]?.[0]).to.deep.equal(['a2']);
      expect(wrapper.emitted('select')?.[2]?.[1].selected).to.equal(false);
    });
    cy.get('.sd-tree-node-selected').should('have.length', 1);
  });

  it('reflects expanded and selected state in aria attributes', () => {
    cy.mount(Tree, {
      props: { data: navData, defaultExpandAll: false, defaultSelectedKeys: ['b'] },
    });
    cy.get('[data-key="a"]').should('have.attr', 'aria-expanded', 'false');
    cy.get('[data-key="b"]').should('have.attr', 'aria-selected', 'true');
    cy.get('[data-key="a"]').should('have.attr', 'aria-selected', 'false');
  });

  it('ignores selection and checking on disabled nodes', () => {
    const disabledData: TreeNodeData[] = [
      { title: 'Off', key: 'off', disabled: true, children: [{ title: 'Kid', key: 'kid' }] },
      { title: 'NoCheck', key: 'nocheck', disableCheckbox: true },
    ];
    cy.mount(Tree, { props: { data: disabledData, checkable: true, defaultExpandAll: true } });
    cy.get('[data-key="off"]').should('have.class', 'sd-tree-node-disabled');
    cy.get('[data-key="off"]').should('have.attr', 'aria-disabled', 'true');
    cy.get('[data-key="off"]').trigger('keydown', { key: 'Enter' });
    cy.get('[data-key="off"] .sd-tree-node-title').click();
    cy.get('[data-key="off"] .sd-checkbox').should('have.class', 'sd-checkbox-disabled');
    cy.get('[data-key="nocheck"] .sd-checkbox').should('have.class', 'sd-checkbox-disabled');
    cy.get('[data-key="nocheck"] .sd-checkbox-target').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('select')).to.equal(undefined);
      expect(wrapper.emitted('check')).to.equal(undefined);
    });
  });

  it('cascades checkbox state and emits check with halfCheckedKeys', () => {
    cy.mount(Tree, {
      props: { data: navData, checkable: true, defaultExpandAll: true, animation: false },
    });
    // checkbox stays out of the tab order (double tab-stop fix, tabindex on the inner input)
    cy.get('.sd-tree-node .sd-checkbox input').first().should('have.attr', 'tabindex', '-1');
    cy.get('[data-key="a"] .sd-checkbox-target').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:checkedKeys')?.[0]?.[0]).to.deep.equal(['a', 'a1', 'a2']);
      const event = wrapper.emitted('check')?.[0]?.[1];
      expect(event?.checked).to.equal(true);
      expect(event?.node?.key).to.equal('a');
      expect(event?.halfCheckedKeys).to.deep.equal([]);
    });
    cy.get('[data-key="a1"] .sd-checkbox-target').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:checkedKeys')?.[1]?.[0]).to.deep.equal(['a2']);
      expect(wrapper.emitted('check')?.[1]?.[1].checked).to.equal(false);
      expect(wrapper.emitted('check')?.[1]?.[1].halfCheckedKeys).to.deep.equal(['a']);
    });
    cy.get('[data-key="a"] .sd-checkbox-indeterminate').should('exist');
  });

  it('applies defaultCheckedKeys with cascade to children', () => {
    cy.mount(Tree, {
      props: { data: navData, checkable: true, defaultExpandAll: true, defaultCheckedKeys: ['a'] },
    });
    cy.get('[data-key="a"] .sd-checkbox-checked').should('exist');
    cy.get('[data-key="a1"] .sd-checkbox-checked').should('exist');
    cy.get('[data-key="a2"] .sd-checkbox-checked').should('exist');
  });

  it('emits checked keys according to checkedStrategy parent', () => {
    cy.mount(Tree, {
      props: { data: navData, checkable: true, defaultExpandAll: true, checkedStrategy: 'parent' },
    });
    cy.get('[data-key="a"] .sd-checkbox-target').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:checkedKeys')?.[0]?.[0]).to.deep.equal(['a']);
    });
  });

  it('emits checked keys according to checkedStrategy child', () => {
    cy.mount(Tree, {
      props: { data: navData, checkable: true, defaultExpandAll: true, checkedStrategy: 'child' },
    });
    cy.get('[data-key="a"] .sd-checkbox-target').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:checkedKeys')?.[0]?.[0]).to.deep.equal(['a1', 'a2']);
    });
  });

  it('checks only the target node when checkStrictly is true', () => {
    cy.mount(Tree, {
      props: { data: navData, checkable: true, defaultExpandAll: true, checkStrictly: true },
    });
    cy.get('[data-key="a"] .sd-checkbox-target').click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:checkedKeys')?.[0]?.[0]).to.deep.equal(['a']);
    });
    cy.get('[data-key="a"] .sd-checkbox-checked').should('exist');
    cy.get('[data-key="a1"] .sd-checkbox-checked').should('not.exist');
  });

  it('toggles expansion on switcher click and emits expand events', () => {
    cy.mount(Tree, {
      props: { data: navData, defaultExpandAll: false, animation: false },
    });
    cy.get('.sd-tree-node').should('have.length', 2);
    cy.get('[data-key="a"] .sd-tree-node-switcher-icon').click();
    cy.get('.sd-tree-node').should('have.length', 4);
    cy.get('[data-key="a"] .sd-tree-node-switcher-expanded').should('exist');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('expand')?.[0]?.[0]).to.deep.equal(['a']);
      expect(wrapper.emitted('expand')?.[0]?.[1].expanded).to.equal(true);
      expect(wrapper.emitted('update:expandedKeys')?.[0]?.[0]).to.deep.equal(['a']);
    });
    cy.get('[data-key="a"] .sd-tree-node-switcher-icon').click();
    cy.get('.sd-tree-node').should('have.length', 2);
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('expand')?.[1]?.[0]).to.deep.equal([]);
      expect(wrapper.emitted('expand')?.[1]?.[1].expanded).to.equal(false);
    });
  });

  it('expands ancestors of selected nodes with defaultExpandSelected', () => {
    cy.mount(Tree, {
      props: {
        data: navData,
        defaultExpandAll: false,
        defaultExpandSelected: true,
        defaultSelectedKeys: ['a2'],
      },
    });
    cy.get('.sd-tree-node').should('have.length', 4);
  });

  it('expands parents of defaultExpandedKeys with autoExpandParent', () => {
    cy.mount(Tree, {
      props: { data: navData, defaultExpandAll: false, defaultExpandedKeys: ['a1'] },
    });
    cy.get('.sd-tree-node').should('have.length', 4);
    cy.mount(Tree, {
      props: {
        data: navData,
        defaultExpandAll: false,
        defaultExpandedKeys: ['a1'],
        autoExpandParent: false,
      },
    });
    cy.get('.sd-tree-node').should('have.length', 2);
  });

  it('filters visible nodes with filterTreeNode', () => {
    cy.mount(Tree, {
      props: {
        data: navData,
        filterTreeNode: (node: TreeNodeData) => node.title === 'A' || node.title === 'A1',
      },
    });
    cy.get('.sd-tree-node').should('have.length', 2);
    cy.get('.sd-tree-node').should('contain.text', 'A1');
    cy.get('.sd-tree-node').should('not.contain.text', 'A2');
  });

  it('maps custom fieldNames for key/title/children', () => {
    const customData = [{ value: 'k1', label: 'One', items: [{ value: 'k2', label: 'Two' }] }];
    cy.mount(Tree, {
      props: {
        data: customData as unknown as TreeNodeData[],
        fieldNames: { key: 'value', title: 'label', children: 'items' },
        defaultExpandAll: false,
        animation: false,
      },
    });
    cy.get('.sd-tree-node').should('have.length', 1);
    cy.get('.sd-tree-node').should('contain.text', 'One');
    cy.get('[data-key="k1"] .sd-tree-node-switcher-icon').click();
    cy.get('.sd-tree-node').should('have.length', 2);
    cy.get('.sd-tree-node').should('contain.text', 'Two');
  });

  it('expands the node on title click with actionOnNodeClick expand', () => {
    cy.mount(Tree, {
      props: {
        data: navData,
        defaultExpandAll: false,
        animation: false,
        actionOnNodeClick: 'expand',
      },
    });
    cy.get('[data-key="a"] .sd-tree-node-title').click();
    cy.get('.sd-tree-node').should('have.length', 4);
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('select')?.[0]?.[0]).to.deep.equal(['a']);
    });
  });

  it('renders showLine switcher variants plus file icon for leaves', () => {
    cy.mount(Tree, { props: { data: navData, showLine: true, defaultExpandAll: false } });
    cy.get('.sd-tree').should('have.class', 'sd-tree-show-line');
    cy.get('.sd-tree-node-plus-icon').should('exist');
    cy.mount(Tree, { props: { data: navData, showLine: true } });
    cy.get('.sd-tree-node-minus-icon').should('exist');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent({ name: 'IconFile' }).exists()).to.equal(true);
    });
  });

  it('applies size and blockNode classes', () => {
    cy.mount(Tree, { props: { data: treeData, size: 'small', blockNode: true } });
    cy.get('.sd-tree').should('have.class', 'sd-tree-size-small');
    cy.get('.sd-tree-node-title-block').should('exist');
  });

  it('renders an empty tree without nodes', () => {
    cy.mount(Tree, { props: { data: [] } });
    cy.get('.sd-tree-node').should('not.exist');
  });

  it('emits nodeDblclick and nodeContextmenu', () => {
    cy.mount(Tree, { props: { data: treeData } });
    cy.get('.sd-tree-node-title').trigger('dblclick');
    cy.get('.sd-tree-node-title').trigger('contextmenu');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('nodeDblclick')?.[0]?.[0]).to.deep.equal(treeData[0]);
      expect(wrapper.emitted('nodeContextmenu')?.[0]?.[1].type).to.equal('contextmenu');
    });
  });

  it('renders node icons from data or the icon slot with extra slot content', () => {
    const iconData: TreeNodeData[] = [
      { title: 'With icon', key: 'i1', icon: () => h('span', { class: 'data-icon' }, 'd') },
    ];
    cy.mount(Tree, { props: { data: iconData } });
    cy.get('.sd-tree-node-custom-icon .data-icon').should('exist');

    cy.mount(Tree, {
      props: { data: navData },
      slots: {
        icon: ({ isLeaf }: { isLeaf: boolean }) =>
          h('span', { class: 'slot-icon' }, isLeaf ? 'leaf' : 'dir'),
        extra: () => h('span', { class: 'slot-extra' }, 'extra'),
      },
    });
    cy.get('.sd-tree-node-custom-icon .slot-icon').should('have.length', 4);
    cy.get('.sd-tree-node-custom-icon .slot-icon').first().should('have.text', 'dir');
    cy.get('.slot-extra').should('have.length', 4);
  });

  it('omits the custom switcher icon on plain leaves without showLine', () => {
    const leafData: TreeNodeData[] = [{ title: 'Leaf', key: 'leaf' }];
    cy.mount(Tree, {
      props: { data: leafData },
      slots: { 'switcher-icon': () => h('span', { class: 'custom-switcher-icon' }) },
    });
    cy.get('.custom-switcher-icon').should('not.exist');
    cy.mount(Tree, {
      props: { data: leafData, showLine: true },
      slots: { 'switcher-icon': () => h('span', { class: 'custom-switcher-icon' }) },
    });
    cy.get('.sd-tree-node-switcher-icon .custom-switcher-icon').should('exist');
  });

  it('renders the drag icon for draggable nodes, preferring the drag-icon slot', () => {
    cy.mount(Tree, { props: { data: treeData, draggable: true } });
    cy.get('.sd-tree-node-drag-icon').should('exist');
    cy.mount(Tree, {
      props: { data: treeData, draggable: true },
      slots: { 'drag-icon': () => h('span', { class: 'custom-drag-icon' }) },
    });
    cy.get('.sd-tree-node-drag-icon .custom-drag-icon').should('exist');
  });

  it('emits dragStart/dragOver/drop/dragLeave/dragEnd with node payloads', () => {
    cy.mount(Tree, {
      props: { data: navData, defaultExpandAll: true, draggable: true },
    });
    cy.get('[data-key="a1"] .sd-tree-node-title').trigger('dragstart');
    cy.get('[data-key="a2"] .sd-tree-node-title').then(($title) => {
      const rect = $title[0].getBoundingClientRect();
      // pageY at the vertical middle of the target => dropPosition 0
      cy.wrap($title).trigger('dragover', {
        pageX: rect.left + rect.width / 2,
        pageY: window.pageYOffset + rect.top + rect.height / 2,
      });
    });
    // dropPosition is updated through a raf-throttled handler
    cy.wait(60);
    cy.get('[data-key="a2"] .sd-tree-node-title-highlight').should('exist');
    cy.get('[data-key="a2"] .sd-tree-node-title').trigger('drop');
    cy.get('[data-key="a2"] .sd-tree-node-title').trigger('dragleave');
    cy.get('[data-key="a1"] .sd-tree-node-title').trigger('dragend');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('dragStart')?.[0]?.[1].key).to.equal('a1');
      expect(wrapper.emitted('dragOver')?.[0]?.[1].key).to.equal('a2');
      expect(wrapper.emitted('dragLeave')?.[0]?.[1].key).to.equal('a2');
      expect(wrapper.emitted('dragEnd')?.[0]?.[1].key).to.equal('a1');
      const drop = wrapper.emitted('drop')?.[0]?.[0];
      expect(drop?.dragNode.key).to.equal('a1');
      expect(drop?.dropNode.key).to.equal('a2');
      expect(drop?.dropPosition).to.equal(0);
    });
  });

  it('does not emit drop when allowDrop returns false', () => {
    cy.mount(Tree, {
      props: {
        data: navData,
        defaultExpandAll: true,
        draggable: true,
        allowDrop: () => false,
      },
    });
    cy.get('[data-key="a1"] .sd-tree-node-title').trigger('dragstart');
    cy.get('[data-key="a2"] .sd-tree-node-title').then(($title) => {
      const rect = $title[0].getBoundingClientRect();
      cy.wrap($title).trigger('dragover', {
        pageX: rect.left + rect.width / 2,
        pageY: window.pageYOffset + rect.top + rect.height / 2,
      });
    });
    cy.wait(60);
    cy.get('[data-key="a2"] .sd-tree-node-title-highlight').should('not.exist');
    cy.get('[data-key="a2"] .sd-tree-node-title').trigger('drop');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('drop')).to.equal(undefined);
    });
  });

  it('shows loading state and emits expand after loadMore resolves', () => {
    let resolveLoad: (() => void) | undefined;
    cy.mount(Tree, {
      props: {
        data: [{ key: 'a', title: 'A', isLeaf: false }],
        loadMore: () =>
          new Promise<void>((resolve) => {
            resolveLoad = resolve;
          }),
      },
    });
    cy.get('.sd-tree-node-switcher-icon').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent({ name: 'IconLoading' }).exists()).to.equal(true);
    });
    cy.then(() => resolveLoad?.());
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent({ name: 'IconLoading' }).exists()).to.equal(false);
      expect(wrapper.emitted('update:expandedKeys')?.[0]?.[0]).to.deep.equal(['a']);
    });
  });

  it('clears loading state without expanding when loadMore rejects', () => {
    let consoleError: { getCalls(): { args: unknown[] }[] } | undefined;
    cy.mount(Tree, {
      props: {
        data: [{ key: 'a', title: 'A', isLeaf: false }],
        loadMore: () => Promise.reject(new Error('boom')),
      },
    });
    cy.window().then((win) => {
      consoleError = cy.spy(win.console, 'error') as unknown as {
        getCalls(): { args: unknown[] }[];
      };
    });
    cy.get('.sd-tree-node-switcher-icon').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.findComponent({ name: 'IconLoading' }).exists()).to.equal(false);
      expect(wrapper.emitted('expand')).to.equal(undefined);
      const messages = (consoleError?.getCalls() ?? []).map((call) =>
        call.args.map(String).join(' '),
      );
      expect(messages.some((msg) => msg.includes('load data error'))).to.equal(true);
    });
  });

  it('exposes expandAll/expandNode for programmatic expansion', () => {
    cy.mount(Tree, { props: { data: navData, defaultExpandAll: false, animation: false } });
    cy.get('.sd-tree-node').should('have.length', 2);
    cy.get('@vue').then(({ wrapper }) => {
      (wrapper.vm as unknown as TreeInstance).expandNode('a');
    });
    cy.get('.sd-tree-node').should('have.length', 4);
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:expandedKeys')?.[0]?.[0]).to.deep.equal(['a']);
    });
    cy.get('@vue').then(({ wrapper }) => {
      (wrapper.vm as unknown as TreeInstance).expandAll(false);
    });
    cy.get('.sd-tree-node').should('have.length', 2);
    cy.get('@vue').then(({ wrapper }) => {
      (wrapper.vm as unknown as TreeInstance).expandAll(true);
    });
    cy.get('.sd-tree-node').should('have.length', 4);
  });

  it('exposes checkAll/checkNode/toggleCheck for programmatic checking', () => {
    cy.mount(Tree, { props: { data: navData, checkable: true, defaultExpandAll: true } });
    cy.get('@vue').then(({ wrapper }) => {
      (wrapper.vm as unknown as TreeInstance).checkAll();
    });
    cy.get('@vue').should(({ wrapper }) => {
      // checkAll selects every checkable node (a, a1, a2 and leaf b)
      expect(wrapper.emitted('update:checkedKeys')?.[0]?.[0])
        .to.have.members(['a', 'a1', 'a2', 'b'])
        .and.to.have.length(4);
    });
    cy.get('.sd-checkbox-checked').should('have.length', 4);
    cy.get('@vue').then(({ wrapper }) => {
      (wrapper.vm as unknown as TreeInstance).checkNode('a1', false);
    });
    cy.get('@vue').should(({ wrapper }) => {
      // a becomes half-checked once a1 is unchecked
      expect(wrapper.emitted('update:checkedKeys')?.[1]?.[0])
        .to.have.members(['a2', 'b'])
        .and.to.have.length(2);
    });
    cy.get('[data-key="a"] .sd-checkbox-indeterminate').should('exist');
    cy.get('@vue').then(({ wrapper }) => {
      (wrapper.vm as unknown as TreeInstance).toggleCheck('a1');
    });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:checkedKeys')?.[2]?.[0])
        .to.have.members(['a', 'a1', 'a2', 'b'])
        .and.to.have.length(4);
    });
    cy.get('@vue').then(({ wrapper }) => {
      (wrapper.vm as unknown as TreeInstance).checkAll(false);
    });
    cy.get('.sd-checkbox-checked').should('have.length', 0);
  });

  it('exposes selectAll/selectNode for programmatic selection', () => {
    cy.mount(Tree, { props: { data: navData, multiple: true, defaultExpandAll: true } });
    cy.get('@vue').then(({ wrapper }) => {
      (wrapper.vm as unknown as TreeInstance).selectAll();
    });
    cy.get('.sd-tree-node-selected').should('have.length', 4);
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('update:selectedKeys')?.[0]?.[0])
        .to.have.members(['a', 'a1', 'a2', 'b'])
        .and.to.have.length(4);
    });
    cy.get('@vue').then(({ wrapper }) => {
      (wrapper.vm as unknown as TreeInstance).selectNode('a', false);
    });
    cy.get('.sd-tree-node-selected').should('have.length', 3);
  });

  it('exposes getters for checked/selected/expanded/half-checked nodes', () => {
    cy.mount(Tree, {
      props: {
        data: navData,
        checkable: true,
        defaultExpandAll: true,
        defaultCheckedKeys: ['a1'],
        defaultSelectedKeys: ['b'],
      },
    });
    cy.get('@vue').should(({ wrapper }) => {
      const vm = wrapper.vm as unknown as TreeInstance;
      expect(vm.getCheckedNodes().map((n) => n.key)).to.deep.equal(['a1']);
      expect(vm.getCheckedNodes({ includeHalfChecked: true }).map((n) => n.key)).to.deep.equal([
        'a1',
        'a',
      ]);
      expect(vm.getHalfCheckedNodes().map((n) => n.key)).to.deep.equal(['a']);
      expect(vm.getSelectedNodes().map((n) => n.key)).to.deep.equal(['b']);
      expect(vm.getExpandedNodes().map((n) => n.key)).to.deep.equal(['a']);
    });
  });
});
