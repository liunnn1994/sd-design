---
title: "input-number"
outline: "deep"
---

```yaml
meta:
  type: 组件
  category: 数据输入
title: 数字输入框 InputNumber
description: 仅允许输入数字格式的输入框。
```









## API


### `<input-number>` Props

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|model-value **(v-model)**|绑定值|`number`|`-`||
|default-value|默认值（非受控模式）|`number`|`-`||
|mode|模式（`embed`：按钮内嵌模式，`button`：左右按钮模式）|`'embed' \| 'button'`|`'embed'`||
|precision|数字精度|`number`|`-`||
|step|数字变化步长|`number`|`1`||
|disabled|是否禁用|`boolean`|`false`||
|error|是否为错误状态|`boolean`|`false`||
|max|最大值|`number`|`Infinity`||
|min|最小值|`number`|`-Infinity`||
|formatter|定义输入框展示值|`func`|`-`||
|parser|从 `formatter` 转换为数字，和 `formatter` 搭配使用|`func`|`-`||
|placeholder|输入框提示文字|`string`|`-`||
|hide-button|是否隐藏按钮|`boolean`|`false`||
|size|输入框大小|`'mini' \| 'small' \| 'medium' \| 'large'`|`'medium'`||
|allow-clear|是否允许清空输入框|`boolean`|`false`||
|model-event|触发 `v-model` 的事件|`'change' \| 'input'`|`'change'`||
|read-only|只读|`boolean`|`false`|2.33.1|
|input-attrs|内部 input 元素的属性|`object`|`-`|2.52.0|
### `<input-number>` Events

|事件名|描述|参数|版本|
|---|---|---|:---|
|change|值发生改变时触发|value: ` number \| undefined `<br>ev: `Event`||
|focus|输入框获取焦点时触发|ev: `FocusEvent`||
|blur|输入框失去焦点时触发|ev: `FocusEvent`||
|clear|用户点击清除按钮时触发|ev: `Event`|2.23.0|
|input|输入时触发|value: ` number \| undefined `<br>inputValue: `string`<br>ev: `Event`|2.27.0|
|keydown|按下键盘时触发|ev: `MouseEvent`|2.56.0|
### `<input-number>` Methods

|方法名|描述|参数|返回值|
|---|---|---|---|
|focus|使输入框获取焦点|-|-|
|blur|使输入框失去焦点|-|-|
### `<input-number>` Slots

|插槽名|描述|参数|
|---|:---:|---|
|minus|数值减少图标|-|
|plus|数值增加图标|-|
|append|后置标签|-|
|prepend|前置标签|-|
|suffix|后缀|-|
|prefix|前缀|-|

