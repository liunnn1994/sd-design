---
title: 'slider'
outline: 'deep'
---

```yaml
meta:
  type: 组件
  category: 数据输入
title: 滑动输入条 Slider
description: 滑动型输入器，展示当前值和可选范围。
```

## API

### `<slider>` Props

| 参数名 | 描述 | 类型 | 默认值 | 版本 |
| --- | --- | --- | :-: | :-- |
| model-value **(v-model)** | 绑定值 | `number \| [number, number]` | `-` |  |
| default-value | 默认值（非受控状态） | `number \| [number, number]` | `0` |  |
| step | 滑动的步长 | `number` | `1` |  |
| min | 滑动范围的最小值 | `number` | `0` |  |
| marks | 设置显示的标签 | `Record<number, string>` | `-` |  |
| max | 滑动范围的最大值 | `number` | `100` |  |
| direction | 滑动输入条的方向 | `Direction` | `'horizontal'` |  |
| disabled | 是否禁用 | `boolean` | `false` |  |
| show-ticks | 是否显示刻度线 | `boolean` | `false` |  |
| show-input | 是否显示输入框 | `boolean` | `false` |  |
| range | 是否开启范围选择 | `boolean` | `false` |  |
| show-tooltip | 是否显示tooltip | `boolean` | `true` | 2.42.0 |

### `<slider>` Events

| 事件名 | 描述         | 参数                                |
| ------ | ------------ | ----------------------------------- |
| change | 值改变时触发 | value: `number \| [number, number]` |

<script setup lang="ts">
import basicDemo from '../../.vitepress/theme/generated/slider/basic.vue';
const basicSource = "<template>\n  <a-slider :default-value=\"50\" :style=\"{ width: '200px' }\" />\n<\/template>";
const basicTitle = "Basic.Md";
const basicDescription = "滑动输入条的基本用法。";
import disabledDemo from '../../.vitepress/theme/generated/slider/disabled.vue';
const disabledSource = "<template>\n  <a-slider :default-value=\"50\" :style=\"{ width: '200px' }\" disabled/>\n<\/template>";
const disabledTitle = "Disabled.Md";
const disabledDescription = "禁用滑动输入条。";
import inputDemo from '../../.vitepress/theme/generated/slider/input.vue';
const inputSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\">\n    <a-slider :default-value=\"10\" :style=\"{ width: '300px' }\" show-input />\n    <a-slider :default-value=\"[10,20]\" :style=\"{ width: '380px' }\" range show-input />\n  <\/a-space>\n<\/template>";
const inputTitle = "Input.Md";
const inputDescription = "当设置 `show-input` 时，将显示输入框。";
import marksDemo from '../../.vitepress/theme/generated/slider/marks.vue';
const marksSource = "<template>\n  <a-slider :default-value=\"5\" :style=\"{ width: '300px' }\" :max=\"15\" :marks=\"marks\" />\n<\/template>\n\n<script>\nexport default {\n  setup() {\n    const marks = {\n      0: '0km',\n      5: '5km',\n      10: '10km',\n      15: '15km'\n    };\n    return {\n      marks\n    }\n  },\n}\n<\/script>";
const marksTitle = "Marks.Md";
const marksDescription = "通过设置 `marks` 可以添加文本标签。";
import rangeDemo from '../../.vitepress/theme/generated/slider/range.vue';
const rangeSource = "<template>\n  <a-slider v-model=\"value\" :style=\"{ width: '300px' }\" range />\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const value = ref([5, 10]);\n\n    return {\n      value\n    }\n\n  }\n}\n<\/script>";
const rangeTitle = "Range.Md";
const rangeDescription = "通过设置 `range` 可开启范围选择，此时 `modelValue` 为数组。";
import stepDemo from '../../.vitepress/theme/generated/slider/step.vue';
const stepSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\">\n    <a-form :model=\"data\" layout=\"inline\">\n      <a-form-item label=\"Step\" field=\"step\">\n        <a-input-number :style=\"{ width: '100px' }\" v-model=\"data.step\" />\n      <\/a-form-item>\n      <a-form-item label=\"Show steps\" field=\"showTicks\">\n        <a-switch v-model=\"data.showTicks\" />\n      <\/a-form-item>\n    <\/a-form>\n    <a-slider :default-value=\"20\" :style=\"{ width: '300px' }\" :step=\"data.step\" :show-ticks=\"data.showTicks\" />\n  <\/a-space>\n<\/template>\n\n<script>\nimport { reactive } from 'vue';\n\nexport default {\n  setup() {\n    const data = reactive({\n      step: 5,\n      showTicks: true\n    });\n\n    return {\n      data\n    }\n  },\n}\n<\/script>";
const stepTitle = "Step.Md";
const stepDescription = "通过 `step` 设置步长，默认步长为 1。建议设置能够被 `max-min` 整除的值，否则会出现可选最大值小于 `max` 的情况。当设置 `show-ticks` 时，显示步长刻度线。";
import tooltipDemo from '../../.vitepress/theme/generated/slider/tooltip.vue';
const tooltipSource = "<template>\n  <a-slider :min=\"0\" :max=\"50\" :style=\"{ width: '200px' }\" :format-tooltip=\"formatter\" />\n<\/template>\n\n<script>\nexport default {\n  setup() {\n    const formatter = (value) => {\n      return `${Math.round((value / 50) * 100)}%`\n    };\n\n    return {\n      formatter\n    }\n  },\n}\n<\/script>";
const tooltipTitle = "Tooltip.Md";
const tooltipDescription = "通过设置 `format-tooltip` 可以自定义提示文字。";
import verticalDemo from '../../.vitepress/theme/generated/slider/vertical.vue';
const verticalSource = "<template>\n  <a-space align=\"start\">\n    <a-slider\n      :default-value=\"50\"\n      direction=\"vertical\"\n    />\n\n    <a-slider\n      direction=\"vertical\"\n      :default-value=\"5\"\n      :style=\"{ width: '300px' }\"\n      :max=\"15\"\n      :marks=\"{\n        5: '5km',\n        10: '10km',\n      }\"\n    />\n  <\/a-space>\n<\/template>";
const verticalTitle = "Vertical.Md";
const verticalDescription = "设置 `direction=\"vertical\"` ，将会显示竖直的滑动条。";
</script>

## 示例

<DemoBlock :title="basicTitle" :description="basicDescription" :code="basicSource"

>   <basicDemo />
> </DemoBlock>

<DemoBlock :title="disabledTitle" :description="disabledDescription" :code="disabledSource"

>   <disabledDemo />
> </DemoBlock>

<DemoBlock :title="inputTitle" :description="inputDescription" :code="inputSource"

>   <inputDemo />
> </DemoBlock>

<DemoBlock :title="marksTitle" :description="marksDescription" :code="marksSource"

>   <marksDemo />
> </DemoBlock>

<DemoBlock :title="rangeTitle" :description="rangeDescription" :code="rangeSource"

>   <rangeDemo />
> </DemoBlock>

<DemoBlock :title="stepTitle" :description="stepDescription" :code="stepSource"

>   <stepDemo />
> </DemoBlock>

<DemoBlock :title="tooltipTitle" :description="tooltipDescription" :code="tooltipSource"

>   <tooltipDemo />
> </DemoBlock>

<DemoBlock :title="verticalTitle" :description="verticalDescription" :code="verticalSource"

>   <verticalDemo />
> </DemoBlock>
