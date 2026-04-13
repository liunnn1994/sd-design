---
title: "button"
outline: "deep"
---

```yaml
meta:
  type: 组件
  category: 通用
title: 按钮 Button
description: 按钮是一种命令组件，可发起一个即时操作。
```










## API


### `<button>` Props

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|type|按钮的类型，分为五种：次要按钮、主要按钮、虚框按钮、线性按钮、文字按钮。|`ButtonTypes`|`'secondary'`|
|shape|按钮的形状|`BorderShape`|`-`|
|status|按钮的状态|`'normal' \| 'warning' \| 'success' \| 'danger'`|`'normal'`|
|size|按钮的尺寸|`'mini' \| 'small' \| 'medium' \| 'large'`|`'medium'`|
|long|按钮的宽度是否随容器自适应。|`boolean`|`false`|
|loading|按钮是否为加载中状态|`boolean`|`false`|
|disabled|按钮是否禁用|`boolean`|`false`|
|html-type|设置 `button` 的原生 `type` 属性，可选值参考 [HTML标准](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-type "_blank")|`HTMLButtonElement['type']`|`'button'`|
|autofocus|设置 `button` 的原生 `autofocus` 属性，可选值参考 [HTML标准](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-type "_blank")|`boolean`|`false`|
|href|设置跳转链接。设置此属性时，按钮渲染为a标签。|`string`|`-`|
### `<button>` Events

|事件名|描述|参数|
|---|---|---|
|click|点击按钮时触发|ev: `MouseEvent`|
### `<button>` Slots

|插槽名|描述|参数|
|---|:---:|---|
|icon|图标|-|




### `<button-group>` Props

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|type|按钮的类型，分为五种：次要按钮、主要按钮、虚框按钮、线性按钮、文字按钮。|`ButtonTypes`|`-`|
|status|按钮的状态|`'normal' \| 'warning' \| 'success' \| 'danger'`|`-`|
|shape|按钮的形状|`BorderShape`|`-`|
|size|按钮的尺寸|`'mini' \| 'small' \| 'medium' \| 'large'`|`-`|
|disabled|全部子按钮是否禁用|`boolean`|`false`|

