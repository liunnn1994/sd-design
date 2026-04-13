---
title: 'overflow-list'
outline: 'deep'
---

```yaml
meta:
  type: 组件
  category: 其他
title: 折叠列表 OverflowList
description:
```

## API

### `<overflow-list>` Props

| 参数名 | 描述               | 类型               | 默认值  |
| ------ | ------------------ | ------------------ | :-----: |
| min    | 最少展示的元素个数 | `number`           |   `0`   |
| margin | 项目间隔           | `number`           |   `8`   |
| from   | 折叠方向           | `'start' \| 'end'` | `'end'` |

### `<overflow-list>` Events

| 事件名 | 描述               | 参数            |
| ------ | ------------------ | --------------- |
| change | 溢出数量改变时触发 | value: `number` |

### `<overflow-list>` Slots

| 插槽名   |   描述   | 参数             |
| -------- | :------: | ---------------- |
| overflow | 折叠元素 | number: `number` |

<script setup lang="ts">
import basicDemo from '../../.vitepress/theme/generated/overflow-list/basic.vue';
const basicSource = "<template>\n  <a-form auto-label-width>\n    <a-form-item label=\"Tag Number\">\n      <a-input-number v-model=\"number\" :min=\"0\" :max=\"20\" style=\"width: 200px\"/>\n    <\/a-form-item>\n    <a-form-item label=\"List Width\">\n      <a-slider v-model=\"width\" :min=\"0\" :max=\"800\" />\n    <\/a-form-item>\n  <\/a-form>\n  <div :style=\"{width:`${width}px`,marginTop:'20px'}\">\n    <a-overflow-list>\n      <div>DIV Element<\/div>\n      <a-tag v-for=\"item of tags\" :key=\"item\">Tag{{item}}<\/a-tag>\n    <\/a-overflow-list>\n  <\/div>\n<\/template>\n\n<script>\nimport { computed, ref } from 'vue';\n\nexport default {\n  setup() {\n    const width = ref(500);\n    const number = ref(10);\n    const tags = computed(() => Array.from({length: number.value}, (_, idx) => idx + 1));\n\n    return {\n      width,\n      number,\n      tags\n    }\n  }\n}\n<\/script>";
const basicTitle = "Basic.Md";
const basicDescription = "折叠列表的基本使用方法。";
import fromDemo from '../../.vitepress/theme/generated/overflow-list/from.vue';
const fromSource = "<template>\n  <a-form auto-label-width>\n    <a-form-item label=\"Tag Number\">\n      <a-input-number v-model=\"number\" :min=\"0\" :max=\"20\" style=\"width: 200px\"/>\n    <\/a-form-item>\n    <a-form-item label=\"List Width\">\n      <a-slider v-model=\"width\" :min=\"0\" :max=\"800\" />\n    <\/a-form-item>\n  <\/a-form>\n  <div :style=\"{width:`${width}px`,marginTop:'20px'}\">\n    <a-overflow-list from=\"start\">\n      <div>DIV Element<\/div>\n      <a-tag v-for=\"item of tags\" :key=\"item\">Tag{{item}}<\/a-tag>\n    <\/a-overflow-list>\n  <\/div>\n<\/template>\n\n<script>\nimport { computed, ref } from 'vue';\n\nexport default {\n  setup() {\n    const width = ref(500);\n    const number = ref(10);\n    const tags = computed(() => Array.from({length: number.value}, (_, idx) => idx + 1));\n\n    return {\n      width,\n      number,\n      tags\n    }\n  }\n}\n<\/script>";
const fromTitle = "From.Md";
const fromDescription = "通过 `from` 属性可以设置折叠的方向。";
</script>

## 示例

<DemoBlock :title="basicTitle" :description="basicDescription" :code="basicSource"

>   <basicDemo />
> </DemoBlock>

<DemoBlock :title="fromTitle" :description="fromDescription" :code="fromSource"

>   <fromDemo />
> </DemoBlock>
