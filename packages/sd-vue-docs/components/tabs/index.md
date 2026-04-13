---
title: "tabs"
outline: "deep"
---

```yaml
meta:
  type: 组件
  category: 数据展示
title: 标签页 Tabs
description: 将内容组织同一视图中，一次可查看一个视图内容，查看其他内容可切换选项卡查看。
```










## API


### `<tabs>` Props

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|active-key **(v-model)**|当前选中的标签的 `key`|`string\|number`|`-`||
|default-active-key|默认选中的标签的`key`（非受控状态，为空时选中第一个标签页）|`string\|number`|`-`||
|position|选项卡的位置|`'left' \| 'right' \| 'top' \| 'bottom'`|`'top'`||
|size|选项卡的大小|`'mini' \| 'small' \| 'medium' \| 'large'`|`-`||
|type|选项卡的类型|`'line' \| 'card' \| 'card-gutter' \| 'text' \| 'rounded' \| 'capsule'`|`'line'`||
|direction|选项卡的方向|`'horizontal' \| 'vertical'`|`'horizontal'`||
|editable|是否开启可编辑模式|`boolean`|`false`||
|show-add-button|是否显示增加按钮（仅在可编辑模式可用）|`boolean`|`false`||
|destroy-on-hide|是否在不显示标签时销毁内容|`boolean`|`false`|2.27.0|
|lazy-load|是否在首次展示标签时挂载内容|`boolean`|`false`||
|justify|高度撑满容器，只在水平模式下生效。|`boolean`|`false`||
|animation|是否开启选项内容过渡动画|`boolean`|`false`||
|header-padding|选项卡头部是否存在水平边距。仅对 `type` 等于 `line`、`text` 类型的选项卡生效|`boolean`|`true`|2.10.0|
|auto-switch|创建标签后是否切换到新标签（最后一个）|`boolean`|`false`|2.18.0|
|hide-content|是否隐藏内容|`boolean`|`false`|2.25.0|
|trigger|触发方式|`'hover' \| 'click'`|`'click'`|2.34.0|
|scroll-position|被选中 tab 的滚动位置，默认 auto 即会将 activeTab 滚动到可见区域，但不会特意做位置调整|`'start' \| 'end' \| 'center' \| 'auto' \| number`|`'auto'`||
### `<tabs>` Events

|事件名|描述|参数|
|---|---|---|
|change|当前标签值改变时触发|key: ` string \| number `|
|tab-click|用户点击标签时触发|key: ` string \| number `|
|add|用户点击增加按钮时触发|-|
|delete|用户点击删除按钮时触发|key: ` string \| number `|
### `<tabs>` Slots

|插槽名|描述|参数|
|---|:---:|---|
|extra|选项卡额外内容|-|




### `<tab-pane>` Props

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|title|选项卡的标题|`string`|`-`||
|disabled|是否禁用|`boolean`|`false`||
|closable|是否允许关闭此选项卡（仅在可编辑模式生效）|`boolean`|`true`||
|destroy-on-hide|是否在不显示标签时销毁内容|`boolean`|`false`|2.27.0|
### `<tab-pane>` Slots

|插槽名|描述|参数|
|---|:---:|---|
|title|选项卡标题|-|

