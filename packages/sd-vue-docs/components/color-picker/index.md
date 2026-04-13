---
title: "color-picker"
outline: "deep"
---

```yaml
meta:
  type: 组件
  category: 数据输入
title: 颜色选择器 ColorPicker
description: 用于选择和展示颜色
```


## API


### `<color-picker>` Props

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|model-value **(v-model)**|绑定值|`string`|`-`|
|default-value|默认值（非受控状态）|`string`|`-`|
|format|颜色值的格式|`'hex' \| 'rgb'`|`-`|
|size|尺寸|`'mini' \| 'small' \| 'medium' \| 'large'`|`'medium'`|
|show-text|显示颜色值|`boolean`|`false`|
|show-history|显示历史颜色|`boolean`|`false`|
|show-preset|显示预设颜色|`boolean`|`false`|
|disabled|禁用|`boolean`|`false`|
|disabled-alpha|禁用透明通道|`boolean`|`false`|
|hide-trigger|没有触发元素，只显示颜色面板|`boolean`|`false`|
|trigger-props|接受所有 [Trigger](/components/trigger/) 组件的Props|`Partial<TriggerProps>`|`-`|
|history-colors|历史颜色的颜色数组|`string[]`|`-`|
|preset-colors|预设颜色的颜色数组|`string[]`|`() => colors`|
### `<color-picker>` Events

|事件名|描述|参数|
|---|---|---|
|change|颜色值改变时触发|value: `string`|
|popup-visible-change|颜色面板展开和收起时触发|visible: `boolean`<br>value: `string`|

