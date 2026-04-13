---
title: "tree"
outline: "deep"
---

```yaml
meta:
  type: 组件
  category: 数据展示
title: 树 Tree
description: 对于文件夹、分类目录、组织架构等层级较多的内容，树可以清楚显示他们的层级关系，并具有展开、收起、选择等交互功能。
```

















## API


### `<tree>` Props

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|size|尺寸|`'mini' \| 'small' \| 'medium' \| 'large'`|`'medium'`||
|block-node|节点是否占据一行|`boolean`|`false`||
|default-expand-all|是否默认展开父节点|`boolean`|`true`||
|multiple|是否支持多选|`boolean`|`false`||
|checkable|是否在节点前添加复选框，从 `2.27.0` 开始支持函数格式|`boolean\| ((    node: TreeNodeData,    info: {      level: number;      isLeaf: boolean;    }  ) => boolean)`|`false`||
|selectable|是否支持选择，从 `2.27.0` 开始支持函数格式|`boolean\| ((    node: TreeNodeData,    info: {      level: number;      isLeaf: boolean;    }  ) => boolean)`|`true`||
|check-strictly|是否取消父子节点关联|`boolean`|`false`||
|checked-strategy|定制回填方式 <br/> all: 返回所有选中的节点  <br/> parent: 父子节点都选中时只返回父节点 <br/> child: 只返回子节点|`'all' \| 'parent' \| 'child'`|`'all'`||
|default-selected-keys|默认选中的树节点|`Array<string \| number>`|`-`||
|selected-keys **(v-model)**|选中的树节点|`Array<string \| number>`|`-`||
|default-checked-keys|默认选中复选框的树节点|`Array<string \| number>`|`-`||
|checked-keys **(v-model)**|选中复选框的树节点|`Array<string \| number>`|`-`||
|default-expanded-keys|默认展开的节点|`Array<string \| number>`|`-`||
|expanded-keys **(v-model)**|展开的节点|`Array<string \| number>`|`-`||
|data|传入`data`,生成对应的树结构|`TreeNodeData[]`|`[]`||
|field-names|指定节点数据中的字段名|`TreeFieldNames`|`-`||
|show-line|是否展示连接线|`boolean`|`false`||
|load-more|异步加载数据的回调，返回一个 `Promise`|`(node: TreeNodeData) => Promise<void>`|`-`||
|draggable|是否可以拖拽|`boolean`|`false`||
|allow-drop|拖拽时是否允许在某节点上释放|`(options: {  dropNode: TreeNodeData;  dropPosition: -1 \| 0 \| 1;}) => boolean`|`-`||
|virtual-list-props|传递虚拟列表属性，传入此参数以开启虚拟滚动，[VirtualListProps](#VirtualListProps)|`VirtualListProps`|`-`||
|default-expand-selected|是否默认展开已选中节点的父节点|`boolean`|`false`|2.9.0|
|default-expand-checked|是否默认展开已选中复选框节点的父节点|`boolean`|`false`|2.9.0|
|auto-expand-parent|是否自动展开已展开节点的父节点|`boolean`|`true`|2.9.0|
|half-checked-keys **(v-model)**|半选状态的节点.仅在 checkable 且 checkStrictly 时生效|`Array<string \| number>`|`-`|2.19.0|
|only-check-leaf|开启后 checkedKeys 只处理叶子节点，父节点状态由子节点决定（仅在 checkable 且 checkStrictly 为 false 时生效）|`boolean`|`false`|2.21.0|
|animation|是否开启展开时的过渡动效|`boolean`|`true`|2.21.0|
|action-on-node-click|点击节点的时候触发的动作|`'expand'`|`-`|2.27.0|
### `<tree>` Events

|事件名|描述|参数|
|---|---|---|
|select|点击树节点时触发|selectedKeys: `Array<string \| number>`<br>data: `{ selected?: boolean; selectedNodes: TreeNodeData[]; node?: TreeNodeData; e?: Event; }`|
|check|点击树节点复选框时触发。`halfCheckedKeys` 和 `halfCheckedNodes` 从 `2.19.0` 开始支持。|checkedKeys: `Array<string \| number>`<br>data: `{ checked?: boolean; checkedNodes: TreeNodeData[]; node?: TreeNodeData; e?: Event; halfCheckedKeys: (string \| number)[]; halfCheckedNodes: TreeNodeData[]; }`|
|expand|展开/关闭|expandKeys: `Array<string \| number>`<br>data: `{ expanded?: boolean; expandNodes: TreeNodeData[]; node?: TreeNodeData; e?: Event; }`|
|drag-start|节点开始拖拽|ev: `DragEvent`<br>node: `TreeNodeData`|
|drag-end|节点结束拖拽|ev: `DragEvent`<br>node: `TreeNodeData`|
|drag-over|节点被拖拽至可释放目标|ev: `DragEvent`<br>node: `TreeNodeData`|
|drag-leave|节点离开可释放目标|ev: `DragEvent`<br>node: `TreeNodeData`|
|drop|节点在可释放目标上释放|data: `{ e: DragEvent; dragNode: TreeNodeData; dropNode: TreeNodeData; dropPosition: number; }`|
### `<tree>` Methods

|方法名|描述|参数|返回值|版本|
|---|---|---|---|:---|
|scrollIntoView|虚拟列表滚动某个元素|options: `{ index?: number; key?: number \| string; align: 'auto' \| 'top' \| 'bottom'}`|-||
|getSelectedNodes|获取选中的节点|-|TreeNodeData[]|2.19.0|
|getCheckedNodes|获取选中复选框的节点。支持传入 `checkedStrategy`，没有传则取组件的配置。|options: ` checkedStrategy?: 'all' \| 'parent' \| 'child'; includeHalfChecked?: boolean; `|TreeNodeData[]|2.19.0|
|getHalfCheckedNodes|获取复选框半选的节点|-|TreeNodeData[]|2.19.0|
|getExpandedNodes|获取展开的节点|-|TreeNodeData[]|2.19.0|
|checkAll|设置全部节点的复选框状态|checked: ` boolean `|-|2.20.0|
|checkNode|设置指定节点的复选框状态|key: ` TreeNodeKey \| TreeNodeKey[] `<br>checked: ` boolean `<br>onlyCheckLeaf: ` boolean `|-|2.20.0，onlyCheckLeaf from 2.21.0|
|selectAll|设置全部节点的选中状态|selected: ` boolean `|-|2.20.0|
|selectNode|设置指定节点的选中状态|key: ` TreeNodeKey \| TreeNodeKey[] `<br>selected: ` boolean `|-|2.20.0|
|expandAll|设置全部节点的展开状态|expanded: ` boolean `|-|2.20.0|
|expandNode|设置指定节点的展开状态|key: ` TreeNodeKey \| TreeNodeKey[] `<br>expanded: ` boolean `|-|2.20.0|
### `<tree>` Slots

|插槽名|描述|参数|版本|
|---|:---:|---|:---|
|title|标题|title: `string`||
|extra|渲染额外的节点内容|-||
|drag-icon|定制 drag 图标|node: `TreeNodeData`||
|loading-icon|定制 loading 图标|-||
|switcher-icon|定制 switcher 图标|-||
|icon|定制节点图标|node: `TreeNodeData`|2.18.0|




### TreeNodeData

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|key|唯一标示|`string \| number`|`-`|
|title|该节点显示的标题|`string`|`-`|
|selectable|是否允许选中|`boolean`|`false`|
|disabled|是否禁用节点|`boolean`|`false`|
|disableCheckbox|是否禁用复选框|`boolean`|`false`|
|checkable|是否显示多选框|`boolean`|`false`|
|draggable|是否可以拖拽|`boolean`|`false`|
|isLeaf|是否是叶子节点。动态加载时有效|`boolean`|`false`|
|icon|节点的图标|`() => VNode`|`-`|
|switcherIcon|定制 switcher 图标，优先级大于 tree|`() => VNode`|`-`|
|loadingIcon|定制 loading 图标，优先级大于 tree|`() => VNode`|`-`|
|dragIcon|定制 drag 图标，优先级大于 tree|`() => VNode`|`-`|
|children|子节点|`TreeNodeData[]`|`-`|



### TreeFieldNames

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|key|指定 key 在 TreeNodeData 中的字段名|`string`|`key`|
|title|指定 title 在 TreeNodeData 中的字段名|`string`|`title`|
|disabled|指定 disabled 在 TreeNodeData 中的字段名|`string`|`disabled`|
|children|指定 children 在 TreeNodeData 中的字段名|`string`|`children`|
|isLeaf|指定 isLeaf 在 TreeNodeData 中的字段名|`string`|`isLeaf`|
|disableCheckbox|指定 disableCheckbox 在 TreeNodeData 中的字段名|`string`|`disableCheckbox`|
|checkable|指定 checkable 在 TreeNodeData 中的字段名|`string`|`checkable`|
|icon|指定 icon 在 TreeNodeData 中的字段名|`string`|`checkable`|




### VirtualListProps

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|height|可视区域高度|`number \| string`|`-`||
|threshold|开启虚拟滚动的元素数量阈值，当数据数量小于阈值时不会开启虚拟滚动。|`number`|`-`||
|isStaticItemHeight|（已废除）元素高度是否是固定的。2.34.1 版本废除，请使用 `fixedSize`|`boolean`|`false`||
|fixedSize|元素高度是否是固定的。|`boolean`|`false`|2.34.1|
|estimatedSize|元素高度不固定时的预估高度。|`number`|`-`|2.34.1|
|buffer|视口边界外提前挂载的元素数量。|`number`|`10`|2.34.1|

<script setup lang="ts">
import basicDemo from '../../.vitepress/theme/generated/tree/basic.vue';
const basicSource = "<template>\n  <a-tree\n    :data=\"treeData\"\n    :default-expanded-keys=\"['0-0-0']\"\n    :default-selected-keys=\"['0-0-0', '0-0-1']\"\n  />\n<\/template>\n<script>\n  export default {\n    data() {\n      return {\n        treeData,\n      };\n    },\n  };\n\n  const treeData = [\n    {\n      title: 'Trunk 0-0',\n      key: '0-0',\n      children: [\n        {\n          title: 'Branch 0-0-0',\n          key: '0-0-0',\n          disabled: true,\n          children: [\n            {\n              title: 'Leaf',\n              key: '0-0-0-0',\n            },\n            {\n              title: 'Leaf',\n              key: '0-0-0-1',\n            }\n          ]\n        },\n        {\n          title: 'Branch 0-0-1',\n          key: '0-0-1',\n          children: [\n            {\n              title: 'Leaf',\n              key: '0-0-1-0',\n            },\n          ]\n        },\n      ],\n    },\n  ];\n<\/script>";
const basicTitle = "Basic.Md";
const basicDescription = "为每个节点赋予全局唯一的 `key`（必填项），`title` 为该节点显示的内容。";
import blockNodeDemo from '../../.vitepress/theme/generated/tree/blockNode.vue';
const blockNodeSource = "<template>\n  <a-tree blockNode :data=\"treeData\" />\n<\/template>\n<script>\n  export default {\n    data() {\n      return {\n        treeData,\n      };\n    },\n  };\n\n  const treeData = [\n    {\n      title: 'Trunk 0-0',\n      key: '0-0',\n      children: [\n        {\n          title: 'Branch 0-0-0',\n          key: '0-0-0',\n          children: [\n            {\n              title: 'Leaf',\n              key: '0-0-0-0',\n            },\n            {\n              title: 'Leaf',\n              key: '0-0-0-1',\n            }\n          ]\n        },\n        {\n          title: 'Branch 0-0-1',\n          key: '0-0-1',\n          children: [\n            {\n              title: 'Leaf',\n              key: '0-0-1-0',\n            },\n          ]\n        },\n      ],\n    },\n  ];\n<\/script>";
const blockNodeTitle = "Block Node.Md";
const blockNodeDescription = "节点占据一整行。";
import checkableDemo from '../../.vitepress/theme/generated/tree/checkable.vue';
const checkableSource = "<template>\n  <a-checkbox\n    style=\"marginBottom: 24px;\"\n    v-model=\"checkStrictly\"\n    @change=\"() => {\n      checkedKeys = [];\n    }\"\n  >\n    checkStrictly\n  <\/a-checkbox>\n  <a-tree\n    :checkable=\"true\"\n    v-model:checked-keys=\"checkedKeys\"\n    :check-strictly=\"checkStrictly\"\n    :data=\"treeData\"\n  />\n<\/template>\n<script>\n  import { ref } from 'vue';\n\n  export default {\n    setup() {\n    const checkedKeys = ref([]);\n    const checkStrictly = ref(false);\n\n      return {\n        checkedKeys,\n        checkStrictly,\n        treeData,\n      }\n    }\n  }\n\n  const treeData = [\n    {\n      title: 'Trunk 0-0',\n      key: '0-0',\n      children: [\n        {\n          title: 'Leaf',\n          key: '0-0-1',\n        },\n        {\n          title: 'Branch 0-0-2',\n          key: '0-0-2',\n          disabled: true,\n          children: [\n            {\n              title: 'Leaf',\n              key: '0-0-2-1'\n            },\n            {\n              title: 'Leaf',\n              key: '0-0-2-2',\n              disableCheckbox: true\n            }\n          ]\n        },\n      ],\n    },\n    {\n      title: 'Trunk 0-1',\n      key: '0-1',\n      children: [\n        {\n          title: 'Branch 0-1-1',\n          key: '0-1-1',\n          children: [\n            {\n              title: 'Leaf ',\n              key: '0-1-1-1',\n            },\n            {\n              title: 'Leaf ',\n              key: '0-1-1-2',\n            },\n          ]\n        },\n        {\n          title: 'Leaf',\n          key: '0-1-2',\n        },\n      ],\n    },\n  ];\n<\/script>";
const checkableTitle = "Checkable.Md";
const checkableDescription = "为 `Tree` 添加 `checkable` 属性即可使树具有复选框功能，可以用 `defaultCheckedKeys` 指定复选框默认选中的节点。";
import checkedStrategyDemo from '../../.vitepress/theme/generated/tree/checkedStrategy.vue';
const checkedStrategySource = "<template>\n  <a-radio-group\n    type='button'\n    v-model=\"checkedStrategy\"\n    @change=\"(value) => {\n      checkedKeys = []\n    }\"\n  >\n    <a-radio\n      v-for=\"item in strategyOptions\"\n      :key=\"item?.value\"\n      :value=\"item?.value\"\n    >\n      {{ item?.label }}\n    <\/a-radio>\n  <\/a-radio-group>\n  <br/>\n  <a-typography-text style=\"margin: 24px 0; display: inline-block;\">\n    Current: {{ checkedKeys?.join(' , ') }}\n  <\/a-typography-text>\n  <br/>\n  <a-tree\n    :checkable=\"true\"\n    v-model:checked-keys=\"checkedKeys\"\n    :checked-strategy=\"checkedStrategy\"\n    :data=\"treeData\"\n  />\n<\/template>\n<script>\n  import { ref } from 'vue';\n\n  const treeData = [\n    {\n      title: 'Trunk 0-0',\n      key: '0-0',\n      children: [\n        {\n          title: 'Leaf',\n          key: '0-0-1',\n        },\n        {\n          title: 'Branch 0-0-2',\n          key: '0-0-2',\n          children: [\n            {\n              title: 'Leaf',\n              key: '0-0-2-1'\n            }\n          ]\n        },\n      ],\n    },\n    {\n      title: 'Trunk 0-1',\n      key: '0-1',\n      children: [\n        {\n          title: 'Branch 0-1-1',\n          key: '0-1-1',\n          children: [\n            {\n              title: 'Leaf',\n              key: '0-1-1-1',\n            },\n            {\n              title: 'Leaf',\n              key: '0-1-1-2',\n            },\n          ]\n        },\n        {\n          title: 'Leaf',\n          key: '0-1-2',\n        },\n      ],\n    },\n  ];\n\n  const strategyOptions = [\n    {\n      value: 'all',\n      label: 'show all'\n    },\n    {\n      value: 'parent',\n      label: 'show parent'\n    },\n    {\n      value: 'child',\n      label: 'show child'\n    }\n  ];\n\n  export default {\n    setup() {\n      const checkedKeys = ref([]);\n      const checkedStrategy = ref('all');\n\n      return {\n        treeData,\n        strategyOptions,\n        checkedStrategy,\n        checkedKeys,\n      }\n    }\n  }\n<\/script>";
const checkedStrategyTitle = "Checked Strategy.Md";
const checkedStrategyDescription = "为 `Tree` 添加 `checkedStrategy` 可以设置选中时的回填方式";
import controlDemo from '../../.vitepress/theme/generated/tree/control.vue';
const controlSource = "<template>\n  <a-button-group style=\"margin-bottom: 20px;\">\n    <a-button\n      type=\"primary\"\n      @click=\"toggleChecked\"\n    >\n      {{\n        checkedKeys?.length ? 'deselect all' : 'select all'\n      }}\n    <\/a-button>\n    <a-button\n      type=\"primary\"\n      @click=\"toggleExpanded\"\n    >\n      {{\n        expandedKeys?.length ? 'fold' : 'unfold'\n      }}\n    <\/a-button>\n  <\/a-button-group>\n  <a-tree\n    :checkable=\"true\"\n    v-model:selected-keys=\"selectedKeys\"\n    v-model:checked-keys=\"checkedKeys\"\n    v-model:expanded-keys=\"expandedKeys\"\n    @select=\"onSelect\"\n    @check=\"onCheck\"\n    @expand=\"onExpand\"\n    :data=\"treeData\"\n  />\n<\/template>\n<script>\n  import { ref } from 'vue';\n\n  const allCheckedKeys = ['0-0', '0-0-1', '0-0-2', '0-0-2-1', '0-1', '0-1-1', '0-1-2'];\n  const allExpandedKeys = ['0-0', '0-1', '0-0-2'];\n\n\n  export default {\n    setup() {\n      const selectedKeys = ref([]);\n      const checkedKeys = ref([]);\n      const expandedKeys = ref([]);\n\n\n      return {\n        selectedKeys,\n        checkedKeys,\n        expandedKeys,\n        treeData,\n        toggleChecked() {\n          checkedKeys.value = checkedKeys?.value.length ? [] : allCheckedKeys;\n        },\n        toggleExpanded() {\n          expandedKeys.value = expandedKeys?.value.length ? [] : allExpandedKeys;\n        },\n        onSelect(newSelectedKeys, event) {\n          console.log('select: ', newSelectedKeys, event);\n        },\n        onCheck(newCheckedKeys, event) {\n          console.log('check: ', newCheckedKeys, event);\n        },\n        onExpand(newExpandedKeys, event) {\n          console.log('expand: ', newExpandedKeys, event);\n        },\n      };\n    },\n  };\n\n  const treeData = [\n    {\n      title: 'Trunk 0-0',\n      key: '0-0',\n      children: [\n        {\n          title: 'Leaf 0-0-1',\n          key: '0-0-1',\n        },\n        {\n          title: 'Branch 0-0-2',\n          key: '0-0-2',\n          children: [\n            {\n              title: 'Leaf 0-0-2-1',\n              key: '0-0-2-1'\n            }\n          ]\n        },\n      ],\n    },\n    {\n      title: 'Trunk 0-1',\n      key: '0-1',\n      children: [\n        {\n          title: 'Leaf 0-1-1',\n          key: '0-1-1',\n        },\n        {\n          title: 'Leaf 0-1-2',\n          key: '0-1-2',\n        },\n      ],\n    },\n  ];\n<\/script>";
const controlTitle = "Control.Md";
const controlDescription = "`selectedKeys` 、 `checkedKeys` 、 `expandedKeys` 属性均可受控，不仅支持 `v-model` ，还可以在对应的 `select` / `check` / `expand` 事件中自行控制如何更新属性值。";
import draggableDemo from '../../.vitepress/theme/generated/tree/draggable.vue';
const draggableSource = "<template>\n  <a-checkbox\n    v-model=\"checked\"\n    style=\"margin-bottom: 20px;\"\n  >\n    checkable\n  <\/a-checkbox>\n  <a-tree\n    class=\"tree-demo\"\n    draggable\n    blockNode\n    :checkable=\"checked\"\n    :data=\"treeData\"\n    @drop=\"onDrop\"\n  />\n<\/template>\n<script>\n  import { ref } from 'vue';\n  export default {\n    setup() {\n      const treeData = ref(defaultTreeData);\n      const checkedKeys = ref([]);\n      const checked = ref(false);\n\n      return {\n        treeData,\n        checkedKeys,\n        checked,\n        onDrop({ dragNode, dropNode, dropPosition }) {\n          const data = treeData.value;\n          const loop = (data, key, callback) => {\n            data.some((item, index, arr) => {\n              if (item.key === key) {\n                callback(item, index, arr);\n                return true;\n              }\n              if (item.children) {\n                return loop(item.children, key, callback);\n              }\n              return false;\n            });\n          };\n\n          loop(data, dragNode.key, (_, index, arr) => {\n            arr.splice(index, 1);\n          });\n\n          if (dropPosition === 0) {\n            loop(data, dropNode.key, (item) => {\n              item.children = item.children || [];\n              item.children.push(dragNode);\n            });\n          } else {\n            loop(data, dropNode.key, (_, index, arr) => {\n              arr.splice(dropPosition < 0 ? index : index + 1, 0, dragNode);\n            });\n          }\n        }\n      };\n    }\n  };\n\n  const defaultTreeData = [\n    {\n      title: 'Trunk 0-0',\n      key: '0-0',\n      children: [\n        {\n          title: 'Leaf 0-0-1',\n          key: '0-0-1',\n        },\n        {\n          title: 'Branch 0-0-2',\n          key: '0-0-2',\n          disableCheckbox: true,\n          children: [\n            {\n              draggable: false,\n              title: 'Leaf 0-0-2-1 (Drag disabled)',\n              key: '0-0-2-1'\n            }\n          ]\n        },\n      ],\n    },\n    {\n      title: 'Trunk 0-1',\n      key: '0-1',\n      children: [\n        {\n          title: 'Branch 0-1-1',\n          key: '0-1-1',\n          checkable: false,\n          children: [\n            {\n              title: 'Leaf 0-1-1-1',\n              key: '0-1-1-1',\n            },\n            {\n              title: 'Leaf 0-1-1-2',\n              key: '0-1-1-2',\n            },\n          ]\n        },\n        {\n          title: 'Leaf 0-1-2',\n          key: '0-1-2',\n        },\n      ],\n    },\n  ]\n<\/script>\n<style scoped>\n.tree-demo :deep(.tree-node-dropover) > :deep(.sd-tree-node-title),\n.tree-demo :deep(.tree-node-dropover) > :deep(.sd-tree-node-title):hover, {\n  animation: blinkBg 0.4s 2;\n}\n\n@keyframes blinkBg {\n  0% {\n    background-color: transparent;\n  }\n\n  100% {\n    background-color: var(--color-primary-light-1);\n  }\n}\n<\/style>";
const draggableTitle = "Draggable.Md";
const draggableDescription = "可拖拽的树节点。";
import fieldNamesDemo from '../../.vitepress/theme/generated/tree/fieldNames.vue';
const fieldNamesSource = "<template>\n  <a-tree\n    :default-selected-keys=\"['0-0-1']\"\n    :fieldNames=\"{\n      key: 'value',\n      title: 'label',\n      children: 'items',\n      icon: 'customIcon'\n    }\"\n    :data=\"treeData\"\n  />\n<\/template>\n<script>\n  import { h } from 'vue';\n  import { IconStar, IconDriveFile } from '@sd-design/web-vue/es/icon';\n  export default {\n    data() {\n      return {\n        treeData,\n      };\n    },\n  };\n\n  const treeData = [\n    {\n      label: 'Trunk 0-0',\n      value: '0-0',\n      items: [\n        {\n          label: 'Branch 0-0-2',\n          value: '0-0-2',\n          selectable: false,\n          customIcon: () => h(IconDriveFile),\n          items: [\n            {\n              label: 'Leaf',\n              value: '0-0-2-1',\n              items: [\n                {\n                  label: 'Leaf 0-0-2',\n                  value: '0-0-2-1-0',\n                  items: [\n                    {\n                      label: 'Leaf',\n                      customIcon: () => h(IconStar),\n                      value: '0-0-2-1-0-0'\n                    }\n                  ]\n                },\n              ],\n            }\n          ]\n        },\n      ],\n    },\n    {\n      label: 'Trunk 0-1',\n      value: '0-1',\n      items: [\n        {\n          label: 'Branch 0-1-1',\n          value: '0-1-1',\n          items: [\n            {\n              label: 'Leaf',\n              value: '0-1-1-0',\n            }\n          ]\n        },\n      ],\n    },\n  ];\n<\/script>";
const fieldNamesTitle = "Field Names.Md";
const fieldNamesDescription = "通过 `fieldNames` 字段可以自定义 data 的字段名。";
import iconsDemo from '../../.vitepress/theme/generated/tree/icons.vue';
const iconsSource = "<template>\n  <a-tree :data=\"treeData\" show-line>\n     <template #switcher-icon=\"node, { isLeaf }\">\n      <IconDown v-if=\"!isLeaf\" />\n      <IconStar v-if=\"isLeaf\" />\n    <\/template>\n  <\/a-tree>\n<\/template>\n\n<script>\n  import { h } from 'vue';\n  import { IconDriveFile, IconDown, IconStar } from '@sd-design/web-vue/es/icon';\n\n  export default {\n    components: {\n      IconDown,\n      IconStar\n    },\n    setup() {\n      return {\n        treeData,\n      };\n    },\n  };\n\n  const treeData = [\n    {\n      title: 'Trunk',\n      key: 'node1',\n      children: [\n        {\n          title: 'Leaf',\n          key: 'node2',\n        },\n      ],\n    },\n    {\n      title: 'Trunk',\n      key: 'node3',\n      children: [\n        {\n          title: 'Leaf',\n          key: 'node4',\n          switcherIcon: () => h(IconDriveFile),\n        },\n        {\n          title: 'Leaf',\n          key: 'node5',\n          switcherIcon: () => h(IconDriveFile),\n        },\n      ],\n    },\n  ];\n<\/script>";
const iconsTitle = "Icons.Md";
const iconsDescription = "节点的图标 `loadingIcon`,  `switcherIcon`，同时支持在 `tree` 和 `node` 两个纬度上定制，其中 `node` 的优先级较高。";
import loadMoreDemo from '../../.vitepress/theme/generated/tree/loadMore.vue';
const loadMoreSource = "<template>\n  <a-tree :data=\"treeData\" :load-more=\"loadMore\" />\n<\/template>\n<script>\n  import { ref } from 'vue';\n\n  export default {\n    setup() {\n      const treeData = ref([\n        {\n          title: 'Trunk 0-0',\n          key: '0-0'\n        },\n        {\n          title: 'Trunk 0-1',\n          key: '0-1',\n          children: [\n            {\n              title: 'Branch 0-1-1',\n              key: '0-1-1'\n            }\n          ],\n        },\n      ]);\n\n      const loadMore = (nodeData) => {\n        return new Promise((resolve) => {\n          setTimeout(() => {\n            nodeData.children = [\n              { title: `leaf`, key: `${nodeData.key}-1`, isLeaf: true },\n            ];\n            resolve();\n          }, 1000);\n        });\n      };\n\n      return {\n        treeData,\n        loadMore,\n      };\n    }\n  }\n\n<\/script>";
const loadMoreTitle = "Load More.Md";
const loadMoreDescription = "动态加载节点。";
import multipleDemo from '../../.vitepress/theme/generated/tree/multiple.vue';
const multipleSource = "<template>\n  <a-checkbox\n    style=\"marginBottom: 24px;\"\n    v-model=\"multiple\"\n    @change=\"() => {\n      selectedKeys = [];\n    }\"\n  >\n    multiple\n  <\/a-checkbox>\n  <br/>\n  <a-typography-text>\n    Current: {{ selectedKeys?.join(' , ') }}\n  <\/a-typography-text>\n  <br/>\n  <a-tree\n    v-model:selected-keys=\"selectedKeys\"\n    :multiple=\"multiple\"\n    :data=\"treeData\"\n  />\n<\/template>\n<script>\n  import { ref } from 'vue';\n\n  export default {\n    setup() {\n      const selectedKeys = ref([]);\n      const multiple = ref(true);\n      const treeData = [\n        {\n          title: 'Trunk 0-0',\n          key: '0-0',\n          children: [\n            {\n              title: 'Leaf',\n              key: '0-0-1',\n            },\n            {\n              title: 'Branch 0-0-2',\n              key: '0-0-2',\n              children: [\n                {\n                  title: 'Leaf',\n                  key: '0-0-2-1'\n                }\n              ]\n            },\n          ],\n        },\n        {\n          title: 'Trunk 0-1',\n          key: '0-1',\n          children: [\n            {\n              title: 'Branch 0-1-1',\n              key: '0-1-1',\n              children: [\n                {\n                  title: 'Leaf',\n                  key: '0-1-1-1',\n                },\n                {\n                  title: 'Leaf',\n                  key: '0-1-1-2',\n                },\n              ]\n            },\n            {\n              title: 'Leaf',\n              key: '0-1-2',\n            },\n          ],\n        },\n      ];\n\n      return {\n        selectedKeys,\n        multiple,\n        treeData,\n      };\n    },\n  }\n<\/script>";
const multipleTitle = "Multiple.Md";
const multipleDescription = "`Tree` 设置 `multiple` 属性为`true`，可以启用多选。";
import nodeIconDemo from '../../.vitepress/theme/generated/tree/nodeIcon.vue';
const nodeIconSource = "<template>\n  <a-tree :data=\"treeData\">\n    <template #icon>\n      <IconStar />\n    <\/template>\n  <\/a-tree>\n<\/template>\n<script>\n  import { h } from 'vue';\n  import { IconStar, IconDriveFile } from '@sd-design/web-vue/es/icon';\n\n  export default {\n    components: {\n      IconStar\n    },\n    setup() {\n      return {\n        treeData,\n      };\n    },\n  };\n\n  const treeData = [\n    {\n      title: 'Trunk',\n      key: 'node1',\n      children: [\n        {\n          title: 'Leaf',\n          key: 'node2',\n        },\n      ],\n    },\n    {\n      title: 'Trunk',\n      key: 'node3',\n      children: [\n        {\n          title: 'Leaf',\n          key: 'node4',\n          icon: () => h(IconDriveFile),\n        },\n        {\n          title: 'Leaf',\n          key: 'node5',\n          icon: () => h(IconDriveFile),\n        },\n      ],\n    },\n  ];\n<\/script>";
const nodeIconTitle = "Node Icon.Md";
const nodeIconDescription = "节点图标可以通过 `tree` 的 `icon` 插槽全局指定，也可以通过节点的 `icon` 属性单独指定。";
import renderExtraDemo from '../../.vitepress/theme/generated/tree/renderExtra.vue';
const renderExtraSource = "<template>\n  <div style=\"width: 500px; padding: 2px; overflow: auto\">\n    <a-tree\n      :blockNode=\"true\"\n      :checkable=\"true\"\n      :data=\"treeData\"\n    >\n      <template #extra=\"nodeData\">\n        <IconPlus\n          style=\"position: absolute; right: 8px; font-size: 12px; top: 10px; color: #3370ff;\"\n          @click=\"() => onIconClick(nodeData)\"\n        />\n      <\/template>\n    <\/a-tree>\n  <\/div>\n<\/template>\n<script>\n import {ref} from 'vue';\n import { IconPlus } from '@sd-design/web-vue/es/icon';\n\n export default {\n   components: {\n     IconPlus,\n   },\n   setup() {\n     function onIconClick(nodeData) {\n      const children = nodeData.children || []\n      children.push({\n        title: 'new tree node',\n        key: nodeData.key + '-' + (children.length + 1)\n      })\n      nodeData.children = children\n\n      treeData.value = [...treeData.value];\n    }\n\n    const treeData = ref(\n      [\n        {\n          title: 'Trunk',\n          key: '0-0',\n          children: [\n            {\n              title: 'Leaf',\n              key: '0-0-1',\n            },\n            {\n              title: 'Branch',\n              key: '0-0-2',\n              children: [\n                {\n                  title: 'Leaf',\n                  key: '0-0-2-1'\n                }\n              ]\n            },\n          ],\n        },\n        {\n          title: 'Trunk',\n          key: '0-1',\n          children: [\n            {\n              title: 'Branch',\n              key: '0-1-1',\n              children: [\n                {\n                  title: 'Leaf',\n                  key: '0-1-1-1',\n                },\n                {\n                  title: 'Leaf',\n                  key: '0-1-1-2',\n                },\n              ]\n            },\n            {\n              title: 'Leaf',\n              key: '0-1-2',\n            },\n          ],\n        },\n      ]\n    );\n\n    return {\n      onIconClick,\n      treeData,\n    };\n   }\n };\n<\/script>";
const renderExtraTitle = "Render Extra.Md";
const renderExtraDescription = "`Tree` 提供了名为 `extra` 的 `Slot`, 可以在节点上定制额外的内容。";
import searchDemo from '../../.vitepress/theme/generated/tree/search.vue';
const searchSource = "<template>\n  <div>\n    <a-input-search\n      style=\"margin-bottom: 8px; max-width: 240px\"\n      v-model=\"searchKey\"\n    />\n    <a-tree :data=\"treeData\">\n      <template #title=\"nodeData\">\n        <template v-if=\"index = getMatchIndex(nodeData?.title), index < 0\">{{ nodeData?.title }}<\/template>\n        <span v-else>\n          {{ nodeData?.title?.substr(0, index) }}\n          <span style=\"color: var(--color-primary-light-4);\">\n            {{ nodeData?.title?.substr(index, searchKey.length) }}\n          <\/span>{{ nodeData?.title?.substr(index + searchKey.length) }}\n        <\/span>\n      <\/template>\n    <\/a-tree>\n  <\/div>\n<\/template>\n<script>\n  import { ref, computed } from 'vue';\n\n  const originTreeData = [\n    {\n      title: 'Trunk 0-0',\n      key: '0-0',\n      children: [\n        {\n          title: 'Branch 0-0-1',\n          key: '0-0-1',\n          children: [\n            {\n              title: 'Leaf 0-0-1-1',\n              key: '0-0-1-1'\n            },\n            {\n              title: 'Leaf 0-0-1-2',\n              key: '0-0-1-2'\n            }\n          ]\n        },\n      ],\n    },\n    {\n      title: 'Trunk 0-1',\n      key: '0-1',\n      children: [\n        {\n          title: 'Branch 0-1-1',\n          key: '0-1-1',\n          children: [\n            {\n              title: 'Leaf 0-1-1-0',\n              key: '0-1-1-0',\n            }\n          ]\n        },\n        {\n          title: 'Branch 0-1-2',\n          key: '0-1-2',\n          children: [\n            {\n              title: 'Leaf 0-1-2-0',\n              key: '0-1-2-0',\n            }\n          ]\n        },\n      ],\n    },\n  ];\n\n  export default {\n    setup() {\n      const searchKey = ref('');\n      const treeData = computed(() => {\n        if (!searchKey.value) return originTreeData;\n        return searchData(searchKey.value);\n      })\n\n      function searchData(keyword) {\n        const loop = (data) => {\n          const result = [];\n          data.forEach(item => {\n            if (item.title.toLowerCase().indexOf(keyword.toLowerCase()) > -1) {\n              result.push({...item});\n            } else if (item.children) {\n              const filterData = loop(item.children);\n              if (filterData.length) {\n                result.push({\n                  ...item,\n                  children: filterData\n                })\n              }\n            }\n          })\n          return result;\n        }\n\n        return loop(originTreeData);\n      }\n\n      function getMatchIndex(title) {\n        if (!searchKey.value) return -1;\n        return title.toLowerCase().indexOf(searchKey.value.toLowerCase());\n      }\n\n      return {\n        searchKey,\n        treeData,\n        getMatchIndex,\n      }\n    }\n  }\n<\/script>";
const searchTitle = "Search.Md";
const searchDescription = "展示如何实现搜索树的效果。";
import showLineDemo from '../../.vitepress/theme/generated/tree/showLine.vue';
const showLineSource = "<template>\n  <div>\n    <a-typography-text>showLine<\/a-typography-text>\n    <a-switch v-model=\"showLine\" style=\"margin-left: 12px\" />\n  <\/div>\n  <a-tree\n    :default-selected-keys=\"['0-0-1']\"\n    :data=\"treeData\"\n    :show-line=\"showLine\"\n  />\n<\/template>\n<script>\n  import { ref } from 'vue';\n\n  export default {\n    setup() {\n      const showLine = ref(true);\n\n      return {\n        showLine,\n        treeData,\n      };\n    },\n  };\n\n  const treeData = [\n    {\n      title: 'Trunk 1',\n      key: '0-0',\n      children: [\n        {\n          title: 'Trunk 1-0',\n          key: '0-0-0',\n          children: [\n            { title: 'leaf', key: '0-0-0-0' },\n            {\n              title: 'leaf',\n              key: '0-0-0-1',\n              children: [{ title: 'leaf', key: '0-0-0-1-0' }],\n            },\n            { title: 'leaf', key: '0-0-0-2' },\n          ],\n        },\n        {\n          title: 'Trunk 1-1',\n          key: '0-0-1',\n        },\n        {\n          title: 'Trunk 1-2',\n          key: '0-0-2',\n          children: [\n            { title: 'leaf', key: '0-0-2-0' },\n            {\n              title: 'leaf',\n              key: '0-0-2-1',\n            },\n          ],\n        },\n      ],\n    },\n    {\n      title: 'Trunk 2',\n      key: '0-1',\n    },\n    {\n      title: 'Trunk 3',\n      key: '0-2',\n      children: [\n        {\n          title: 'Trunk 3-0',\n          key: '0-2-0',\n          children: [\n            { title: 'leaf', key: '0-2-0-0' },\n            { title: 'leaf', key: '0-2-0-1' },\n          ],\n        },\n      ],\n    },\n  ];\n<\/script>";
const showLineTitle = "Show Line.Md";
const showLineDescription = "为 `Tree` 添加 `showLine` 属性即可使树具有连接线";
import sizeDemo from '../../.vitepress/theme/generated/tree/size.vue';
const sizeSource = "<template>\n  <div style=\"margin-bottom: 20px;\">\n    <a-radio-group v-model=\"size\" type='button'>\n      <a-radio value=\"mini\">mini<\/a-radio>\n      <a-radio value=\"small\">small<\/a-radio>\n      <a-radio value=\"medium\">medium<\/a-radio>\n      <a-radio value=\"large\">large<\/a-radio>\n    <\/a-radio-group>\n  <\/div>\n  <a-tree\n    style=\"margin-right: 20px;\"\n    :blockNode=\"true\"\n    :checkable=\"true\"\n    :size=\"size\"\n    :data=\"treeData\" />\n<\/template>\n<script>\n  import { ref } from 'vue';\n\n  export default {\n    setup() {\n      const size = ref('medium');\n\n      return {\n        size,\n        treeData,\n      };\n    },\n  };\n\n  const treeData = [\n    {\n      title: 'Trunk 0-0',\n      key: '0-0',\n      children: [\n        {\n          title: 'Branch 0-0-0',\n          key: '0-0-0',\n          children: [\n            {\n              title: 'Leaf',\n              key: '0-0-0-0',\n            },\n            {\n              title: 'Leaf',\n              key: '0-0-0-1',\n            }\n          ]\n        },\n        {\n          title: 'Branch 0-0-1',\n          key: '0-0-1',\n          children: [\n            {\n              title: 'Leaf',\n              key: '0-0-1-0',\n            },\n          ]\n        },\n      ],\n    },\n  ];\n<\/script>";
const sizeTitle = "Size.Md";
const sizeDescription = "不同尺寸的树。";
import virtualDemo from '../../.vitepress/theme/generated/tree/virtual.vue';
const virtualSource = "<template>\n  <a-button\n    type=\"primary\"\n    :style=\"{ marginBottom: '20px' }\"\n    @click=\"scrollIntoView\"\n  >\n    Scroll to 0-0-2-2, i.e. the 26th.\n  <\/a-button>\n  <a-tree\n    ref=\"treeRef\"\n    blockNode\n    checkable\n    :data=\"treeData\"\n    :virtualListProps=\"{\n      height: 200,\n    }\"\n  />\n<\/template>\n<script>\n  import { ref } from 'vue';\n  export default {\n    setup() {\n      const treeRef = ref();\n      const treeData = loop();\n      return {\n        treeRef,\n        treeData,\n        scrollIntoView() {\n          treeRef.value && treeRef.value.scrollIntoView({ key: '0-0-2-2' });\n        }\n      }\n    }\n  }\n\n  function loop(path = '0', level = 2) {\n    const list = [];\n    for (let i = 0; i < 10; i += 1) {\n      const key = `${path}-${i}`;\n      const treeNode = {\n        title: key,\n        key,\n      };\n\n      if (level > 0) {\n        treeNode.children = loop(key, level - 1);\n      }\n\n      list.push(treeNode);\n    }\n    return list;\n  }\n<\/script>";
const virtualTitle = "Virtual.Md";
const virtualDescription = "通过指定 `virtualListProps` 来开启虚拟列表，在大量数据时获得高性能表现。";
</script>

## 示例


<DemoBlock
  :title="basicTitle"
  :description="basicDescription"
  :code="basicSource"
>
  <basicDemo />
</DemoBlock>

<DemoBlock
  :title="blockNodeTitle"
  :description="blockNodeDescription"
  :code="blockNodeSource"
>
  <blockNodeDemo />
</DemoBlock>

<DemoBlock
  :title="checkableTitle"
  :description="checkableDescription"
  :code="checkableSource"
>
  <checkableDemo />
</DemoBlock>

<DemoBlock
  :title="checkedStrategyTitle"
  :description="checkedStrategyDescription"
  :code="checkedStrategySource"
>
  <checkedStrategyDemo />
</DemoBlock>

<DemoBlock
  :title="controlTitle"
  :description="controlDescription"
  :code="controlSource"
>
  <controlDemo />
</DemoBlock>

<DemoBlock
  :title="draggableTitle"
  :description="draggableDescription"
  :code="draggableSource"
>
  <draggableDemo />
</DemoBlock>

<DemoBlock
  :title="fieldNamesTitle"
  :description="fieldNamesDescription"
  :code="fieldNamesSource"
>
  <fieldNamesDemo />
</DemoBlock>

<DemoBlock
  :title="iconsTitle"
  :description="iconsDescription"
  :code="iconsSource"
>
  <iconsDemo />
</DemoBlock>

<DemoBlock
  :title="loadMoreTitle"
  :description="loadMoreDescription"
  :code="loadMoreSource"
>
  <loadMoreDemo />
</DemoBlock>

<DemoBlock
  :title="multipleTitle"
  :description="multipleDescription"
  :code="multipleSource"
>
  <multipleDemo />
</DemoBlock>

<DemoBlock
  :title="nodeIconTitle"
  :description="nodeIconDescription"
  :code="nodeIconSource"
>
  <nodeIconDemo />
</DemoBlock>

<DemoBlock
  :title="renderExtraTitle"
  :description="renderExtraDescription"
  :code="renderExtraSource"
>
  <renderExtraDemo />
</DemoBlock>

<DemoBlock
  :title="searchTitle"
  :description="searchDescription"
  :code="searchSource"
>
  <searchDemo />
</DemoBlock>

<DemoBlock
  :title="showLineTitle"
  :description="showLineDescription"
  :code="showLineSource"
>
  <showLineDemo />
</DemoBlock>

<DemoBlock
  :title="sizeTitle"
  :description="sizeDescription"
  :code="sizeSource"
>
  <sizeDemo />
</DemoBlock>

<DemoBlock
  :title="virtualTitle"
  :description="virtualDescription"
  :code="virtualSource"
>
  <virtualDemo />
</DemoBlock>
