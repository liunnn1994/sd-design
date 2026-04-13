---
title: "switch"
outline: "deep"
---

```yaml
meta:
  type: 组件
  category: 数据输入
title: 开关 Switch
description: 互斥性的操作控件，用户可打开或关闭某个功能。
```











## API


### `<switch>` Props

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|model-value **(v-model)**|绑定值|`string\|number\|boolean`|`-`||
|default-checked|默认选中状态（非受控状态）|`boolean`|`false`||
|disabled|是否禁用|`boolean`|`false`||
|loading|是否为加载中状态|`boolean`|`false`||
|type|开关的类型|`'circle' \| 'round' \| 'line'`|`'circle'`||
|size|开关的大小|`'small' \| 'medium'`|`'medium'`||
|checked-value|选中时的值|`string\|number\|boolean`|`true`|2.12.0|
|unchecked-value|未选中时的值|`string\|number\|boolean`|`false`|2.12.0|
|checked-color|选中时的开关颜色|`string`|`-`|2.12.0|
|unchecked-color|未选中时的开关颜色|`string`|`-`|2.12.0|
|before-change|switch 状态改变前的钩子， 返回 false 或者返回 Promise 且被 reject 则停止切换。|`(  newValue: string \| number \| boolean) => Promise<boolean \| void> \| boolean \| void`|`-`|2.37.0|
|checked-text|打开状态时的文案（`type='line'`和`size='small'`时不生效）|`string`|`-`|2.45.0|
|unchecked-text|关闭状态时的文案（`type='line'`和`size='small'`时不生效）|`string`|`-`|2.45.0|
### `<switch>` Events

|事件名|描述|参数|
|---|---|---|
|change|值改变时触发|value: ` boolean \| string \| number `<br>ev: `Event`|
|focus|组件获得焦点时触发|ev: `FocusEvent`|
|blur|组件失去焦点时触发|ev: `FocusEvent`|
### `<switch>` Slots

|插槽名|描述|参数|
|---|:---:|---|
|checked-icon|打开状态时，按钮上的图标|-|
|unchecked-icon|关闭状态时，按钮上的图标|-|
|checked|打开状态时的文案（`type='line'`和`size='small'`时不生效）|-|
|unchecked|关闭状态时的文案（`type='line'`和`size='small'`时不生效）|-|

