---
title: 'tag'
outline: 'deep'
---

```yaml
meta:
  type: 组件
  category: 数据展示
title: 标签 Tag
description: 用于信息的选择、筛选、分类。用户通过标签进行信息反馈和交互操作。
```

## API

### `<tag>` Props

| 参数名 | 描述 | 类型 | 默认值 | 版本 |
| --- | --- | --- | :-: | :-- |
| color | 标签的颜色 | `'red' \| 'orangered' \| 'orange' \| 'gold' \| 'lime' \| 'green' \| 'cyan' \| 'blue' \| 'sdblue' \| 'purple' \| 'pinkpurple' \| 'magenta' \| 'gray'` | `-` |  |
| size | 标签的大小 | `'small' \| 'medium' \| 'large'` | `'medium'` |  |
| bordered | 是否显示边框 | `boolean` | `false` | 2.33.0 |
| visible **(v-model)** | 标签是否可见 | `boolean` | `-` |  |
| default-visible | 标签默认是否可见 | `boolean` | `true` |  |
| loading | 标签是否为加载中状态 | `boolean` | `false` |  |
| closable | 标签是否可关闭 | `boolean` | `false` |  |
| checkable | 标签是否可选中 | `boolean` | `false` |  |
| checked **(v-model)** | 标签是否选中（标签可选中时可用） | `boolean` | `-` |  |
| default-checked | 标签默认选中状态（标签可选中时可用） | `boolean` | `true` |  |
| nowrap | 标签内容不换行 | `boolean` | `false` | 2.56.1 |

### `<tag>` Events

| 事件名 | 描述                                   | 参数                                   |
| ------ | -------------------------------------- | -------------------------------------- |
| close  | 点击关闭按钮时触发                     | ev: `MouseEvent`                       |
| check  | 用户选中时触发（仅在可选中模式下触发） | checked: `boolean`<br>ev: `MouseEvent` |

### `<tag>` Slots

| 插槽名     |      描述      | 参数 |
| ---------- | :------------: | ---- |
| icon       |      图标      | -    |
| close-icon | 关闭按钮的图标 | -    |

