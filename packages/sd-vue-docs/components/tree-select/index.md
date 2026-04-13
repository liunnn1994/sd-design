---
title: 'tree-select'
outline: 'deep'
---

```yaml
meta:
  type: 组件
  category: 数据输入
title: 树选择 TreeSelect
description: 可以对树形结构数据进行选择。
```

## API

### `<tree-select>` Props

| 参数名 | 描述 | 类型 | 默认值 | 版本 |
| --- | --- | --- | :-: | :-- |
| disabled | 是否禁用 | `boolean` | `false` |  |
| loading | 是否为加载中状态 | `boolean` | `false` |  |
| error | 是否为错误状态 | `boolean` | `false` |  |
| size | 选择框的大小 | `'mini' \| 'small' \| 'medium' \| 'large'` | `'medium'` |  |
| border | 是否显示边框 | `boolean` | `true` |  |
| allow-search | 是否允许搜索 | `boolean \| { retainInputValue?: boolean }` | `false (single) \| true (multiple)` |  |
| allow-clear | 是否允许清除 | `boolean` | `false` |  |
| placeholder | 提示文案 | `string` | `-` |  |
| max-tag-count | 最多显示的标签数量，仅在多选模式有效 | `number` | `-` |  |
| multiple | 是否支持多选 | `boolean` | `false` |  |
| default-value | 默认值 | `string \| number \| Array<string \| number> \| LabelValue \| LabelValue[]` | `-` |  |
| model-value **(v-model)** | 绑定值 | `string \| number \| Array<string \| number> \| LabelValue \| LabelValue[]` | `-` |  |
| field-names | 指定节点数据中的字段名 | `TreeFieldNames` | `-` |  |
| data | 数据 | `TreeNodeData[]` | `[]` |  |
| label-in-value | 设置value格式。默认是string，设置为true时候，value格式为： { label: string, value: string } | `boolean` | `false` |  |
| tree-checkable | 是否展示复选框 | `boolean` | `false` |  |
| tree-check-strictly | 父子节点是否关联 | `boolean` | `false` |  |
| tree-checked-strategy | 定制回显方式 | `'all' \| 'parent' \| 'child'` | `'all'` |  |
| tree-props | 可以接受所有 [Tree](/components/tree/) 组件的Props | `Partial<TreeProps>` | `-` |  |
| trigger-props | 可以接受所有 [Trigger](/components/trigger/) 组件的Props | `Partial<TriggerProps>` | `-` |  |
| popup-visible **(v-model)** | 弹出框是否可见 | `boolean` | `-` |  |
| default-popup-visible | 默认弹出框是否可见 | `boolean` | `false` |  |
| dropdown-style | 下拉框样式 | `CSSProperties` | `-` |  |
| dropdown-class-name | 下拉框样式 class | `string \| string[]` | `-` |  |
| filter-tree-node | 自定义节点过滤函数 | `(searchKey: string, nodeData: TreeNodeData) => boolean` | `-` |  |
| load-more | 动态加载数据 | `(nodeData: TreeNodeData) => Promise<void>` | `-` |  |
| disable-filter | 禁用内部过滤逻辑 | `boolean` | `false` |  |
| popup-container | 弹出框的挂载容器 | `string \| HTMLElement` | `-` |  |
| fallback-option | 为 value 中找不到匹配项的 key 定义节点数据 | `boolean \| ((key: number \| string) => TreeNodeData \| boolean)` | `true` | 2.22.0 |
| selectable | 设置可选择的节点，默认全部可选 | `boolean\| 'leaf'\| ((    node: TreeNodeData,    info: { isLeaf: boolean; level: number }  ) => boolean)` | `true` | 2.27.0 |
| scrollbar | 是否开启虚拟滚动条 | `boolean \| ScrollbarProps` | `true` | 2.39.0 |
| show-header-on-empty | 空状态时是否显示header | `boolean` | `false` |  |
| show-footer-on-empty | 空状态时是否显示footer | `boolean` | `false` |  |
| input-value **(v-model)** | 输入框的值 | `string` | `-` | 2.55.0 |
| default-input-value | 输入框的默认值（非受控模式） | `string` | `''` | 2.55.0 |

### `<tree-select>` Events

| 事件名 | 描述 | 参数 | 版本 |
| --- | --- | --- | :-- |
| change | 值改变时触发 | value: `string \| number \| LabelValue \| Array<string \| number> \| LabelValue[] \| undefined` |  |
| popup-visible-change | 下拉框显示状态改变时触发 | visible: `boolean` |  |
| search | 搜索值变化时触发 | searchKey: `string` |  |
| clear | 点击清除时触发 | - |  |
| input-value-change | 输入框的值发生改变时触发 | inputValue: `string` | 2.55.0 |

### `<tree-select>` Slots