<script setup lang="ts">
import basicDemo from '../../.vitepress/theme/generated/switch/basic.vue';
const basicSource = "<template>\n  <a-switch />\n<\/template>";
const basicTitle = "Basic.Md";
const basicDescription = "开关的基本用法。";
import changeInterceptDemo from '../../.vitepress/theme/generated/switch/changeIntercept.vue';
const changeInterceptSource = "<template>\n  <a-space size=\"large\">\n    <a-switch :beforeChange=\"handleChangeIntercept\"/>\n    <a-switch type=\"round\" :beforeChange=\"handleChangeIntercept2\"/>\n    <a-switch type=\"line\" :beforeChange=\"handleChangeIntercept3\"/>\n  <\/a-space>\n<\/template>\n\n<script>\nimport { Message } from '@sd-design/web-vue';\n\nexport default {\n  setup() {\n    const handleChangeIntercept = async (newValue) => {\n      await new Promise((resolve) => setTimeout(resolve, 1000))\n      return true\n    }\n\n    const handleChangeIntercept2 = async (newValue) => {\n      await new Promise((resolve) => setTimeout(resolve, 500))\n      if (!newValue) {\n        Message.error(\"OH, You can't change\")\n        return false\n      }\n      return true\n    }\n\n    const handleChangeIntercept3 = async (newValue) => {\n      await new Promise((_, reject) => setTimeout(() => {\n        Message.error(\"OH, Something went wrong\")\n        reject()\n      }, 1000))\n      return true\n    }\n\n    return {\n      handleChangeIntercept,\n      handleChangeIntercept2,\n      handleChangeIntercept3\n    }\n  }\n}\n<\/script>";
const changeInterceptTitle = "Change Intercept.Md";
const changeInterceptDescription = "设置 `beforeChange` 函数，函数的返回值将用于判断是否阻止切换。";
import colorDemo from '../../.vitepress/theme/generated/switch/color.vue';
const colorSource = "<template>\n  <a-switch checked-color=\"#F53F3F\" unchecked-color=\"#14C9C9\" />\n<\/template>";
const colorTitle = "Color.Md";
const colorDescription = "通过 `checked-color` 和 `unchecked-color` 可以自定义开关的颜色。";
import disabledDemo from '../../.vitepress/theme/generated/switch/disabled.vue';
const disabledSource = "<template>\n  <a-space size=\"large\">\n    <a-switch disabled/>\n    <a-switch :default-checked=\"true\" disabled/>\n    <a-switch type=\"round\" disabled/>\n    <a-switch :default-checked=\"true\" type=\"round\" disabled/>\n    <a-switch type=\"line\" disabled/>\n    <a-switch :default-checked=\"true\" type=\"line\" disabled/>\n  <\/a-space>\n<\/template>";
const disabledTitle = "Disabled.Md";
const disabledDescription = "禁用开关。";
import iconDemo from '../../.vitepress/theme/generated/switch/icon.vue';
const iconSource = "<template>\n  <a-space size=\"large\">\n    <a-switch>\n      <template #checked-icon>\n        <icon-check/>\n      <\/template>\n      <template #unchecked-icon>\n        <icon-close/>\n      <\/template>\n    <\/a-switch>\n    <a-switch type=\"round\">\n      <template #checked-icon>\n        <icon-check/>\n      <\/template>\n      <template #unchecked-icon>\n        <icon-close/>\n      <\/template>\n    <\/a-switch>\n    <a-switch type=\"line\">\n      <template #checked-icon>\n        <icon-check/>\n      <\/template>\n      <template #unchecked-icon>\n        <icon-close/>\n      <\/template>\n    <\/a-switch>\n  <\/a-space>\n<\/template>";
const iconTitle = "Icon.Md";
const iconDescription = "自定义开关按钮上显示的图标。";
import loadingDemo from '../../.vitepress/theme/generated/switch/loading.vue';
const loadingSource = "<template>\n  <a-space size=\"large\">\n    <a-switch loading />\n    <a-switch type=\"round\" loading />\n    <a-switch type=\"line\" loading />\n  <\/a-space>\n<\/template>";
const loadingTitle = "Loading.Md";
const loadingDescription = "通过设置 `loading` 使开关处于加载中状态，此时开关不可点击。";
import sizeDemo from '../../.vitepress/theme/generated/switch/size.vue';
const sizeSource = "<template>\n  <a-space size=\"large\">\n    <a-switch />\n    <a-switch size=\"small\"/>\n  <\/a-space>\n<\/template>";
const sizeTitle = "Size.Md";
const sizeDescription = "开关分为 `small`、`medium` 两种尺寸。";
import textDemo from '../../.vitepress/theme/generated/switch/text.vue';
const textSource = "<template>\n  <a-space size=\"large\">\n    <a-switch>\n      <template #checked>\n        ON\n      <\/template>\n      <template #unchecked>\n        OFF\n      <\/template>\n    <\/a-switch>\n    <a-switch type=\"round\">\n      <template #checked>\n        ON\n      <\/template>\n      <template #unchecked>\n        OFF\n      <\/template>\n    <\/a-switch>\n  <\/a-space>\n<\/template>";
const textTitle = "Text.Md";
const textDescription = "自定义开关的打开/关闭状态的文字。";
import typeDemo from '../../.vitepress/theme/generated/switch/type.vue';
const typeSource = "<template>\n  <a-space size=\"large\">\n    <a-switch />\n    <a-switch type=\"round\"/>\n    <a-switch type=\"line\"/>\n  <\/a-space>\n<\/template>";
const typeTitle = "Type.Md";
const typeDescription = "开关分为 `circle` - **圆形（默认）**、`round` - **圆角**、`line` - **线性**三种类型。";
import valueDemo from '../../.vitepress/theme/generated/switch/value.vue';
const valueSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\">\n    <a-switch v-model=\"value\" checked-value=\"yes\" unchecked-value=\"no\" />\n    <div>Current Value: {{ value }}<\/div>\n  <\/a-space>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const value = ref('');\n\n    return {\n      value\n    }\n  },\n}\n<\/script>";
const valueTitle = "Value.Md";
const valueDescription = "通过 `checked-value` 和 `unchecked-value` 可以自定义开关的值。";
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
  :title="changeInterceptTitle"
  :description="changeInterceptDescription"
  :code="changeInterceptSource"
>
  <changeInterceptDemo />
</DemoBlock>

<DemoBlock
  :title="colorTitle"
  :description="colorDescription"
  :code="colorSource"
>
  <colorDemo />
</DemoBlock>

<DemoBlock
  :title="disabledTitle"
  :description="disabledDescription"
  :code="disabledSource"
>
  <disabledDemo />
</DemoBlock>

<DemoBlock
  :title="iconTitle"
  :description="iconDescription"
  :code="iconSource"
>
  <iconDemo />
</DemoBlock>

<DemoBlock
  :title="loadingTitle"
  :description="loadingDescription"
  :code="loadingSource"
>
  <loadingDemo />
</DemoBlock>

<DemoBlock
  :title="sizeTitle"
  :description="sizeDescription"
  :code="sizeSource"
>
  <sizeDemo />
</DemoBlock>

<DemoBlock
  :title="textTitle"
  :description="textDescription"
  :code="textSource"
>
  <textDemo />
</DemoBlock>

<DemoBlock
  :title="typeTitle"
  :description="typeDescription"
  :code="typeSource"
>
  <typeDemo />
</DemoBlock>

<DemoBlock
  :title="valueTitle"
  :description="valueDescription"
  :code="valueSource"
>
  <valueDemo />
</DemoBlock>
