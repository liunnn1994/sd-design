import type { TreeProps } from '../index';

export const minimalTreeProps: TreeProps = {
  data: [{ key: 'one', title: 'One' }],
};

export const treeExpandProps: TreeProps = {
  onExpand(_keys, { node, expanded }) {
    const target: import('../interface').TreeNodeData | undefined = node;
    const state: boolean | undefined = expanded;
    void target;
    void state;
  },
};

export function toggleProgrammatically(tree: import('../index').TreeInstance) {
  tree.toggleCheck('one');
}