<script setup lang="ts">
import basicDemo from '../../.vitepress/theme/generated/color-picker/basic.vue';
const basicSource = "<template>\n  <a-space>\n    <a-color-picker  v-model=\"value\" />\n    <a-color-picker defaultValue=\"#165DFF\" showText disabledAlpha/>\n  <\/a-space>\n<\/template>\n\n<script setup>\nimport { ref } from 'vue';\nconst value = ref('#165DFF')\n<\/script>";
const basicTitle = "Basic.Md";
const basicDescription = "基本用法";
import colorsDemo from '../../.vitepress/theme/generated/color-picker/colors.vue';
const colorsSource = "<template>\n  <a-color-picker\n    defaultValue=\"#165DFF\"\n    :historyColors=\"history\"\n    showHistory\n    showPreset\n    @popup-visible-change=\"addHistory\"\n  />\n<\/template>\n\n<script setup>\nimport { ref } from 'vue';\n\nconst history = ref(['#165DFF'])\nconst addHistory = (visible, color) => {\n  if (!visible) {\n    const index = history.value.indexOf(color);\n    if (index !== -1) {\n      history.value.splice(index, 1);\n    }\n    history.value.unshift(color);\n  }\n}\n<\/script>";
const colorsTitle = "Colors.Md";
const colorsDescription = "通过 `showPreset` 和 `showHistory` 开启预设颜色和历史颜色区域。历史颜色需要用户自行控制展示内容。";
import disabledDemo from '../../.vitepress/theme/generated/color-picker/disabled.vue';
const disabledSource = "<template>\n  <a-space>\n    <a-color-picker defaultValue=\"#165DFF\" disabled />\n    <a-color-picker defaultValue=\"#165DFF\" showText disabled />\n  <\/a-space>\n<\/template>";
const disabledTitle = "Disabled.Md";
const disabledDescription = "设置 `disabled` 禁用选择器。";
import formatDemo from '../../.vitepress/theme/generated/color-picker/format.vue';
const formatSource = "<template>\n  <a-space direction=\"vertical\">\n    <a-radio-group type=\"button\" v-model=\"format\">\n      <a-radio v-for=\"item in formatList\" :value=\"item\">{{item}}<\/a-radio>\n    <\/a-radio-group>\n    <a-color-picker defaultValue=\"#165DFF\" :format=\"format\" showText />\n  <\/a-space>\n<\/template>\n\n<script setup>\nimport { ref } from 'vue';\n\nconst format = ref('hex')\nconst formatList = ['hex', 'rgb']\n<\/script>";
const formatTitle = "Format.Md";
const formatDescription = "通过 `format` 设置颜色值的格式，支持 `hex` 和 `rgb`。";
import onlyPanelDemo from '../../.vitepress/theme/generated/color-picker/onlyPanel.vue';
const onlyPanelSource = "<template>\n  <a-space :size=\"32\">\n    <a-color-picker defaultValue=\"#165DFF\" hideTrigger showHistory showPreset/>\n    <a-color-picker defaultValue=\"#12D2AC\" disabled hideTrigger showPreset/>\n  <\/a-space>\n<\/template>";
const onlyPanelTitle = "Only Panel.Md";
const onlyPanelDescription = "只用颜色选择面板。";
import sizeDemo from '../../.vitepress/theme/generated/color-picker/size.vue';
const sizeSource = "<template>\n  <a-space>\n    <a-color-picker defaultValue=\"#165DFF\" size=\"mini\" />\n    <a-color-picker defaultValue=\"#165DFF\" size=\"small\" />\n    <a-color-picker defaultValue=\"#165DFF\" size=\"medium\" />\n    <a-color-picker defaultValue=\"#165DFF\" size=\"large\" />\n  <\/a-space>\n<\/template>";
const sizeTitle = "Size.Md";
const sizeDescription = "颜色选择器定义了四种尺寸（`mini`,`small`, `medium`, `large`），分别为 24px，28px，32px，36px。";
import triggerElementDemo from '../../.vitepress/theme/generated/color-picker/triggerElement.vue';
const triggerElementSource = "<template>\n  <a-space>\n    <a-color-picker v-model=\"value\" size=\"mini\" >\n      <a-tag :color=\"value\">\n        <template #icon>\n          <icon-bg-colors style=\"color: #fff\" />\n        <\/template>\n        {{value}}\n      <\/a-tag>\n    <\/a-color-picker>\n  <\/a-space>\n<\/template>\n\n<script setup>\nimport { ref } from 'vue';\n\nconst value = ref('#165DFF');\n<\/script>";
const triggerElementTitle = "Trigger Element.Md";
const triggerElementDescription = "自定义触发元素。";
import triggerDemo from '../../.vitepress/theme/generated/color-picker/trigger.vue';
const triggerSource = "<template>\n  <a-space direction=\"vertical\">\n    <a-switch v-model=\"triggerProps.popupVisible\">\n      <template #checked> ON <\/template>\n      <template #unchecked>OFF<\/template>\n    <\/a-switch>\n    <a-color-picker defaultValue=\"#165DFF\" :trigger-props=\"triggerProps\" />\n  <\/a-space>\n<\/template>\n\n<script setup>\nimport { ref } from 'vue';\n\nconst triggerProps = ref({\n  popupVisible: false,\n  unmountOnClose: true,\n  renderToBody: false,\n  position: 'rt'\n})\n<\/script>";
const triggerTitle = "Trigger.Md";
const triggerDescription = "可以通过 `trigger-props` 设置触发器的所有属性。";
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
  :title="colorsTitle"
  :description="colorsDescription"
  :code="colorsSource"
>
  <colorsDemo />
</DemoBlock>

<DemoBlock
  :title="disabledTitle"
  :description="disabledDescription"
  :code="disabledSource"
>
  <disabledDemo />
</DemoBlock>

<DemoBlock
  :title="formatTitle"
  :description="formatDescription"
  :code="formatSource"
>
  <formatDemo />
</DemoBlock>

<DemoBlock
  :title="onlyPanelTitle"
  :description="onlyPanelDescription"
  :code="onlyPanelSource"
>
  <onlyPanelDemo />
</DemoBlock>

<DemoBlock
  :title="sizeTitle"
  :description="sizeDescription"
  :code="sizeSource"
>
  <sizeDemo />
</DemoBlock>

<DemoBlock
  :title="triggerElementTitle"
  :description="triggerElementDescription"
  :code="triggerElementSource"
>
  <triggerElementDemo />
</DemoBlock>

<DemoBlock
  :title="triggerTitle"
  :description="triggerDescription"
  :code="triggerSource"
>
  <triggerDemo />
</DemoBlock>