<script setup lang="ts">
import basicDemo from '../../.vitepress/theme/generated/button/basic.vue';
const basicSource = "<template>\n  <a-space>\n    <a-button type=\"primary\">Primary<\/a-button>\n    <a-button>Secondary<\/a-button>\n    <a-button type=\"dashed\">Dashed<\/a-button>\n    <a-button type=\"outline\">Outline<\/a-button>\n    <a-button type=\"text\">Text<\/a-button>\n  <\/a-space>\n<\/template>";
const basicTitle = "Basic.Md";
const basicDescription = "按钮分为 `primary` - **主要按钮**、`secondary` - **次要按钮（默认）**、`dashed` - **虚线按钮**、`outline` - **线形按钮**、`text` - **文本按钮**五种类型。";
import disabledDemo from '../../.vitepress/theme/generated/button/disabled.vue';
const disabledSource = "<template>\n  <a-space direction=\"vertical\">\n    <a-space>\n      <a-button type=\"primary\" disabled>Primary<\/a-button>\n      <a-button disabled>Default<\/a-button>\n      <a-button type=\"dashed\" disabled>Dashed<\/a-button>\n      <a-button type=\"outline\" disabled>Outline<\/a-button>\n      <a-button type=\"text\" disabled>Text<\/a-button>\n    <\/a-space>\n    <a-space>\n      <a-button type=\"primary\" status=\"success\" disabled>Primary<\/a-button>\n      <a-button status=\"success\" disabled>Default<\/a-button>\n      <a-button type=\"dashed\" status=\"success\" disabled>Dashed<\/a-button>\n      <a-button type=\"outline\" status=\"success\" disabled>Outline<\/a-button>\n      <a-button type=\"text\" status=\"success\" disabled>Text<\/a-button>\n    <\/a-space>\n    <a-space>\n      <a-button type=\"primary\" status=\"warning\" disabled>Primary<\/a-button>\n      <a-button status=\"warning\" disabled>Default<\/a-button>\n      <a-button type=\"dashed\" status=\"warning\" disabled>Dashed<\/a-button>\n      <a-button type=\"outline\" status=\"warning\" disabled>Outline<\/a-button>\n      <a-button type=\"text\" status=\"warning\" disabled>Text<\/a-button>\n    <\/a-space>\n    <a-space>\n      <a-button type=\"primary\" status=\"danger\" disabled>Primary<\/a-button>\n      <a-button status=\"danger\" disabled>Default<\/a-button>\n      <a-button type=\"dashed\" status=\"danger\" disabled>Dashed<\/a-button>\n      <a-button type=\"outline\" status=\"danger\" disabled>Outline<\/a-button>\n      <a-button type=\"text\" status=\"danger\" disabled>Text<\/a-button>\n    <\/a-space>\n  <\/a-space>\n<\/template>";
const disabledTitle = "Disabled.Md";
const disabledDescription = "按钮的禁用状态。";
import groupDemo from '../../.vitepress/theme/generated/button/group.vue';
const groupSource = "<template>\n  <a-space direction=\"vertical\">\n    <a-button-group>\n      <a-button>Publish<\/a-button>\n      <a-button>\n        <template #icon>\n          <icon-down />\n        <\/template>\n      <\/a-button>\n    <\/a-button-group>\n    <a-button-group>\n      <a-button>Publish<\/a-button>\n      <a-button>\n        <template #icon>\n          <icon-more />\n        <\/template>\n      <\/a-button>\n    <\/a-button-group>\n    <a-button-group>\n      <a-button type=\"primary\">\n        <icon-left />\n        Prev\n      <\/a-button>\n      <a-button type=\"primary\">\n        Next\n        <icon-right />\n      <\/a-button>\n    <\/a-button-group>\n    <a-space size=\"large\">\n      <a-button-group type=\"primary\">\n        <a-button> copy <\/a-button>\n        <a-button> cut <\/a-button>\n        <a-button> find <\/a-button>\n      <\/a-button-group>\n      <a-button-group type=\"primary\" status=\"warning\">\n        <a-button> <template #icon><icon-heart-fill /><\/template> <\/a-button>\n        <a-button> <template #icon><icon-star-fill /><\/template> <\/a-button>\n        <a-button> <template #icon><icon-thumb-up-fill /><\/template> <\/a-button>\n      <\/a-button-group>\n      <a-button-group size=\"small\" disabled>\n        <a-button> prev <\/a-button>\n        <a-button> next <\/a-button>\n      <\/a-button-group>\n    <\/a-space>\n  <\/a-space>\n<\/template>";
const groupTitle = "Group.Md";
const groupDescription = "通过 `<a-button-group>` 组件使按钮以组合方式出现。可用在同级多项操作中。";
import iconDemo from '../../.vitepress/theme/generated/button/icon.vue';
const iconSource = "<template>\n  <a-space>\n    <a-button type=\"primary\">\n      <template #icon>\n        <icon-plus />\n      <\/template>\n    <\/a-button>\n    <a-button type=\"primary\">\n      <template #icon>\n        <icon-delete />\n      <\/template>\n      <\!-- Use the default slot to avoid extra spaces -->\n      <template #default>Delete<\/template>\n    <\/a-button>\n  <\/a-space>\n<\/template>\n\n<script>\nimport { IconPlus, IconDelete } from '@arco-design/web-vue/es/icon';\n\nexport default {\n  components: { IconPlus, IconDelete }\n};\n<\/script>";
const iconTitle = "Icon.Md";
const iconDescription = "按钮可以嵌入图标。在只设置图标时，按钮的宽高相等。";
import loadingDemo from '../../.vitepress/theme/generated/button/loading.vue';
const loadingSource = "<template>\n  <a-space>\n    <a-button type=\"primary\" loading>Primary<\/a-button>\n    <a-button loading>Default<\/a-button>\n    <a-button type=\"dashed\" loading>Dashed<\/a-button>\n    <a-button type=\"primary\" :loading=\"loading1\" @click=\"handleClick1\">Click Me<\/a-button>\n    <a-button type=\"primary\" :loading=\"loading2\" @click=\"handleClick2\">\n      <template #icon>\n        <icon-plus />\n      <\/template>\n      Click Me\n    <\/a-button>\n  <\/a-space>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\nimport { IconPlus } from '@arco-design/web-vue/es/icon';\n\nexport default {\n  components: {\n    IconPlus\n  },\n  setup() {\n    const loading1 = ref(false);\n    const loading2 = ref(false);\n\n    const handleClick1 = () => {\n      loading1.value = !loading1.value\n    }\n    const handleClick2 = () => {\n      loading2.value = !loading2.value\n    }\n\n    return {\n      loading1,\n      loading2,\n      handleClick1,\n      handleClick2\n    }\n  }\n}\n<\/script>";
const loadingTitle = "Loading.Md";
const loadingDescription = "通过设置 `loading` 可以让按钮处于加载中状态。处于加载中状态的按钮不会触发点击事件。";
import longDemo from '../../.vitepress/theme/generated/button/long.vue';
const longSource = "<template>\n  <a-space class=\"wrapper\" direction=\"vertical\">\n    <a-button type=\"primary\" long>Primary<\/a-button>\n    <a-button long>Default<\/a-button>\n    <a-button type=\"dashed\" long>Dashed<\/a-button>\n    <a-button type=\"outline\" long>Outline<\/a-button>\n    <a-button type=\"text\" long>Text<\/a-button>\n  <\/a-space>\n<\/template>\n\n<style scoped lang=\"less\">\n.wrapper{\n  width: 400px;\n  padding: 20px;\n  border: 1px solid var(~'--color-border');\n  border-radius: 4px;\n}\n<\/style>";
const longTitle = "Long.Md";
const longDescription = "通过设置 `long` 属性，使按钮的宽度跟随容器的宽度。";
import shapeDemo from '../../.vitepress/theme/generated/button/shape.vue';
const shapeSource = "<template>\n  <a-space>\n    <a-button type=\"primary\">Square<\/a-button>\n    <a-button type=\"primary\" shape=\"round\">Round<\/a-button>\n    <a-button type=\"primary\">\n      <template #icon>\n        <icon-plus />\n      <\/template>\n    <\/a-button>\n    <a-button type=\"primary\" shape=\"circle\">\n      <icon-plus />\n    <\/a-button>\n  <\/a-space>\n<\/template>\n<script>\nimport { IconPlus } from '@arco-design/web-vue/es/icon';\n\nexport default {\n  components: { IconPlus }\n};\n<\/script>";
const shapeTitle = "Shape.Md";
const shapeDescription = "按钮分为 `square` - **长方形（默认）**、`circle` - **圆形**、`round` - **全圆角**三种形状。";
import sizeDemo from '../../.vitepress/theme/generated/button/size.vue';
const sizeSource = "<template>\n  <a-space>\n    <a-button type=\"primary\" size=\"mini\">Mini<\/a-button>\n    <a-button type=\"primary\" size=\"small\">Small<\/a-button>\n    <a-button type=\"primary\">Medium<\/a-button>\n    <a-button type=\"primary\" size=\"large\">Large<\/a-button>\n  <\/a-space>\n<\/template>";
const sizeTitle = "Size.Md";
const sizeDescription = "按钮分为 `mini`、`small`、`medium`、`large` 四种尺寸。高度分别为：`24px`、`28px`、`32px`、`36px`。推荐（默认）尺寸为 `medium`。可在不同场景及不同业务需求选择适合尺寸。";
import statusDemo from '../../.vitepress/theme/generated/button/status.vue';
const statusSource = "<template>\n  <a-space direction=\"vertical\">\n    <a-space>\n      <a-button type=\"primary\" status=\"success\">Primary<\/a-button>\n      <a-button status=\"success\">Default<\/a-button>\n      <a-button type=\"dashed\" status=\"success\">Dashed<\/a-button>\n      <a-button type=\"outline\" status=\"success\">Outline<\/a-button>\n      <a-button type=\"text\" status=\"success\">Text<\/a-button>\n    <\/a-space>\n    <a-space>\n      <a-button type=\"primary\" status=\"warning\">Primary<\/a-button>\n      <a-button status=\"warning\">Default<\/a-button>\n      <a-button type=\"dashed\" status=\"warning\">Dashed<\/a-button>\n      <a-button type=\"outline\" status=\"warning\">Outline<\/a-button>\n      <a-button type=\"text\" status=\"warning\">Text<\/a-button>\n    <\/a-space>\n    <a-space>\n      <a-button type=\"primary\" status=\"danger\">Primary<\/a-button>\n      <a-button status=\"danger\">Default<\/a-button>\n      <a-button type=\"dashed\" status=\"danger\">Dashed<\/a-button>\n      <a-button type=\"outline\" status=\"danger\">Outline<\/a-button>\n      <a-button type=\"text\" status=\"danger\">Text<\/a-button>\n    <\/a-space>\n  <\/a-space>\n<\/template>";
const statusTitle = "Status.Md";
const statusDescription = "按钮的状态分为 `normal` - **正常（默认）**、`success` - **成功**、`warning` - **警告**、`danger` - **危险**四种，可以与按钮类型同时使用。";
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
  :title="disabledTitle"
  :description="disabledDescription"
  :code="disabledSource"
>
  <disabledDemo />
</DemoBlock>

<DemoBlock
  :title="groupTitle"
  :description="groupDescription"
  :code="groupSource"
>
  <groupDemo />
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
  :title="longTitle"
  :description="longDescription"
  :code="longSource"
>
  <longDemo />
</DemoBlock>

<DemoBlock
  :title="shapeTitle"
  :description="shapeDescription"
  :code="shapeSource"
>
  <shapeDemo />
</DemoBlock>

<DemoBlock
  :title="sizeTitle"
  :description="sizeDescription"
  :code="sizeSource"
>
  <sizeDemo />
</DemoBlock>

<DemoBlock
  :title="statusTitle"
  :description="statusDescription"
  :code="statusSource"
>
  <statusDemo />
</DemoBlock>
