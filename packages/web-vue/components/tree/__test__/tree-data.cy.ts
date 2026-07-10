import { type Node } from '../interface';
import { getFlattenTreeData, getKey2TreeNode } from '../utils';
import { generateTreeData } from '../utils/tree-data';

describe('tree-data', () => {
  const data = [
    { title: 'node1', key: 0 },
    { title: 'node2', key: '0' },
    { title: 'node3', key: 3 },
    { title: 'node4', key: 4, selectable: false, checkable: false, draggable: true },
    { title: 'node5', key: 5, selectable: true, checkable: true, draggable: false },
  ];
  const treeData1 = generateTreeData(data, {
    checkable: true,
    selectable: true,
    draggable: false,
    blockNode: false,
    showLine: false,
    loadMore: false,
  });
  const treeData2 = generateTreeData(data, {
    checkable: false,
    selectable: false,
    draggable: true,
    blockNode: false,
    showLine: false,
    loadMore: false,
  });
  const key2TreeNode1 = getKey2TreeNode(getFlattenTreeData(treeData1));
  const key2TreeNode2 = getKey2TreeNode(getFlattenTreeData(treeData2));

  it('gets the right node by key when the key type is number', () => {
    const node1 = key2TreeNode1.get(0) as unknown as Node;
    const node2 = key2TreeNode1.get('0') as unknown as Node;
    expect(node1).to.be.an('object');
    expect(node2).to.be.an('object');
    expect(node1.title).to.equal('node1');
    expect(node2.title).to.equal('node2');
  });

  it('inherits checkable/selectable/draggable from the tree when unspecified', () => {
    const node31 = key2TreeNode1.get(3) as unknown as Node;
    const node32 = key2TreeNode2.get(3) as unknown as Node;
    expect(node31.checkable).to.equal(true);
    expect(node31.selectable).to.equal(true);
    expect(node31.draggable).to.equal(false);
    expect(node32.checkable).to.equal(false);
    expect(node32.selectable).to.equal(false);
    expect(node32.draggable).to.equal(true);
  });

  it('overrides the tree values when specified on the node', () => {
    const node41 = key2TreeNode1.get(4) as unknown as Node;
    const node52 = key2TreeNode2.get(5) as unknown as Node;
    expect(node41.checkable).to.equal(false);
    expect(node41.selectable).to.equal(false);
    expect(node41.draggable).to.equal(true);
    expect(node52.checkable).to.equal(true);
    expect(node52.selectable).to.equal(true);
    expect(node52.draggable).to.equal(false);
  });
});