| 插槽名                  |               描述               | 参数                 | 版本   |
| ----------------------- | :------------------------------: | -------------------- | :----- |
| trigger                 |          自定义触发元素          | -                    |        |
| prefix                  |               前缀               | -                    |        |
| label                   |         自定义选择框显示         | data: `mixed`        |        |
| header                  |         自定义下拉框页头         | -                    |        |
| loader                  |       定制加载中显示的内容       | -                    |        |
| empty                   |          定制空数据展示          | -                    |        |
| footer                  |         自定义下拉框页脚         | -                    |        |
| tree-slot-extra         | 定制 tree 组件的渲染额外节点内容 | -                    |        |
| tree-slot-title         |     定制 tree 组件的节点标题     | title: `string`      |        |
| tree-slot-icon          |     定制 tree 组件的节点图标     | node: `TreeNodeData` | 2.18.0 |
| tree-slot-switcher-icon |  定制 tree 组件的 switcher 图标  | -                    |        |

<script setup lang="ts">
import basicDemo from '../../.vitepress/theme/generated/tree-select/basic.vue';
const basicSource = "<template>\n  <a-tree-select\n    :data=\"treeData\"\n    placeholder=\"Please select ...\"\n    style=\"width: 300px\"\n  ><\/a-tree-select>\n<\/template>\n<script>\n  import { h } from 'vue';\n  import { IconCalendar } from '@sdata/web-vue/es/icon';\n\n  export default {\n    setup() {\n      return {\n        treeData,\n      };\n    },\n  };\n\n  const treeData = [\n    {\n      key: 'node1',\n      icon: () => h(IconCalendar),\n      title: 'Trunk',\n      disabled: true,\n      children: [\n        {\n          key: 'node2',\n          title: 'Leaf',\n        },\n      ],\n    },\n    {\n      key: 'node3',\n      title: 'Trunk2',\n      icon: () => h(IconCalendar),\n      children: [\n        {\n          key: 'node4',\n          title: 'Leaf',\n        },\n        {\n          key: 'node5',\n          title: 'Leaf',\n        },\n      ],\n    },\n  ];\n<\/script>";
const basicTitle = "Basic.Md";
const basicDescription = "最简单的用法。";
import checkableDemo from '../../.vitepress/theme/generated/tree-select/checkable.vue';
const checkableSource = "<template>\n  <div style=\"marginBottom: 24px;\">\n    <a-checkbox\n      v-model=\"treeCheckStrictly\"\n      @change=\"() => {\n        selected = [];\n      }\"\n    >\n    treeCheckStrictly\n    <\/a-checkbox>\n  <\/div>\n  <a-tree-select\n    v-model=\"selected\"\n    :allow-search=\"true\"\n    :allow-clear=\"true\"\n    :tree-checkable=\"true\"\n    :tree-check-strictly=\"treeCheckStrictly\"\n    :data=\"treeData\"\n    placeholder=\"Please select ...\"\n    style=\"width: 300px;\"\n  ><\/a-tree-select>\n<\/template>\n<script>\n  import { ref } from 'vue';\n\n  export default {\n    setup() {\n      const selected = ref([]);\n      const treeCheckStrictly = ref(false);\n\n      return {\n        selected,\n        treeCheckStrictly,\n        treeData,\n      };\n    },\n  };\n\n  const treeData = [\n    {\n      title: 'Trunk 0-0',\n      value: 'Trunk 0-0',\n      key: '0-0',\n      children: [\n        {\n          title: 'Leaf 0-0-1',\n          value: 'Leaf 0-0-1',\n          key: '0-0-1',\n        },\n        {\n          title: 'Branch 0-0-2',\n          value: 'Branch 0-0-2',\n          key: '0-0-2',\n          children: [\n            {\n              title: 'Leaf 0-0-2-1',\n              value: 'Leaf 0-0-2-1',\n              key: '0-0-2-1'\n            }\n          ]\n        },\n      ],\n    },\n    {\n      title: 'Trunk 0-1',\n      value: 'Trunk 0-1',\n      key: '0-1',\n      children: [\n        {\n          title: 'Branch 0-1-1',\n          value: 'Branch 0-1-1',\n          key: '0-1-1',\n          checkable: false,\n          children: [\n            {\n              title: 'Leaf 0-1-1-1',\n              value: 'Leaf 0-1-1-1',\n              key: '0-1-1-1',\n            },\n            {\n              title: 'Leaf 0-1-1-2',\n              value: 'Leaf 0-1-1-2',\n              key: '0-1-1-2',\n              disabled: true\n            },\n          ]\n        },\n        {\n          title: 'Leaf 0-1-2',\n          value: 'Leaf 0-1-2',\n          key: '0-1-2',\n        },\n      ],\n    },\n  ];\n<\/script>";
const checkableTitle = "Checkable.Md";
const checkableDescription = "可以通过设置 `treeCheckable` 属性开启复选框勾选。";
import checkedStrategyDemo from '../../.vitepress/theme/generated/tree-select/checkedStrategy.vue';
const checkedStrategySource = "<template>\n  <div style=\"margin-bottom: 24px;\">\n    <a-radio-group\n      type='button'\n      v-model=\"treeCheckedStrategy\"\n      @change=\"(value) => {\n        selected = []\n      }\"\n    >\n      <a-radio\n        v-for=\"item in strategyOptions\"\n        :key=\"item?.value\"\n        :value=\"item?.value\"\n      >\n        {{ item?.label }}\n      <\/a-radio>\n    <\/a-radio-group>\n  <\/div>\n  <a-tree-select\n    v-model=\"selected\"\n    :allow-search=\"true\"\n    :allow-clear=\"true\"\n    :tree-checkable=\"true\"\n    :tree-checked-strategy=\"treeCheckedStrategy\"\n    :data=\"treeData\"\n    placeholder=\"Please select ...\"\n    style=\"width: 300px;\"\n  ><\/a-tree-select>\n<\/template>\n<script>\n  import { ref } from 'vue';\n\n  export default {\n    setup() {\n      const selected = ref([]);\n      const treeCheckedStrategy = ref('all');\n\n      return {\n        selected,\n        treeCheckedStrategy,\n        strategyOptions,\n        treeData,\n      };\n    },\n  };\n\n  const strategyOptions = [\n    {\n      value: 'all',\n      label: 'show all'\n    },\n    {\n      value: 'parent',\n      label: 'show parent'\n    },\n    {\n      value: 'child',\n      label: 'show child'\n    }\n  ];\n\n  const treeData = [\n    {\n      title: 'Trunk 0-0',\n      value: 'Trunk 0-0',\n      key: '0-0',\n      children: [\n        {\n          title: 'Leaf 0-0-1',\n          value: 'Leaf 0-0-1',\n          key: '0-0-1',\n        },\n        {\n          title: 'Branch 0-0-2',\n          value: 'Branch 0-0-2',\n          key: '0-0-2',\n          children: [\n            {\n              title: 'Leaf 0-0-2-1',\n              value: 'Leaf 0-0-2-1',\n              key: '0-0-2-1'\n            }\n          ]\n        },\n      ],\n    },\n    {\n      title: 'Trunk 0-1',\n      value: 'Trunk 0-1',\n      key: '0-1',\n      children: [\n        {\n          title: 'Branch 0-1-1',\n          value: 'Branch 0-1-1',\n          key: '0-1-1',\n          checkable: false,\n          children: [\n            {\n              title: 'Leaf 0-1-1-1',\n              value: 'Leaf 0-1-1-1',\n              key: '0-1-1-1',\n            },\n            {\n              title: 'Leaf 0-1-1-2',\n              value: 'Leaf 0-1-1-2',\n              key: '0-1-1-2',\n              disabled: true\n            },\n          ]\n        },\n        {\n          title: 'Leaf 0-1-2',\n          value: 'Leaf 0-1-2',\n          key: '0-1-2',\n        },\n      ],\n    },\n  ];\n<\/script>";
const checkedStrategyTitle = "Checked Strategy.Md";
const checkedStrategyDescription = "可以通过`treeCheckStrategy`属性定制回填方式。";
import controlDemo from '../../.vitepress/theme/generated/tree-select/control.vue';
const controlSource = "<template>\n  <a-tree-select\n    :data=\"treeData\"\n    v-model=\"selected\"\n    placeholder=\"Please select ...\"\n    style=\"width: 300px\"\n  ><\/a-tree-select>\n<\/template>\n<script>\n  import { h, ref } from 'vue';\n  import { IconCalendar } from '@sdata/web-vue/es/icon';\n\n  export default {\n    setup() {\n      const selected = ref('node2');\n\n      return {\n        selected,\n        treeData,\n      };\n    },\n  };\n\n  const treeData = [\n    {\n      key: 'node1',\n      icon: () => h(IconCalendar),\n      title: 'Trunk',\n      disabled: true,\n      children: [\n        {\n          key: 'node2',\n          title: 'Leaf',\n        },\n      ],\n    },\n    {\n      key: 'node3',\n      title: 'Trunk2',\n      icon: () => h(IconCalendar),\n      children: [\n        {\n          key: 'node4',\n          title: 'Leaf',\n        },\n        {\n          key: 'node5',\n          title: 'Leaf',\n        },\n      ],\n    },\n  ];\n<\/script>";
const controlTitle = "Control.Md";
const controlDescription = "选中值支持双向绑定。";
import dropdownSlotsDemo from '../../.vitepress/theme/generated/tree-select/dropdownSlots.vue';
const dropdownSlotsSource = "<template>\n  <a-form layout=\"inline\" :model=\"form\">\n   <a-form-item label=\"empty\">\n      <a-switch v-model=\"form.empty\" />\n    <\/a-form-item>\n    <a-form-item label=\"showHeaderOnEmpty\">\n      <a-switch v-model=\"form.showHeaderOnEmpty\" />\n    <\/a-form-item>\n    <a-form-item label=\"showFooterOnEmpty\">\n      <a-switch v-model=\"form.showFooterOnEmpty\" />\n    <\/a-form-item>\n  <\/a-form>\n  <a-tree-select\n    style=\"width: 300px\"\n    placeholder=\"Please select ...\"\n    :data=\"computedTreeData\"\n    :show-header-on-empty=\"form.showHeaderOnEmpty\"\n    :show-footer-on-empty=\"form.showFooterOnEmpty\"\n  >\n    <template #header>\n      <div style=\"padding: 6px 12px;\" >\n        <a-checkbox value=\"1\">All<\/a-checkbox>\n      <\/div>\n    <\/template>\n      <template #footer>\n      <div style=\"padding: 6px 0; text-align: center;\">\n        <a-button>Click Me<\/a-button>\n      <\/div>\n    <\/template>\n  <\/a-tree-select>\n<\/template>\n<script>\n  import { h, reactive, computed } from 'vue';\n  import { IconCalendar } from '@sdata/web-vue/es/icon';\n\n  export default {\n    setup() {\n      const form = reactive({\n        empty: false,\n        showHeaderOnEmpty: false,\n        showFooterOnEmpty: false,\n      });\n\n      const treeData = [\n        {\n          key: 'node1',\n          icon: () => h(IconCalendar),\n          title: 'Trunk',\n          children: [\n            {\n              key: 'node2',\n              title: 'Leaf',\n            },\n          ],\n        },\n        {\n          key: 'node3',\n          title: 'Trunk2',\n          icon: () => h(IconCalendar),\n          children: [\n            {\n              key: 'node4',\n              title: 'Leaf',\n            },\n            {\n              key: 'node5',\n              title: 'Leaf',\n            },\n          ],\n        },\n        {\n          key: 'node6',\n          title: 'Trunk3',\n          icon: () => h(IconCalendar),\n          children: [\n            {\n              key: 'node7',\n              title: 'Leaf',\n            },\n            {\n              key: 'node8',\n              title: 'Leaf',\n            },\n          ],\n        },\n      ];\n\n      const computedTreeData = computed(() => {\n        return form.empty ? [] : treeData;\n      });\n\n      return {\n        form,\n        computedTreeData,\n      };\n    },\n  };\n<\/script>";
const dropdownSlotsTitle = "Dropdown Slots.Md";
const dropdownSlotsDescription = "自定义树选择下拉框的页头和页脚";
import fallbackDemo from '../../.vitepress/theme/generated/tree-select/fallback.vue';
const fallbackSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\">\n    <a-tree-select\n      defaultValue=\"node0\"\n      :data=\"treeData\"\n      placeholder=\"Please select ...\"\n      style=\"width: 300px\"\n    ><\/a-tree-select>\n    <a-tree-select\n      defaultValue=\"node0\"\n      :data=\"treeData\"\n      :fallback-option=\"false\"\n      placeholder=\"Please select ...\"\n      style=\"width: 300px\"\n    ><\/a-tree-select>\n    <a-tree-select\n      defaultValue=\"node0\"\n      :data=\"treeData\"\n      :fallback-option=\"fallback\"\n      placeholder=\"Please select ...\"\n      style=\"width: 300px\"\n    ><\/a-tree-select>\n    <a-tree-select\n      :defaultValue=\"['node0', 'node2']\"\n      :data=\"treeData\"\n      multiple\n      placeholder=\"Please select ...\"\n      style=\"width: 300px\"\n    ><\/a-tree-select>\n    <a-tree-select\n      :defaultValue=\"['node0', 'node2']\"\n      :data=\"treeData\"\n      :fallback-option=\"false\"\n      multiple\n      placeholder=\"Please select ...\"\n      style=\"width: 300px\"\n    ><\/a-tree-select>\n    <a-tree-select\n      :default-value=\"['node0', 'node2']\"\n      :data=\"treeData\"\n      :fallback-option=\"fallback\"\n      multiple\n      placeholder=\"Please select ...\"\n      style=\"width: 300px\"\n    ><\/a-tree-select>\n  <\/a-space>\n<\/template>\n\n<script>\nexport default {\n  setup() {\n    return {\n      treeData,\n      fallback(key) {\n        return {\n          key,\n          title: `++${key}++`\n        }\n      }\n    }\n  }\n}\n\nconst treeData = [\n    {\n      key: 'node1',\n      title: 'Trunk1',\n      children: [\n        {\n          key: 'node2',\n          title: 'Leaf1',\n        },\n      ],\n    },\n    {\n      key: 'node3',\n      title: 'Trunk2',\n      children: [\n        {\n          key: 'node4',\n          title: 'Leaf2',\n        },\n        {\n          key: 'node5',\n          title: 'Leaf3',\n        },\n      ],\n    },\n  ];\n<\/script>";
const fallbackTitle = "Fallback.Md";
const fallbackDescription = "使用 `fallback-option` 自定义找不到选项的值的显示效果，默认找不到选项就展示值本身。用户可以将其设定为 `false` 来隐藏那些没有匹配到节点数据的值。";
import fieldNamesDemo from '../../.vitepress/theme/generated/tree-select/fieldNames.vue';
const fieldNamesSource = "<template>\n  <a-tree-select\n    default-value=\"0-0-1\"\n    :fieldNames=\"{\n      key: 'value',\n      title: 'label',\n      children: 'items'\n    }\"\n    :data=\"treeData\"\n    placeholder=\"Please select ...\"\n    style=\"width: 300px;\"\n  ><\/a-tree-select>\n<\/template>\n<script>\n  export default {\n    setup() {\n      return {\n        treeData,\n      };\n    },\n  };\n\n  const treeData = [\n    {\n      label: 'Trunk 0-0',\n      value: '0-0',\n      items: [\n        {\n          label: 'Branch 0-0-2',\n          value: '0-0-2',\n          selectable: false,\n          items: [\n            {\n              label: 'Leaf',\n              value: '0-0-2-1',\n              items: [\n                {\n                  label: 'Leaf 0-0-2',\n                  value: '0-0-2-1-0',\n                  items: [\n                    {\n                      label: 'Leaf',\n                      value: '0-0-2-1-0-0'\n                    }\n                  ]\n                },\n              ],\n            }\n          ]\n        },\n      ],\n    },\n    {\n      label: 'Trunk 0-1',\n      value: '0-1',\n      items: [\n        {\n          label: 'Branch 0-1-1',\n          value: '0-1-1',\n          items: [\n            {\n              label: 'Leaf',\n              value: '0-1-1-0',\n            }\n          ]\n        },\n      ],\n    },\n  ];\n<\/script>";
const fieldNamesTitle = "Field Names.Md";
const fieldNamesDescription = "通过 `fieldNames` 字段可以自定义 TreeData 的字段名。";
import labelInValueDemo from '../../.vitepress/theme/generated/tree-select/labelInValue.vue';
const labelInValueSource = "<template>\n  <a-tree-select\n    :data=\"treeData\"\n    :label-in-value=\"true\"\n    :default-value=\"{ value: 'node2', label: 'Leaf' }\"\n    placeholder=\"Please select ...\"\n    style=\"width: 300px\"\n    @change=\"onChange\"\n  ><\/a-tree-select>\n<\/template>\n<script>\n  import { h } from 'vue';\n  import { IconCalendar } from '@sdata/web-vue/es/icon';\n\n  export default {\n    setup() {\n      function onChange(value) {\n        console.log(value);\n      }\n\n      return {\n        onChange,\n        treeData,\n      };\n    },\n  };\n\n  const treeData = [\n    {\n      key: 'node1',\n      icon: () => h(IconCalendar),\n      title: 'Trunk',\n      disabled: true,\n      children: [\n        {\n          key: 'node2',\n          title: 'Leaf',\n        },\n      ],\n    },\n    {\n      key: 'node3',\n      title: 'Trunk2',\n      icon: () => h(IconCalendar),\n      children: [\n        {\n          key: 'node4',\n          title: 'Leaf',\n        },\n        {\n          key: 'node5',\n          title: 'Leaf',\n        },\n      ],\n    },\n  ];\n<\/script>";
const labelInValueTitle = "Label In Value.Md";
const labelInValueDescription = "`labelInValue` 为 `true` 时，`value` 格式为： `{ label: string, value: string }`。";
import loadMoreDemo from '../../.vitepress/theme/generated/tree-select/loadMore.vue';
const loadMoreSource = "<template>\n  <a-tree-select\n    :data=\"treeData\"\n    :load-more=\"loadMore\"\n    placeholder=\"Please select ...\"\n    style=\"width: 300px\"\n  ><\/a-tree-select>\n<\/template>\n<script>\n  import { ref } from 'vue';\n\n  export default {\n    setup() {\n      const treeData = ref(defaultTreeData);\n      const loadMore = (nodeData) => {\n        const { title, key } = nodeData;\n        const children = [\n          { title: `${title}-0`, value: `${title}-0`, key: `${key}-0` },\n          { title: `${title}-1`, value: `${title}-1`, key: `${key}-1` },\n        ];\n\n        return new Promise((resolve) => {\n          setTimeout(() => {\n            nodeData.children = children;\n            resolve();\n          }, 1000);\n        });\n      };\n\n      return {\n        treeData,\n        loadMore,\n      };\n    },\n  };\n\n  const defaultTreeData = [\n    {\n      key: 'node1',\n      title: 'node1',\n      disabled: true,\n      children: [\n        {\n          key: 'node2',\n          title: 'node2',\n        },\n      ],\n    },\n    {\n      key: 'node3',\n      title: 'node3',\n      children: [\n        {\n          key: 'node4',\n          title: 'node4',\n          isLeaf: true,\n        },\n        {\n          key: 'node5',\n          title: 'node5',\n          isLeaf: true,\n        },\n      ],\n    },\n  ];\n<\/script>";
const loadMoreTitle = "Load More.Md";
const loadMoreDescription = "可以通过 `loadMore` 进行动态加载。此时可设置 `isLeaf` 来标示叶子节点。";
import multipleDemo from '../../.vitepress/theme/generated/tree-select/multiple.vue';
const multipleSource = "<template>\n  <a-space>\n    <a-tree-select\n      v-model=\"selected\"\n      :multiple=\"true\"\n      :allow-clear=\"true\"\n      :allow-search=\"true\"\n      :data=\"treeData\"\n      placeholder=\"Please select ...\"\n      style=\"width: 300px\"\n    ><\/a-tree-select>\n    <a-tree-select\n      v-model=\"selected\"\n      :multiple=\"true\"\n      :max-tag-count=\"2\"\n      :allow-clear=\"true\"\n      :allow-search=\"true\"\n      :data=\"treeData\"\n      placeholder=\"Please select ...\"\n      style=\"width: 300px\"\n    ><\/a-tree-select>\n  <\/a-space>\n<\/template>\n<script>\n  import { h, ref } from 'vue';\n  import { IconCalendar } from '@sdata/web-vue/es/icon';\n\n  export default {\n    setup() {\n      const selected = ref([]);\n\n      return {\n        selected,\n        treeData,\n      };\n    },\n  };\n\n  const treeData = [\n    {\n      key: 'node1',\n      icon: () => h(IconCalendar),\n      title: 'node1',\n      children: [\n        {\n          key: 'node2',\n          title: 'node2',\n        },\n      ],\n    },\n    {\n      key: 'node3',\n      title: 'node3',\n      icon: () => h(IconCalendar),\n      children: [\n        {\n          key: 'node4',\n          title: 'node4',\n        },\n        {\n          key: 'node5',\n          title: 'node5',\n        },\n      ],\n    },\n  ];\n<\/script>";
const multipleTitle = "Multiple.Md";
const multipleDescription = "多选";
import popupVisibleDemo from '../../.vitepress/theme/generated/tree-select/popupVisible.vue';
const popupVisibleSource = "<template>\n  <div style=\"margin-bottom: 24px;\">\n    <a-button type=\"primary\" @click=\"onClick\">toggle<\/a-button>\n  <\/div>\n  <a-tree-select\n    :popupVisible=\"popupVisible\"\n    :allow-clear=\"true\"\n    :data=\"treeData\"\n    placeholder=\"Please select ...\"\n    style=\"width: 300px\"\n  ><\/a-tree-select>\n<\/template>\n<script>\n  import { ref } from 'vue';\n\n  export default {\n    setup() {\n      const popupVisible = ref(false);\n      function onClick() {\n        popupVisible.value = !popupVisible.value;\n      }\n\n      return {\n        onClick,\n        popupVisible,\n        treeData,\n      };\n    },\n  };\n\n  const treeData = [\n    {\n      key: 'node1',\n      title: 'Trunk',\n      children: [\n        {\n          key: 'node2',\n          title: 'Leaf',\n        },\n      ],\n    },\n    {\n      key: 'node3',\n      title: 'Trunk2',\n      children: [\n        {\n          key: 'node4',\n          title: 'Leaf',\n        },\n        {\n          key: 'node5',\n          title: 'Leaf',\n        },\n      ],\n    },\n  ];\n<\/script>";
const popupVisibleTitle = "Popup Visible.Md";
const popupVisibleDescription = "通过 `popupVisible` (支持 `v-model`) 控制下拉框的展开和收起。";
import searchRemoteDemo from '../../.vitepress/theme/generated/tree-select/searchRemote.vue';
const searchRemoteSource = "<template>\n  <a-tree-select\n    :allow-search=\"true\"\n    :allow-clear=\"true\"\n    :disable-filter=\"true\"\n    :data=\"treeData\"\n    :loading=\"loading\"\n    style=\"width: 300px\"\n    placeholder=\"Please select ...\"\n    @search=\"onSearch\"\n  ><\/a-tree-select>\n<\/template>\n<script>\n  import { ref } from 'vue';\n\n  export default {\n    setup() {\n      const treeData = ref(defaultTreeData);\n      const loading = ref(false);\n\n      function searchData(keyword) {\n        const loop = (data) => {\n          const result = [];\n          data.forEach(item => {\n            if (item.title.toLowerCase().indexOf(keyword.toLowerCase()) > -1) {\n              result.push({...item});\n            } else if (item.children) {\n              const filterData = loop(item.children);\n              if (filterData.length) {\n                result.push({\n                  ...item,\n                  children: filterData\n                })\n              }\n            }\n          })\n          return result;\n        }\n\n        return loop(defaultTreeData);\n      }\n\n      const onSearch = (searchKey) => {\n        loading.value = true;\n        setTimeout(() => {\n          loading.value = false;\n          treeData.value = searchData(searchKey);\n        }, 200)\n      };\n\n      return {\n        treeData,\n        loading,\n        onSearch,\n      };\n    },\n  };\n\n  const defaultTreeData = [\n    {\n      title: 'Trunk 0-0',\n      key: '0-0',\n      children: [\n        {\n          title: 'Branch 0-0-1',\n          key: '0-0-1',\n          children: [\n            {\n              title: 'Leaf 0-0-1-1',\n              key: '0-0-1-1'\n            },\n            {\n              title: 'Leaf 0-0-1-2',\n              key: '0-0-1-2'\n            }\n          ]\n        },\n      ],\n    },\n    {\n      title: 'Trunk 0-1',\n      key: '0-1',\n      children: [\n        {\n          title: 'Branch 0-1-1',\n          key: '0-1-1',\n          children: [\n            {\n              title: 'Leaf 0-1-1-0',\n              key: '0-1-1-0',\n            }\n          ]\n        },\n        {\n          title: 'Branch 0-1-2',\n          key: '0-1-2',\n          children: [\n            {\n              title: 'Leaf 0-1-2-0',\n              key: '0-1-2-0',\n            }\n          ]\n        },\n      ],\n    },\n  ];\n<\/script>";
const searchRemoteTitle = "Search Remote.Md";
const searchRemoteDescription = "监听 `search` 事件，在事件处理函数中获取数据并更新 `treeData`。 自定义搜索逻辑时，建议关闭内部过滤逻辑（`:disable-filter=\"true\"`），以免影响自定义结果。";
import searchDemo from '../../.vitepress/theme/generated/tree-select/search.vue';
const searchSource = "<template>\n  <a-space>\n    <a-tree-select\n      :allow-search=\"true\"\n      :allow-clear=\"true\"\n      :data=\"treeData\"\n      placeholder=\"Please select ...\"\n      style=\"width: 300px\"\n    ><\/a-tree-select>\n    <a-tree-select\n      :allow-search=\"true\"\n      :allow-clear=\"true\"\n      :data=\"treeData\"\n      :filter-tree-node=\"filterTreeNode\"\n      placeholder=\"Please select ...\"\n      style=\"width: 300px\"\n    ><\/a-tree-select>\n  <\/a-space>\n<\/template>\n<script>\n  import { ref } from 'vue';\n\n  export default {\n    setup() {\n      function filterTreeNode(searchValue, nodeData) {\n        return nodeData.title.toLowerCase().indexOf(searchValue.toLowerCase()) > -1;\n      }\n\n      return {\n        filterTreeNode,\n        treeData,\n      };\n    },\n  };\n\n  const treeData = [\n    {\n      title: 'Trunk 0-0',\n      key: '0-0',\n      children: [\n        {\n          title: 'Branch 0-0-1',\n          key: '0-0-1',\n          children: [\n            {\n              title: 'Leaf 0-0-1-1',\n              key: '0-0-1-1'\n            },\n            {\n              title: 'Leaf 0-0-1-2',\n              key: '0-0-1-2'\n            }\n          ]\n        },\n      ],\n    },\n    {\n      title: 'Trunk 0-1',\n      key: '0-1',\n      children: [\n        {\n          title: 'Branch 0-1-1',\n          key: '0-1-1',\n          children: [\n            {\n              title: 'Leaf 0-1-1-0',\n              key: '0-1-1-0',\n            }\n          ]\n        },\n        {\n          title: 'Branch 0-1-2',\n          key: '0-1-2',\n          children: [\n            {\n              title: 'Leaf 0-1-2-0',\n              key: '0-1-2-0',\n            }\n          ]\n        },\n      ],\n    },\n  ];\n<\/script>";
const searchTitle = "Search.Md";
const searchDescription = "设置 `:allow-search=\"true\"` 启用搜索功能。动态加载时候只能在已加载数据中进行搜索。默认的关键字搜索是从`value`字段匹配。也可以传入 `filterTreeNode`自定义过滤方式。";
import sizeDemo from '../../.vitepress/theme/generated/tree-select/size.vue';
const sizeSource = "<template>\n  <div style=\"margin-bottom: 20px;\">\n    <a-radio-group v-model=\"size\" type='button'>\n      <a-radio value=\"mini\">mini<\/a-radio>\n      <a-radio value=\"small\">small<\/a-radio>\n      <a-radio value=\"medium\">medium<\/a-radio>\n      <a-radio value=\"large\">large<\/a-radio>\n    <\/a-radio-group>\n  <\/div>\n  <a-tree-select\n    defaultValue=\"node1\"\n    :size=\"size\"\n    :data=\"treeData\"\n    placeholder=\"Please select ...\"\n    style=\"width: 300px;\"\n  ><\/a-tree-select>\n<\/template>\n<script>\n  import { ref } from 'vue';\n\n  export default {\n    setup() {\n      const size = ref('medium');\n\n      return {\n        size,\n        treeData,\n      };\n    },\n  };\n\n  const treeData = [\n    {\n      key: 'node1',\n      title: 'node1',\n      disabled: true,\n      children: [\n        {\n          key: 'node2',\n          title: 'node2',\n        },\n      ],\n    },\n    {\n      key: 'node3',\n      title: 'node3',\n      children: [\n        {\n          key: 'node4',\n          title: 'node4',\n          isLeaf: true,\n        },\n        {\n          key: 'node5',\n          title: 'node5',\n          isLeaf: true,\n        },\n      ],\n    },\n  ];\n<\/script>";
const sizeTitle = "Size.Md";
const sizeDescription = "设置 `size` 可以使用四种尺寸（small, default, large, huge）的选择器。高度分别对应 24px、28px、32px、36px。";
import triggerElementDemo from '../../.vitepress/theme/generated/tree-select/triggerElement.vue';
const triggerElementSource = "<template>\n  <a-tree-select\n    :data=\"treeData\"\n    default-value=\"node1\"\n    @change=\"onChange\"\n  >\n    <template #trigger>\n      <a-typography-paragraph style=\"width: 300px\">\n        You selected: <a href='javascript: void(0)'>{{ text }}<\/a>\n      <\/a-typography-paragraph>\n    <\/template>\n  <\/a-tree-select>\n<\/template>\n<script>\n  import { ref } from 'vue';\n\n  export default {\n    setup() {\n      const text = ref('node1');\n\n      function onChange(selected) {\n        text.value = selected;\n      }\n\n      return {\n        treeData,\n        text,\n        onChange,\n      };\n    },\n  };\n\n  const treeData = [\n    {\n      key: 'node1',\n      title: 'node1',\n      children: [\n        {\n          key: 'node2',\n          title: 'node2',\n        },\n      ],\n    },\n    {\n      key: 'node3',\n      title: 'node3',\n      children: [\n        {\n          key: 'node4',\n          title: 'node4',\n        },\n        {\n          key: 'node5',\n          title: 'node5',\n          children: [\n            {\n              key: 'node6',\n              title: 'node6',\n            },\n            {\n              key: 'node7',\n              title: 'node7',\n            },\n          ]\n        },\n      ],\n    },\n  ];\n<\/script>";
const triggerElementTitle = "Trigger Element.Md";
const triggerElementDescription = "自定义触发元素。";
import virtualDemo from '../../.vitepress/theme/generated/tree-select/virtual.vue';
const virtualSource = "<template>\n  <a-tree-select\n    :data=\"treeData\"\n    :allow-search=\"{\n      retainInputValue: true\n    }\"\n    multiple\n    tree-checkable\n    :scrollbar=\"false\"\n    tree-checked-strategy=\"parent\"\n    :treeProps=\"{\n      virtualListProps: {\n        height: 200,\n      },\n    }\"\n  />\n<\/template>\n<script>\nexport default {\n  setup() {\n    const treeData = loop();\n    return {\n      treeData\n    }\n  }\n}\n\nfunction loop(path = '0', level = 2) {\n  const list = [];\n  for (let i = 0; i < 10; i += 1) {\n    const key = `${path}-${i}`;\n    const treeNode = {\n      title: key,\n      key,\n    };\n\n    if (level > 0) {\n      treeNode.children = loop(key, level - 1);\n    }\n\n    list.push(treeNode);\n  }\n  return list;\n}\n<\/script>";
const virtualTitle = "Virtual.Md";
const virtualDescription = "通过指定 `treeProps.virtualListProps` 来开启虚拟列表，在大量数据时获得高性能表现。";
</script>