<script setup lang="ts">
import basicDemo from '../../.vitepress/theme/generated/input-number/basic.vue';
const basicSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\">\n    <a-input-number v-model=\"value\" :style=\"{width:'320px'}\" placeholder=\"Please Enter\" class=\"input-demo\" :min=\"10\" :max=\"100\"/>\n    <a-input-number :style=\"{width:'320px'}\" placeholder=\"Please Enter\" class=\"input-demo\" :min=\"10\" :max=\"100\"/>\n    <a-input-number :style=\"{width:'320px'}\" placeholder=\"Please Enter\" :default-value=\"500\" class=\"input-demo\" disabled/>\n  <\/a-space>\n<\/template>\n\n<script>\nexport default {\n  data(){\n    return {\n      value:15\n    }\n\n  }\n}\n<\/script>";
const basicTitle = "Basic.Md";
const basicDescription = "通过鼠标或者键盘输入范围内的标准数值。";
import formatDemo from '../../.vitepress/theme/generated/input-number/format.vue';
const formatSource = "<template>\n  <a-input-number :style=\"{width:'320px'}\" placeholder=\"Please Enter\" class=\"input-demo\" :default-value=\"12000\" :min=\"0\" :formatter=\"formatter\" :parser=\"parser\"/>\n<\/template>\n\n<script>\nexport default {\n  setup(){\n    const formatter = (value) => {\n      const values = value.split('.');\n      values[0]=values[0].replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',');\n\n      return values.join('.')\n    };\n\n    const parser = (value) => {\n      return value.replace(/,/g, '')\n    };\n\n    return {\n      formatter,\n      parser\n    }\n  },\n}\n<\/script>";
const formatTitle = "Format.Md";
const formatDescription = "通过 `formatter` 和 `parser` 配合使用可以定义输入框展示值。";
import modeDemo from '../../.vitepress/theme/generated/input-number/mode.vue';
const modeSource = "<template>\n  <a-input-number :style=\"{width:'320px'}\" placeholder=\"Please Enter\" :default-value=\"500\" mode=\"button\" class=\"input-demo\" />\n<\/template>";
const modeTitle = "Mode.Md";
const modeDescription = "指定 `mode` 为 `button` 来使用带按钮的数字输入框。";
import modelDemo from '../../.vitepress/theme/generated/input-number/model.vue';
const modelSource = "<template>\n  <a-input-number v-model=\"value\" :style=\"{width:'320px'}\" placeholder=\"Please Enter\" class=\"input-demo\" :min=\"10\" :max=\"100\" model-event=\"input\"/>\n  <div>value: {{value}}<\/div>\n<\/template>\n\n<script>\nexport default {\n  data(){\n    return {\n      value:15\n    }\n\n  }\n}\n<\/script>";
const modelTitle = "Model.Md";
const modelDescription = "数字输入框默认在 blur 或者按下 Enter 时会修改绑定的值，通过设置属性 model-event=\"input\" 让组件在输入时修改绑定的值。\n注意：在此模式下，输入时的值会超出设置的 min/max，组件会在失焦时修正值的大小。";
import precisionDemo from '../../.vitepress/theme/generated/input-number/precision.vue';
const precisionSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\">\n    <a-input-number :style=\"{width:'320px'}\" placeholder=\"Please Enter\" :default-value=\"3.6\" :step=\"1.2\" :precision=\"2\" class=\"input-demo\" />\n    <a-input-number :style=\"{width:'320px'}\" placeholder=\"Please Enter\" :default-value=\"1.22\" :step=\"1.22\" :precision=\"1\" class=\"input-demo\" />\n  <\/a-space>\n<\/template>";
const precisionTitle = "Precision.Md";
const precisionDescription = "通过 `precision` 来设置数字精度。当 `precision` 小于 `step` 的小数位时，精度取 `step` 的小数个数。";
import prefixDemo from '../../.vitepress/theme/generated/input-number/prefix.vue';
const prefixSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\">\n    <a-input-number :style=\"{width:'320px'}\" placeholder=\"Please enter something\" allow-clear>\n      <template #prefix>\n        <icon-user />\n      <\/template>\n    <\/a-input-number>\n    <a-input-number :style=\"{width:'320px'}\" placeholder=\"Please enter something\" allow-clear hide-button>\n      <template #suffix>\n        <icon-info-circle />\n      <\/template>\n    <\/a-input-number>\n  <\/a-space>\n<\/template>";
const prefixTitle = "Prefix.Md";
const prefixDescription = "通过指定 `prefix` 和 `suffix` 插槽来在输入框内添加前缀和后缀。";
import sizeDemo from '../../.vitepress/theme/generated/input-number/size.vue';
const sizeSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\">\n    <a-input-number :style=\"{width:'320px'}\" placeholder=\"Please Enter\" size=\"large\" class=\"input-demo\" />\n    <a-input-number :style=\"{width:'320px'}\" placeholder=\"Please Enter\" mode=\"button\" size=\"large\" class=\"input-demo\" />\n  <\/a-space>\n<\/template>";
const sizeTitle = "Size.Md";
const sizeDescription = "设置 `size` 可以使用四种尺寸（`mini`, `small`, `medium`, `large`）的数字输入框。高度分别对应`24px`、`28px`、`32px`、`36px`。";
import stepIconDemo from '../../.vitepress/theme/generated/input-number/stepIcon.vue';
const stepIconSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\">\n    <a-input-number :style=\"{width:'320px'}\" placeholder=\"Please enter something\" allow-clear>\n       <template #plus>\n        <icon-plus />\n      <\/template>\n      <template #minus>\n        <icon-minus />\n      <\/template>\n    <\/a-input-number>\n  <\/a-space>\n<\/template>";
const stepIconTitle = "Step Icon.Md";
const stepIconDescription = "通过指定 `plus` 和 `minus` 插槽来修改数值增减操作的图标。";
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
  :title="formatTitle"
  :description="formatDescription"
  :code="formatSource"
>
  <formatDemo />
</DemoBlock>

<DemoBlock
  :title="modeTitle"
  :description="modeDescription"
  :code="modeSource"
>
  <modeDemo />
</DemoBlock>

<DemoBlock
  :title="modelTitle"
  :description="modelDescription"
  :code="modelSource"
>
  <modelDemo />
</DemoBlock>

<DemoBlock
  :title="precisionTitle"
  :description="precisionDescription"
  :code="precisionSource"
>
  <precisionDemo />
</DemoBlock>

<DemoBlock
  :title="prefixTitle"
  :description="prefixDescription"
  :code="prefixSource"
>
  <prefixDemo />
</DemoBlock>

<DemoBlock
  :title="sizeTitle"
  :description="sizeDescription"
  :code="sizeSource"
>
  <sizeDemo />
</DemoBlock>

<DemoBlock
  :title="stepIconTitle"
  :description="stepIconDescription"
  :code="stepIconSource"
>
  <stepIconDemo />
</DemoBlock>
