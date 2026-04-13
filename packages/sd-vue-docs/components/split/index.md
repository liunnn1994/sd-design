---
title: 'split'
outline: 'deep'
---

```yaml
meta:
  type: 组件
  category: 其他
title: 面板分割 Split
description: 将面板分割成两部分。
```

## API

### `<split>` Props

| 参数名 | 描述 | 类型 | 默认值 |
| --- | --- | --- | :-: |
| component | 分割框的 html 标签 | `string` | `'div'` |
| direction | 分割的方向 | `'horizontal' \| 'vertical'` | `'horizontal'` |
| size **(v-model)** | 分割的大小，可以是 0~1 代表百分比，或具体数值的像素，如 300px | `number\|string` | `-` |
| default-size | 默认分割的大小，可以是 0~1 代表百分比，或具体数值的像素，如 300px | `number\|string` | `0.5` |
| min | 最小阈值，可以是 0~1 代表百分比，或具体数值的像素，如 300px | `number\|string` | `-` |
| max | 最大阈值，可以是 0~1 代表百分比，或具体数值的像素，如 300px | `number\|string` | `-` |
| disabled | 是否禁用 | `boolean` | `false` |

### `<split>` Events

| 事件名     | 描述             | 参数 |
| ---------- | ---------------- | ---- |
| move-start | 开始拖拽之前触发 | -    |
| moving     | 拖拽时触发       | -    |
| move-end   | 拖拽结束之后触发 | -    |

### `<split>` Slots

| 插槽名              |       描述       | 参数 |
| ------------------- | :--------------: | ---- |
| first               | 第一个面板的内容 | -    |
| resize-trigger      |   伸缩杆的内容   | -    |
| resize-trigger-icon |   伸缩杆的图标   | -    |
| second              | 第二个面板的内容 | -    |

<script setup lang="ts">
import basicDemo from '../../.vitepress/theme/generated/split/basic.vue';
const basicSource = "<template>\n  <div>\n    <a-split :style=\"{\n        height: '200px',\n        width: '100%',\n        minWidth: '500px',\n        border: '1px solid var(--color-border)'\n      }\"\n      v-model:size=\"size\"\n      min=\"80px\"\n    >\n      <template #first>\n        <a-typography-paragraph>Left<\/a-typography-paragraph>\n      <\/template>\n      <template #second>\n        <a-typography-paragraph>Right<\/a-typography-paragraph>\n      <\/template>\n    <\/a-split>\n  <\/div>\n<\/template>\n<script>\nexport default {\n  data() {\n    return {\n      size: 0.5\n    }\n  }\n}\n<\/script>";
const basicTitle = "Basic.Md";
const basicDescription = "将一个面板分割成两个可以调整宽度或高度的两部分。用`direction`控制分割方向。";
import nestedDemo from '../../.vitepress/theme/generated/split/nested.vue';
const nestedSource = "<template>\n<div>\n  <a-split :style=\"{\n      height: '200px',\n      width: '100%',\n      minWidth: '500px',\n      border: '1px solid var(--color-border)'\n    }\"\n  >\n    <template #first>\n      <a-typography-paragraph>Left<\/a-typography-paragraph>\n    <\/template>\n    <template #second>\n      <div>\n        <a-split direction=\"vertical\" :style=\"{height: '200px'}\">\n          <template #first><a-typography-paragraph>Top<\/a-typography-paragraph><\/template>\n          <template #second><a-typography-paragraph>Bottom<\/a-typography-paragraph><\/template>\n        <\/a-split>\n      <\/div>\n    <\/template>\n  <\/a-split>\n<\/div>\n<\/template>";
const nestedTitle = "Nested.Md";
const nestedDescription = "面板分割可以嵌套使用。";
</script>

## 示例

<DemoBlock :title="basicTitle" :description="basicDescription" :code="basicSource"

>   <basicDemo />
> </DemoBlock>

<DemoBlock :title="nestedTitle" :description="nestedDescription" :code="nestedSource"

>   <nestedDemo />
> </DemoBlock>
