---
title: "transfer"
outline: "deep"
---

```yaml
meta:
  type: 组件
  category: 数据输入
title: 数据穿梭框 Transfer
description: 两栏布局的多选组件，将元素从一栏即时移到另一栏。
```









## API


### `<transfer>` Props

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|data|穿梭框的数据|`TransferItem[]`|`[]`||
|model-value **(v-model)**|目标选择框中的值|`string[]`|`-`||
|default-value|目标选择框中默认的值（非受控状态）|`string[]`|`[]`||
|selected **(v-model)**|选中的选项值|`string[]`|`-`||
|default-selected|默认选中的选项值（非受控状态）|`string[]`|`[]`||
|disabled|是否禁用|`boolean`|`false`||
|simple|是否开启简单模式（点击选项即移动）|`boolean`|`false`||
|one-way|是否开启单向模式（仅可移动到目标选择框）|`boolean`|`false`||
|show-search|是否显示搜索框|`boolean`|`false`||
|show-select-all|是否展示全选勾选框|`boolean`|`true`|2.39.0|
|title|源选择框和目标选择框的标题|`string[]`|`['Source', 'Target']`||
|source-input-search-props|源选择框的搜索框配置|`object`|`-`|2.51.1|
|target-input-search-props|目标选择框的搜索框配置|`object`|`-`|2.51.1|
### `<transfer>` Events

|事件名|描述|参数|
|---|---|---|
|change|目标选择框的值改变时触发|value: `string[]`|
|select|选中的值改变时触发|selected: `string[]`|
|search|用户搜索时触发|value: `string`<br>type: `'target'\|'source'`|
### `<transfer>` Slots

|插槽名|描述|参数|版本|
|---|:---:|---|:---|
|source|源面板|data: `TransferItem[]`<br>selectedKeys: `string[]`<br>onSelect: `(value: string[]) => void`|2.39.0|
|source-title|源标题插槽|countTotal: `number`<br>countSelected: `number`<br>searchValue: `string`<br>checked: `boolean`<br>indeterminate: `boolean`<br>onSelectAllChange: `(checked:boolean) => void`<br>onClear: `() => void`|2.45.0|
|to-target-icon|移至目标图标插槽|-|2.52.0|
|to-source-icon|移至源图标插槽|-|2.52.0|
|target|目标面板|data: `TransferItem[]`<br>selectedKeys: `string[]`<br>onSelect: `(value: string[]) => void`|2.39.0|
|target-title|目标标题插槽|countTotal: `number`<br>countSelected: `number`<br>searchValue: `string`<br>checked: `boolean`<br>indeterminate: `boolean`<br>onSelectAllChange: `(checked:boolean) => void`<br>onClear: `() => void`|2.45.0|
|item|选项|value: `string`<br>label: `string`||




### TransferItem

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|value|选项的值|`string`|`-`|
|label|选项的标签|`string`|`-`|
|disabled|是否禁用|`boolean`|`false`|

