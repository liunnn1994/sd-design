---
title: 'rate'
outline: 'deep'
---

```yaml
meta:
  type: 组件
  category: 数据输入
title: 评分 Rate
description: 用于评分或打星的组件。
```

## API

### `<rate>` Props

| 参数名 | 描述 | 类型 | 默认值 | 版本 |
| --- | --- | --- | :-: | :-- |
| count | 评分的总数 | `number` | `5` |  |
| model-value **(v-model)** | 绑定值 | `number` | `-` |  |
| default-value | 默认值 | `number` | `0` |  |
| allow-half | 是否允许半选 | `boolean` | `false` |  |
| allow-clear | 是否允许清除 | `boolean` | `false` |  |
| grading | 是否开启笑脸分级 | `boolean` | `false` |  |
| readonly | 是否为只读状态 | `boolean` | `false` |  |
| disabled | 是否禁用 | `boolean` | `false` |  |
| color | 颜色 | `string \| Record<string, string>` | `-` | 2.18.0 |

### `<rate>` Events

| 事件名       | 描述                   | 参数            |
| ------------ | ---------------------- | --------------- |
| change       | 值改变时触发           | value: `number` |
| hover-change | 鼠标移动到数值上时触发 | value: `number` |

### `<rate>` Slots

| 插槽名    | 描述 | 参数            |
| --------- | :--: | --------------- |
| character | 符号 | index: `number` |

<script setup lang="ts">
import basicDemo from '../../.vitepress/theme/generated/rate/basic.vue';
const basicSource = "<template>\n  <a-rate/>\n<\/template>";
const basicTitle = "Basic.Md";
const basicDescription = "评分组件基本用法。";
import characterDemo from '../../.vitepress/theme/generated/rate/character.vue';
const characterSource = "<template>\n  <a-rate :default-value=\"2\">\n    <template #character=\"{ index }\">\n      <icon-check v-if=\"index < 3\"/>\n      <icon-close v-else/>\n    <\/template>\n  <\/a-rate>\n<\/template>";
const characterTitle = "Character.Md";
const characterDescription = "可以将星星替换为其他字符，比如表情、字母，数字，字体图标甚至中文。";
import clearDemo from '../../.vitepress/theme/generated/rate/clear.vue';
const clearSource = "<template>\n  <a-rate :default-value=\"3\" allow-clear/>\n<\/template>";
const clearTitle = "Clear.Md";
const clearDescription = "通过设置 `allow-clear` 来允许清除评分。";
import colorDemo from '../../.vitepress/theme/generated/rate/color.vue';
const colorSource = "<template>\n  <a-space direction=\"vertical\">\n    <a-rate color=\"red\" />\n    <a-rate :color=\"color\" />\n  <\/a-space>\n<\/template>\n\n<script>\nexport default {\n  setup() {\n    const color = {\n      2: 'red',\n      4: 'green',\n      5: 'blue'\n    }\n    return {\n      color\n    }\n  },\n}\n<\/script>";
const colorTitle = "Color.Md";
const colorDescription = "通过 color 可以自定义颜色。另外可以通过对象形式自定义不同分值时的颜色。";
import countDemo from '../../.vitepress/theme/generated/rate/count.vue';
const countSource = "<template>\n  <a-rate :count=\"10\"/>\n<\/template>";
const countTitle = "Count.Md";
const countDescription = "通过指定 `count` 来指定任意长度的评分组件。";
import gradingDemo from '../../.vitepress/theme/generated/rate/grading.vue';
const gradingSource = "<template>\n  <a-rate grading/>\n<\/template>";
const gradingTitle = "Grading.Md";
const gradingDescription = "通过 `grading` 使用笑脸分级。";
import halfDemo from '../../.vitepress/theme/generated/rate/half.vue';
const halfSource = "<template>\n  <a-rate :default-value=\"2.5\" allow-half/>\n<\/template>";
const halfTitle = "Half.Md";
const halfDescription = "指定 `allow-half` 来开启半选。";
import readonlyDemo from '../../.vitepress/theme/generated/rate/readonly.vue';
const readonlySource = "<template>\n  <a-rate :default-value=\"4\" readonly />\n<\/template>";
const readonlyTitle = "Readonly.Md";
const readonlyDescription = "通过设置 `readonly` 属性让评分组件为只读状态。";
</script>

## 示例

<DemoBlock :title="basicTitle" :description="basicDescription" :code="basicSource"

>   <basicDemo />
> </DemoBlock>

<DemoBlock :title="characterTitle" :description="characterDescription" :code="characterSource"

>   <characterDemo />
> </DemoBlock>

<DemoBlock :title="clearTitle" :description="clearDescription" :code="clearSource"

>   <clearDemo />
> </DemoBlock>

<DemoBlock :title="colorTitle" :description="colorDescription" :code="colorSource"

>   <colorDemo />
> </DemoBlock>

<DemoBlock :title="countTitle" :description="countDescription" :code="countSource"

>   <countDemo />
> </DemoBlock>

<DemoBlock :title="gradingTitle" :description="gradingDescription" :code="gradingSource"

>   <gradingDemo />
> </DemoBlock>

<DemoBlock :title="halfTitle" :description="halfDescription" :code="halfSource"

>   <halfDemo />
> </DemoBlock>

<DemoBlock :title="readonlyTitle" :description="readonlyDescription" :code="readonlySource"

>   <readonlyDemo />
> </DemoBlock>