## 示例

<DemoBlock :title="basicTitle" :description="basicDescription" :code="basicSource"

>   <basicDemo />
> </DemoBlock>

<DemoBlock :title="checkableTitle" :description="checkableDescription" :code="checkableSource"

>   <checkableDemo />
> </DemoBlock>

<DemoBlock :title="checkedStrategyTitle" :description="checkedStrategyDescription" :code="checkedStrategySource"

>   <checkedStrategyDemo />
> </DemoBlock>

<DemoBlock :title="controlTitle" :description="controlDescription" :code="controlSource"

>   <controlDemo />
> </DemoBlock>

<DemoBlock :title="dropdownSlotsTitle" :description="dropdownSlotsDescription" :code="dropdownSlotsSource"

>   <dropdownSlotsDemo />
> </DemoBlock>

<DemoBlock :title="fallbackTitle" :description="fallbackDescription" :code="fallbackSource"

>   <fallbackDemo />
> </DemoBlock>

<DemoBlock :title="fieldNamesTitle" :description="fieldNamesDescription" :code="fieldNamesSource"

>   <fieldNamesDemo />
> </DemoBlock>

<DemoBlock :title="labelInValueTitle" :description="labelInValueDescription" :code="labelInValueSource"

>   <labelInValueDemo />
> </DemoBlock>

<DemoBlock :title="loadMoreTitle" :description="loadMoreDescription" :code="loadMoreSource"

>   <loadMoreDemo />
> </DemoBlock>

<DemoBlock :title="multipleTitle" :description="multipleDescription" :code="multipleSource"

>   <multipleDemo />
> </DemoBlock>

<DemoBlock :title="popupVisibleTitle" :description="popupVisibleDescription" :code="popupVisibleSource"

>   <popupVisibleDemo />
> </DemoBlock>

<DemoBlock :title="searchRemoteTitle" :description="searchRemoteDescription" :code="searchRemoteSource"

>   <searchRemoteDemo />
> </DemoBlock>

<DemoBlock :title="searchTitle" :description="searchDescription" :code="searchSource"

>   <searchDemo />
> </DemoBlock>

<DemoBlock :title="sizeTitle" :description="sizeDescription" :code="sizeSource"

>   <sizeDemo />
> </DemoBlock>

<DemoBlock :title="triggerElementTitle" :description="triggerElementDescription" :code="triggerElementSource"

>   <triggerElementDemo />
> </DemoBlock>

<DemoBlock :title="virtualTitle" :description="virtualDescription" :code="virtualSource"

>   <virtualDemo />
> </DemoBlock>