<script setup lang="ts">
import basicDemo from '../../.vitepress/theme/generated/transfer/basic.vue';
const basicSource = "<template>\n  <a-transfer :data=\"data\" :default-value=\"value\" />\n<\/template>\n\n<script>\nexport default {\n  setup() {\n    const data = Array(8).fill(undefined).map((_, index) => ({\n      value: `option${index + 1}`,\n      label: `Option ${index + 1}`\n    }));\n    const value = ['option1', 'option3', 'option5'];\n\n    return {\n      data,\n      value\n    }\n  },\n}\n<\/script>";
const basicTitle = "Basic.Md";
const basicDescription = "数据穿梭框的基本用法。";
import customHeaderDemo from '../../.vitepress/theme/generated/transfer/customHeader.vue';
const customHeaderSource = "<template>\n  <a-transfer :data=\"data\" :default-value=\"value\">\n    <template\n      #source-title=\"{\n        countTotal,\n        countSelected,\n        checked,\n        indeterminate,\n        onSelectAllChange,\n      }\"\n    >\n      <div :style=\"styleHeader\">\n        Source Title {{ countSelected }}-{{ countTotal }}\n        <a-checkbox\n          :model-value=\"checked\"\n          :indeterminate=\"indeterminate\"\n          @change=\"onSelectAllChange\"\n        />\n      <\/div>\n    <\/template>\n\n    <template #target-title=\"{ countTotal, countSelected, onClear }\">\n      <div :style=\"styleHeader\">\n        Target Title {{ countSelected }}-{{ countTotal }}\n        <IconDelete @click=\"onClear\" />\n      <\/div>\n    <\/template>\n  <\/a-transfer>\n<\/template>\n\n<script>\nimport { IconDelete } from '@sd-design/web-vue/es/icon';\n\nexport default {\n  components: { IconDelete },\n  setup() {\n    const data = Array(8)\n      .fill(undefined)\n      .map((_, index) => ({\n        value: `option${index + 1}`,\n        label: `Option ${index + 1}`,\n      }));\n    const value = ['option1', 'option3', 'option5'];\n\n    const styleHeader = {\n      display: 'flex',\n      alignItems: 'center',\n      justifyContent: 'space-between',\n      paddingRight: '8px'\n    };\n\n    return {\n      styleHeader,\n      data,\n      value,\n    };\n  },\n};\n<\/script>";
const customHeaderTitle = "Custom Header.Md";
const customHeaderDescription = "通过 `source-title` ,`target-title` 插槽自定义标题栏的渲染内容";
import customDemo from '../../.vitepress/theme/generated/transfer/custom.vue';
const customSource = "<template>\n  <a-transfer :data=\"data\" :default-value=\"value\">\n    <template #item=\"{ label }\">\n      <icon-up />\n      {{ label }}\n    <\/template>\n  <\/a-transfer>\n<\/template>\n\n<script>\nexport default {\n  setup() {\n    const data = Array(8).fill(undefined).map((_, index) => {\n      return {\n        value: `option${index + 1}`,\n        label: `Option ${index + 1}`,\n        disabled: index === 1\n      }\n    });\n    const value = ['option1', 'option3', 'option5'];\n\n    return {\n      data,\n      value\n    }\n  },\n}\n<\/script>";
const customTitle = "Custom.Md";
const customDescription = "通过 `item` 插槽自定义选项的渲染内容。";
import oneWayDemo from '../../.vitepress/theme/generated/transfer/oneWay.vue';
const oneWaySource = "<template>\n  <a-transfer :data=\"data\" :default-value=\"value\" one-way/>\n<\/template>\n\n<script>\nexport default {\n  setup() {\n    const data = Array(8).fill(undefined).map((_, index) => ({\n      value: `option${index + 1}`,\n      label: `Option ${index + 1}`\n    }));\n    const value = ['option1', 'option3', 'option5'];\n\n    return {\n      data,\n      value\n    }\n  },\n}\n<\/script>";
const oneWayTitle = "One Way.Md";
const oneWayDescription = "通过设置 `one-way` ，使用单向模式的穿梭框。";
import paginationDemo from '../../.vitepress/theme/generated/transfer/pagination.vue';
const paginationSource = "<template>\n\n<\/template>\n\n<script>\nexport default {\n}\n<\/script>";
const paginationTitle = "Pagination.Md";
const paginationDescription = "## en-US";
import searchDemo from '../../.vitepress/theme/generated/transfer/search.vue';
const searchSource = "<template>\n  <a-transfer\n    show-search\n    :data=\"data\"\n    :default-value=\"value\"\n    :source-input-search-props=\"{\n      placeholder:'source item search'\n    }\"\n    :target-input-search-props=\"{\n      placeholder:'target item search'\n    }\"\n  />\n<\/template>\n\n<script>\nexport default {\n  setup() {\n    const data = Array(8).fill(undefined).map((_, index) => ({\n      value: `option${index + 1}`,\n      label: `Option ${index + 1}`\n    }));\n    const value = ['option1', 'option3', 'option5'];\n\n    return {\n      data,\n      value\n    }\n  },\n}\n<\/script>";
const searchTitle = "Search.Md";
const searchDescription = "通过设置 `show-search` 来使用带搜索框的穿梭框，可以自定义搜索函数。";
import simpleDemo from '../../.vitepress/theme/generated/transfer/simple.vue';
const simpleSource = "<template>\n  <a-transfer :data=\"data\" :default-value=\"value\" simple />\n<\/template>\n\n<script>\nexport default {\n  setup() {\n    const data = Array(8).fill(undefined).map((_, index) => ({\n      value: `option${index + 1}`,\n      label: `Option ${index + 1}`\n    }));\n    const value = ['option1', 'option3', 'option5'];\n\n    return {\n      data,\n      value\n    }\n  },\n}\n<\/script>";
const simpleTitle = "Simple.Md";
const simpleDescription = "通过设置 `simple` 来开启简单模式，点击选项即可移动。";
import treeDemo from '../../.vitepress/theme/generated/transfer/tree.vue';
const treeSource = "<template>\n  <a-transfer :data=\"transferData\" :default-value=\"value\">\n    <template #source=\"{data,selectedKeys,onSelect}\">\n      <a-tree\n        :checkable=\"true\"\n        checked-strategy=\"child\"\n        :checked-keys=\"selectedKeys\"\n        :data=\"getTreeData(data)\"\n        @check=\"onSelect\"\n      />\n    <\/template>\n  <\/a-transfer>\n<\/template>\n\n<script>\nexport default {\n  setup() {\n    const treeData = [\n      {\n        title: 'Trunk 0-0',\n        key: '0-0',\n        children: [\n          {\n            title: 'Leaf 0-0-1',\n            key: '0-0-1',\n          },\n          {\n            title: 'Branch 0-0-2',\n            key: '0-0-2',\n            children: [\n              {\n                title: 'Leaf 0-0-2-1',\n                key: '0-0-2-1'\n              },\n              {\n                title: 'Leaf 0-0-2-2',\n                key: '0-0-2-2',\n              }\n            ]\n          },\n        ],\n      },\n      {\n        title: 'Trunk 0-1',\n        key: '0-1',\n        children: [\n          {\n            title: 'Branch 0-1-1',\n            key: '0-1-1',\n            children: [\n              {\n                title: 'Leaf 0-1-1-1',\n                key: '0-1-1-1',\n              },\n              {\n                title: 'Leaf 0-1-1-2',\n                key: '0-1-1-2',\n              },\n            ]\n          },\n          {\n            title: 'Leaf 0-1-2',\n            key: '0-1-2',\n          },\n        ],\n      },\n    ];\n\n    const getTransferData = (treeData = [], transferDataSource = []) => {\n      treeData.forEach((item) => {\n        if (item.children) getTransferData(item.children, transferDataSource);\n        else transferDataSource.push({label: item.title, value: item.key});\n      });\n      return transferDataSource;\n    };\n\n    const getTreeData = (data = []) => {\n      const values = data.map(item => item.value)\n\n      const travel = (_treeData = []) => {\n        const treeDataSource = []\n        _treeData.forEach((item) => {\n          if (item.children || values.includes(item.key)) {\n            treeDataSource.push({title: item.title, key: item.key, children: travel(item.children)})\n          }\n        });\n        return treeDataSource\n      }\n\n      return travel(treeData)\n    }\n\n    const transferData = getTransferData(treeData);\n\n\n    const value = ['0-0-2-1'];\n\n    return {\n      transferData,\n      value,\n      getTreeData\n    }\n  },\n}\n<\/script>";
const treeTitle = "Tree.Md";
const treeDescription = "通过穿梭框自定义接口可以实现树型穿梭框。";
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
  :title="customHeaderTitle"
  :description="customHeaderDescription"
  :code="customHeaderSource"
>
  <customHeaderDemo />
</DemoBlock>

<DemoBlock
  :title="customTitle"
  :description="customDescription"
  :code="customSource"
>
  <customDemo />
</DemoBlock>

<DemoBlock
  :title="oneWayTitle"
  :description="oneWayDescription"
  :code="oneWaySource"
>
  <oneWayDemo />
</DemoBlock>

<DemoBlock
  :title="paginationTitle"
  :description="paginationDescription"
  :code="paginationSource"
>
  <paginationDemo />
</DemoBlock>

<DemoBlock
  :title="searchTitle"
  :description="searchDescription"
  :code="searchSource"
>
  <searchDemo />
</DemoBlock>

<DemoBlock
  :title="simpleTitle"
  :description="simpleDescription"
  :code="simpleSource"
>
  <simpleDemo />
</DemoBlock>

<DemoBlock
  :title="treeTitle"
  :description="treeDescription"
  :code="treeSource"
>
  <treeDemo />
</DemoBlock>