<script setup lang="ts">
import basicDemo from '../../.vitepress/theme/generated/tag/basic.vue';
const basicSource = "<template>\n  <a-space>\n    <a-tag>Default<\/a-tag>\n    <a-tag>Tag 1<\/a-tag>\n    <a-tag>Tag 2<\/a-tag>\n    <a-tag>\n      <template #icon>\n        <icon-check-circle-fill />\n      <\/template>\n      Complete\n    <\/a-tag>\n  <\/a-space>\n<\/template>";
const basicTitle = "Basic.Md";
const basicDescription = "标签的基本用法";
import borderedDemo from '../../.vitepress/theme/generated/tag/bordered.vue';
const borderedSource = "<template>\n   <a-space wrap>\n    <a-tag bordered>default<\/a-tag>\n    <a-tag v-for=\"(color, index) of colors\" :key=\"index\" :color=\"color\" bordered>{{ color }}<\/a-tag>\n  <\/a-space>\n<\/template>\n\n<script>\nexport default {\n  setup() {\n    const colors = [\n      'orangered',\n      'orange',\n      'gold',\n      'lime',\n      'green',\n      'cyan',\n      'blue',\n      'sdblue',\n      'purple',\n      'pinkpurple',\n      'magenta',\n      'gray'\n    ];\n    return {\n      colors\n    }\n  },\n}\n<\/script>";
const borderedTitle = "Bordered.Md";
const borderedDescription = "通过参数 `bordered`，可以显示带边框的标签。";
import checkableDemo from '../../.vitepress/theme/generated/tag/checkable.vue';
const checkableSource = "<template>\n  <a-space>\n    <a-tag checkable>Awesome<\/a-tag>\n    <a-tag checkable color=\"red\" :default-checked=\"true\">Toutiao<\/a-tag>\n    <a-tag checkable color=\"sdblue\" :default-checked=\"true\">Lark<\/a-tag>\n  <\/a-space>\n<\/template>";
const checkableTitle = "Checkable.Md";
const checkableDescription = "通过设置 `checkable` ，可以实现点击选中的效果。";
import closeableDemo from '../../.vitepress/theme/generated/tag/closeable.vue';
const closeableSource = "<template>\n  <a-space>\n    <a-tag closable>Tag<\/a-tag>\n    <a-tag closable>\n      <template #icon>\n        <icon-star/>\n      <\/template>\n      Tag\n    <\/a-tag>\n  <\/a-space>\n<\/template>";
const closeableTitle = "Closeable.Md";
const closeableDescription = "通过 `closable` 属性控制标签是否可关闭。可关闭标签可通过 `close` 事件执行一些关闭后操作，也可通过 `visible` 属性控制标签的显示或隐藏。";
import colorDemo from '../../.vitepress/theme/generated/tag/color.vue';
const colorSource = "<template>\n  <a-space wrap>\n    <a-tag v-for=\"(color, index) of colors\" :key=\"index\" :color=\"color\" closable>{{ color }}<\/a-tag>\n  <\/a-space>\n  <h3>Custom Color:<\/h3>\n  <a-space wrap>\n    <a-tag v-for=\"(color, index) of custom\" :key=\"index\" :color=\"color\" closable>{{ color }}<\/a-tag>\n  <\/a-space>\n<\/template>\n\n<script>\nexport default {\n  setup() {\n    const colors = [\n      'red',\n      'orangered',\n      'orange',\n      'gold',\n      'lime',\n      'green',\n      'cyan',\n      'blue',\n      'sdblue',\n      'purple',\n      'pinkpurple',\n      'magenta',\n      'gray'\n    ];\n    const custom = [\n      '#f53f3f',\n      '#7816ff',\n      '#00b42a',\n      '#165dff',\n      '#ff7d00',\n      '#eb0aa4',\n      '#7bc616',\n      '#86909c',\n      '#b71de8',\n      '#0fc6c2',\n      '#ffb400',\n      '#168cff',\n      '#ff5722'\n    ];\n\n    return {\n      colors,\n      custom\n    }\n  },\n}\n<\/script>";
const colorTitle = "Color.Md";
const colorDescription = "我们提供多种预设色彩的标签样式，通过 `color` 设置不同颜色。如果预设值不能满足你的需求，`color` 字段也可以设置自定义色值。";
import dynamicallyDemo from '../../.vitepress/theme/generated/tag/dynamically.vue';
const dynamicallySource = "<template>\n  <a-space wrap>\n    <a-tag\n      v-for=\"(tag, index) of tags\"\n      :key=\"tag\"\n      :closable=\"index !== 0\"\n      @close=\"handleRemove(tag)\"\n    >\n      {{ tag }}\n    <\/a-tag>\n\n    <a-input\n      v-if=\"showInput\"\n      ref=\"inputRef\"\n      :style=\"{ width: '90px'}\"\n      size=\"mini\"\n      v-model.trim=\"inputVal\"\n      @keyup.enter=\"handleAdd\"\n      @blur=\"handleAdd\"\n    />\n    <a-tag\n      v-else\n      :style=\"{\n        width: '90px',\n        backgroundColor: 'var(--color-fill-2)',\n        border: '1px dashed var(--color-fill-3)',\n        cursor: 'pointer',\n      }\"\n      @click=\"handleEdit\"\n    >\n      <template #icon>\n        <icon-plus />\n      <\/template>\n      Add Tag\n    <\/a-tag>\n  <\/a-space>\n<\/template>\n\n<script>\nimport { ref, nextTick } from 'vue';\n\nexport default {\n  setup() {\n    const tags = ref(['Tag 1', 'Tag 2', 'Tag 3']);\n    const inputRef = ref(null);\n    const showInput = ref(false);\n    const inputVal = ref('');\n\n    const handleEdit = () => {\n      showInput.value = true;\n\n      nextTick(() => {\n        if (inputRef.value) {\n          inputRef.value.focus();\n        }\n      });\n    };\n\n    const handleAdd = () => {\n      if (inputVal.value) {\n        tags.value.push(inputVal.value);\n        inputVal.value = '';\n      }\n      showInput.value = false;\n    };\n\n    const handleRemove = (key) => {\n      tags.value = tags.value.filter((tag) => tag !== key);\n    };\n\n    return {\n      tags,\n      inputRef,\n      showInput,\n      inputVal,\n      handleEdit,\n      handleAdd,\n      handleRemove,\n    };\n  },\n};\n<\/script>";
const dynamicallyTitle = "Dynamically.Md";
const dynamicallyDescription = "可动态添加和删除标签。";
import iconDemo from '../../.vitepress/theme/generated/tag/icon.vue';
const iconSource = "<template>\n  <a-space>\n    <a-tag color=\"gray\">\n      <template #icon>\n        <icon-github/>\n      <\/template>\n      Github\n    <\/a-tag>\n    <a-tag color=\"orangered\">\n      <template #icon>\n        <icon-gitlab/>\n      <\/template>\n      Gitlab\n    <\/a-tag>\n    <a-tag color=\"blue\">\n      <template #icon>\n        <icon-twitter/>\n      <\/template>\n      Twitter\n    <\/a-tag>\n    <a-tag color=\"sdblue\">\n      <template #icon>\n        <icon-facebook/>\n      <\/template>\n      Facebook\n    <\/a-tag>\n  <\/a-space>\n<\/template>";
const iconTitle = "Icon.Md";
const iconDescription = "可通过 `icon` 插槽在标签中加入图标。";
import loadingDemo from '../../.vitepress/theme/generated/tag/loading.vue';
const loadingSource = "<template>\n  <a-tag loading>Loading<\/a-tag>\n<\/template>";
const loadingTitle = "Loading.Md";
const loadingDescription = "标签的加载中状态。";
import sizeDemo from '../../.vitepress/theme/generated/tag/size.vue';
const sizeSource = "<template>\n  <a-space>\n    <a-tag size=\"large\">Large<\/a-tag>\n    <a-tag>Medium<\/a-tag>\n    <a-tag size=\"small\">Small<\/a-tag>\n  <\/a-space>\n<\/template>";
const sizeTitle = "Size.Md";
const sizeDescription = "标签的大小分为：`small`、`medium`、`large` 三种，可以在不同场景下选择合适按钮尺寸。推荐及默认尺寸为 `medium`。";
</script>