<script setup lang="ts">
import basicDemo from '../../.vitepress/theme/generated/tabs/basic.vue';
const basicSource = "<template>\n  <a-tabs default-active-key=\"2\">\n    <a-tab-pane key=\"1\" title=\"Tab 1\">\n      Content of Tab Panel 1\n    <\/a-tab-pane>\n    <a-tab-pane key=\"2\" title=\"Tab 2\">\n      Content of Tab Panel 2\n    <\/a-tab-pane>\n    <a-tab-pane key=\"3\">\n      <template #title>Tab 3<\/template>\n      Content of Tab Panel 3\n    <\/a-tab-pane>\n  <\/a-tabs>\n<\/template>";
const basicTitle = "Basic.Md";
const basicDescription = "标签页的基本使用方法。";
import editableDemo from '../../.vitepress/theme/generated/tabs/editable.vue';
const editableSource = "<template>\n  <a-tabs type=\"card-gutter\" :editable=\"true\" @add=\"handleAdd\" @delete=\"handleDelete\" show-add-button auto-switch>\n    <a-tab-pane v-for=\"(item, index) of data\" :key=\"item.key\" :title=\"item.title\" :closable=\"index!==2\">\n      {{ item?.content }}\n    <\/a-tab-pane>\n  <\/a-tabs>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nlet count = 5;\n\nexport default {\n  setup() {\n    const data = ref([\n      {\n        key: '1',\n        title: 'Tab 1',\n        content: 'Content of Tab Panel 1'\n      },\n      {\n        key: '2',\n        title: 'Tab 2',\n        content: 'Content of Tab Panel 2'\n      },\n      {\n        key: '3',\n        title: 'Tab 3',\n        content: 'Content of Tab Panel 3'\n      },\n      {\n        key: '4',\n        title: 'Tab 4',\n        content: 'Content of Tab Panel 4'\n      }\n    ]);\n\n    const handleAdd = () => {\n      const number = count++;\n      data.value = data.value.concat({\n        key: `${number}`,\n        title: `New Tab ${number}`,\n        content: `Content of New Tab Panel ${number}`\n      })\n    };\n    const handleDelete = (key) => {\n      data.value = data.value.filter(item => item.key !== key)\n    };\n\n    return {\n      data,\n      handleAdd,\n      handleDelete\n    }\n  },\n}\n<\/script>";
const editableTitle = "Editable.Md";
const editableDescription = "通过设置 `:editable=\"true\"` 可以开启动态增减标签页。仅在 `line` | `card` | `card-gutter` 生效";
import extraDemo from '../../.vitepress/theme/generated/tabs/extra.vue';
const extraSource = "<template>\n  <a-tabs>\n    <template #extra>\n      <a-button>Action<\/a-button>\n    <\/template>\n    <a-tab-pane key=\"1\" title=\"Tab 1\">\n      Content of Tab Panel 1\n    <\/a-tab-pane>\n    <a-tab-pane key=\"2\" title=\"Tab 2\">\n      Content of Tab Panel 2\n    <\/a-tab-pane>\n    <a-tab-pane key=\"3\" title=\"Tab 3\">\n      Content of Tab Panel 3\n    <\/a-tab-pane>\n  <\/a-tabs>\n<\/template>";
const extraTitle = "Extra.Md";
const extraDescription = "通过 `extra` 插槽可以自定义额外显示内容。";
import iconDemo from '../../.vitepress/theme/generated/tabs/icon.vue';
const iconSource = "<template>\n  <a-tabs>\n    <a-tab-pane key=\"1\">\n      <template #title>\n        <icon-calendar/> Tab 1\n      <\/template>\n      Content of Tab Panel 1\n    <\/a-tab-pane>\n    <a-tab-pane key=\"2\">\n      <template #title>\n        <icon-clock-circle/> Tab 2\n      <\/template>\n      Content of Tab Panel 2\n    <\/a-tab-pane>\n    <a-tab-pane key=\"3\">\n      <template #title>\n        <icon-user/> Tab 3\n      <\/template>\n      Content of Tab Panel 3\n    <\/a-tab-pane>\n  <\/a-tabs>\n<\/template>";
const iconTitle = "Icon.Md";
const iconDescription = "带有图标的标签页。";
import lazyDemo from '../../.vitepress/theme/generated/tabs/lazy.vue';
const lazySource = "<template>\n  <a-tabs default-active-key=\"2\" lazy-load>\n    <a-tab-pane key=\"1\" title=\"Tab 1\">\n      Content of Tab Panel 1\n    <\/a-tab-pane>\n    <a-tab-pane key=\"2\" title=\"Tab 2\">\n      Content of Tab Panel 2\n    <\/a-tab-pane>\n    <a-tab-pane key=\"3\" title=\"Tab 3\">\n      Content of Tab Panel 3\n    <\/a-tab-pane>\n  <\/a-tabs>\n<\/template>";
const lazyTitle = "Lazy.Md";
const lazyDescription = "通过设置 lazy-load 属性，可以让面板在首次激活时渲染。";
import positionDemo from '../../.vitepress/theme/generated/tabs/position.vue';
const positionSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\">\n    <a-radio-group v-model=\"position\" type=\"button\">\n      <a-radio value=\"top\">Top<\/a-radio>\n      <a-radio value=\"right\">Right<\/a-radio>\n      <a-radio value=\"bottom\">Bottom<\/a-radio>\n      <a-radio value=\"left\">Left<\/a-radio>\n    <\/a-radio-group>\n    <a-tabs :position=\"position\">\n      <a-tab-pane key=\"1\" title=\"Tab 1\">\n        Content of Tab Panel 1\n      <\/a-tab-pane>\n      <a-tab-pane key=\"2\" title=\"Tab 2\">\n        Content of Tab Panel 2\n      <\/a-tab-pane>\n      <a-tab-pane key=\"3\" title=\"Tab 3\">\n        Content of Tab Panel 3\n      <\/a-tab-pane>\n    <\/a-tabs>\n  <\/a-space>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const position = ref('top');\n\n    return {\n      position\n    }\n  },\n}\n<\/script>";
const positionTitle = "Position.Md";
const positionDescription = "通过 `position` 属性可以自定义标签栏的位置。";
import scrollDemo from '../../.vitepress/theme/generated/tabs/scroll.vue';
const scrollSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\">\n    <a-radio-group v-model=\"position\" type=\"button\">\n      <a-radio value=\"left\">Left<\/a-radio>\n      <a-radio value=\"top\">Top<\/a-radio>\n      <a-radio value=\"right\">Right<\/a-radio>\n      <a-radio value=\"bottom\">Bottom<\/a-radio>\n    <\/a-radio-group>\n    <a-radio-group v-model=\"scrollPosition\" type=\"button\">\n      <a-radio value=\"auto\">auto<\/a-radio>\n      <a-radio value=\"start\">start<\/a-radio>\n      <a-radio value=\"center\">center<\/a-radio>\n      <a-radio value=\"end\">end<\/a-radio>\n    <\/a-radio-group>\n    <a-button @click=\"changeActive\"> Change: {{activeKey}}<\/a-button>\n  <\/a-space>\n  <a-tabs\n    v-model:activeKey=\"activeKey\"\n    :position=\"position\"\n    :scrollPosition=\"scrollPosition\"\n    style=\"width: 100%;height: 300px;margin-top: 20px\"\n  >\n    <a-tab-pane v-for=\"tab in tabs\" :key=\"tab.key\" :title=\"tab.title\">\n      {{ tab.content }}\n    <\/a-tab-pane>\n  <\/a-tabs>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const position = ref('top');\n    const scrollPosition = ref('auto');\n    const activeKey = ref('Tab1');\n    const tabs = Array.from({ length: 30 }, (v, i) => {\n      return {\n        key: `Tab${i + 1}`,\n        title: `Tab ${i + 1}`,\n        content: `Content of Tab Panel ${i + 1}`\n      }\n    });\n\n    const changeActive = () => {\n      activeKey.value = `Tab${Math.floor(Math.random() * 30) + 1}`;\n    }\n\n    return {\n      tabs,\n      position,\n      scrollPosition,\n      activeKey,\n      changeActive\n    }\n  },\n}\n<\/script>";
const scrollTitle = "Scroll.Md";
const scrollDescription = "支持通过滚轮或者触摸板进行滚动操作，且可以通过 `scrollPosition` 属性设置滚动位置。";
import triggerDemo from '../../.vitepress/theme/generated/tabs/trigger.vue';
const triggerSource = "<template>\n  <a-radio-group v-model=\"trigger\">\n    <a-radio value=\"click\">click<\/a-radio>\n    <a-radio value=\"hover\">hover<\/a-radio>\n  <\/a-radio-group>\n  <a-tabs default-active-key=\"1\" :trigger=\"trigger\">\n    <a-tab-pane key=\"1\" title=\"Tab 1\"> Content of Tab Panel 1 <\/a-tab-pane>\n    <a-tab-pane key=\"2\" title=\"Tab 2\"> Content of Tab Panel 2 <\/a-tab-pane>\n    <a-tab-pane key=\"3\">\n      <template #title>Tab 3<\/template>\n      Content of Tab Panel 3\n    <\/a-tab-pane>\n  <\/a-tabs>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const trigger = ref('click');\n    return {\n      trigger,\n    };\n  },\n};\n<\/script>";
const triggerTitle = "Trigger.Md";
const triggerDescription = "通过 `trigger` 指定触发方式。";
import typeDemo from '../../.vitepress/theme/generated/tabs/type.vue';
const typeSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\">\n    <a-radio-group v-model=\"type\" type=\"button\">\n      <a-radio value=\"line\">Line<\/a-radio>\n      <a-radio value=\"card\">Card<\/a-radio>\n      <a-radio value=\"card-gutter\">Card Gutter<\/a-radio>\n      <a-radio value=\"text\">Text<\/a-radio>\n      <a-radio value=\"rounded\">Rounded<\/a-radio>\n      <a-radio value=\"capsule\">Capsule<\/a-radio>\n    <\/a-radio-group>\n    <a-radio-group v-model=\"size\" type=\"button\">\n      <a-radio value=\"mini\">Mini<\/a-radio>\n      <a-radio value=\"small\">Small<\/a-radio>\n      <a-radio value=\"medium\">Medium<\/a-radio>\n      <a-radio value=\"large\">Large<\/a-radio>\n    <\/a-radio-group>\n    <a-tabs :type=\"type\" :size=\"size\">\n      <a-tab-pane key=\"1\" title=\"Tab 1\">\n        Content of Tab Panel 1\n      <\/a-tab-pane>\n      <a-tab-pane key=\"2\" title=\"Tab 2\">\n        Content of Tab Panel 2\n      <\/a-tab-pane>\n      <a-tab-pane key=\"3\" title=\"Tab 3\">\n        Content of Tab Panel 3\n      <\/a-tab-pane>\n    <\/a-tabs>\n  <\/a-space>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const type = ref('line');\n    const size = ref('medium');\n\n    return {\n      type,\n      size\n    }\n  },\n}\n<\/script>";
const typeTitle = "Type.Md";
const typeDescription = "通过 `type` 可以设置标签的类型。";
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
  :title="editableTitle"
  :description="editableDescription"
  :code="editableSource"
>
  <editableDemo />
</DemoBlock>

<DemoBlock
  :title="extraTitle"
  :description="extraDescription"
  :code="extraSource"
>
  <extraDemo />
</DemoBlock>

<DemoBlock
  :title="iconTitle"
  :description="iconDescription"
  :code="iconSource"
>
  <iconDemo />
</DemoBlock>

<DemoBlock
  :title="lazyTitle"
  :description="lazyDescription"
  :code="lazySource"
>
  <lazyDemo />
</DemoBlock>

<DemoBlock
  :title="positionTitle"
  :description="positionDescription"
  :code="positionSource"
>
  <positionDemo />
</DemoBlock>

<DemoBlock
  :title="scrollTitle"
  :description="scrollDescription"
  :code="scrollSource"
>
  <scrollDemo />
</DemoBlock>

<DemoBlock
  :title="triggerTitle"
  :description="triggerDescription"
  :code="triggerSource"
>
  <triggerDemo />
</DemoBlock>

<DemoBlock
  :title="typeTitle"
  :description="typeDescription"
  :code="typeSource"
>
  <typeDemo />
</DemoBlock>