## 示例

<DemoBlock :title="basicTitle" :description="basicDescription" :code="basicSource"

>   <basicDemo />
> </DemoBlock>

<DemoBlock :title="borderedTitle" :description="borderedDescription" :code="borderedSource"

>   <borderedDemo />
> </DemoBlock>

<DemoBlock :title="checkableTitle" :description="checkableDescription" :code="checkableSource"

>   <checkableDemo />
> </DemoBlock>

<DemoBlock :title="closeableTitle" :description="closeableDescription" :code="closeableSource"

>   <closeableDemo />
> </DemoBlock>

<DemoBlock :title="colorTitle" :description="colorDescription" :code="colorSource"

>   <colorDemo />
> </DemoBlock>

<DemoBlock :title="dynamicallyTitle" :description="dynamicallyDescription" :code="dynamicallySource"

>   <dynamicallyDemo />
> </DemoBlock>

<DemoBlock :title="iconTitle" :description="iconDescription" :code="iconSource"

>   <iconDemo />
> </DemoBlock>

<DemoBlock :title="loadingTitle" :description="loadingDescription" :code="loadingSource"

>   <loadingDemo />
> </DemoBlock>

<DemoBlock :title="sizeTitle" :description="sizeDescription" :code="sizeSource"

>   <sizeDemo />
> </DemoBlock>
