---
title: "alert"
outline: "deep"
---

```yaml
meta:
  type: 组件
  category: 反馈
title: 警告提示 Alert
description: 向用户显示警告的信息时，通过警告提示，展现需要关注的信息。
```









## API


### `<alert>` Props

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|type|警告提示的类型。2.41.0 新增 `normal` 类型|`info \| success \| warning \| error \| normal`|`'info'`|
|show-icon|是否展示图标|`boolean`|`true`|
|closable|是否展示关闭按钮|`boolean`|`false`|
|title|警告提示的标题|`string`|`-`|
|banner|是否作为顶部公告使用（去除边框和圆角）|`boolean`|`false`|
|center|内容是否居中显示|`boolean`|`false`|
### `<alert>` Events

|事件名|描述|参数|
|---|---|---|
|close|点击关闭按钮时触发|ev: `MouseEvent`|
|after-close|关闭动画结束后触发|-|
### `<alert>` Slots

|插槽名|描述|参数|版本|
|---|:---:|---|:---|
|icon|图标|-||
|title|标题|-||
|action|操作项|-||
|close-element|关闭元素|-|2.36.0|

<script setup lang="ts">
import actionDemo from '../../.vitepress/theme/generated/alert/action.vue';
const actionSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\" style=\"width: 100%;\">\n    <a-alert closable>\n      This is an info alert.\n      <template #action>\n        <a-button size=\"small\" type=\"primary\">Detail<\/a-button>\n      <\/template>\n    <\/a-alert>\n    <a-alert title=\"Example\" closable>\n      This is an info alert.\n      <template #action>\n        <a-button size=\"small\" type=\"primary\">Detail<\/a-button>\n      <\/template>\n    <\/a-alert>\n  <\/a-space>\n<\/template>";
const actionTitle = "Action.Md";
const actionDescription = "通过 `#action` 插槽自定义操作按钮";
import bannerDemo from '../../.vitepress/theme/generated/alert/banner.vue';
const bannerSource = "<template>\n  <a-alert banner center>This is an info alert.<\/a-alert>\n<\/template>";
const bannerTitle = "Banner.Md";
const bannerDescription = "通过设置 `banner`，可将警告提示作为顶部公告使用（去除边框和圆角）。";
import basicDemo from '../../.vitepress/theme/generated/alert/basic.vue';
const basicSource = "<template>\n  <a-alert>This is an info alert.<\/a-alert>\n<\/template>";
const basicTitle = "Basic.Md";
const basicDescription = "展现需要关注的信息，适用于简短的警告提示。";
import closableDemo from '../../.vitepress/theme/generated/alert/closable.vue';
const closableSource = "<template>\n  <a-row :gutter=\"[40, 20]\">\n    <a-col :span=\"12\">\n      <a-alert closable>This is an info alert.<\/a-alert>\n    <\/a-col>\n    <a-col :span=\"12\">\n      <a-alert type=\"success\" closable>This is an success alert.<\/a-alert>\n    <\/a-col>\n    <a-col :span=\"12\">\n      <a-alert type=\"warning\" closable>\n        <template #title>\n          Warning\n        <\/template>\n        This is an warning alert.\n      <\/a-alert>\n    <\/a-col>\n    <a-col :span=\"12\">\n      <a-alert type=\"error\" closable>\n        <template #title>\n          Error\n        <\/template>\n        This is an error alert.\n      <\/a-alert>\n    <\/a-col>\n  <\/a-row>\n<\/template>";
const closableTitle = "Closable.Md";
const closableDescription = "通过设置 `closable`，可开启关闭按钮。";
import closeElementDemo from '../../.vitepress/theme/generated/alert/closeElement.vue';
const closeElementSource = "<template>\n  <a-row :gutter=\"[40, 20]\">\n    <a-col :span=\"12\">\n      <a-alert closable>\n        <template #close-element>\n          <icon-close-circle />\n        <\/template>\n        This is an info alert.\n      <\/a-alert>\n    <\/a-col>\n    <a-col :span=\"12\">\n      <a-alert closable>\n        <template #close-element>\n          Close\n        <\/template>\n        This is an info alert.\n      <\/a-alert>\n    <\/a-col>\n  <\/a-row>\n<\/template>";
const closeElementTitle = "Close Element.Md";
const closeElementDescription = "指定 `close-element` slot，自定义关闭元素。";
import iconDemo from '../../.vitepress/theme/generated/alert/icon.vue';
const iconSource = "<template>\n  <a-row :gutter=\"[40, 20]\">\n    <a-col :span=\"12\">\n      <a-alert :show-icon=\"false\">This is an info alert.<\/a-alert>\n    <\/a-col>\n    <a-col :span=\"12\">\n      <a-alert type=\"success\" :show-icon=\"false\">This is an success alert.<\/a-alert>\n    <\/a-col>\n    <a-col :span=\"12\">\n      <a-alert type=\"warning\" :show-icon=\"false\">\n        <template #title>\n          Warning\n        <\/template>\n        This is an warning alert.\n      <\/a-alert>\n    <\/a-col>\n    <a-col :span=\"12\">\n      <a-alert type=\"error\" :show-icon=\"false\">\n        <template #title>\n          Error\n        <\/template>\n        This is an error alert.\n      <\/a-alert>\n    <\/a-col>\n  <\/a-row>\n<\/template>";
const iconTitle = "Icon.Md";
const iconDescription = "通过设置 `:show-icon=\"false\"` 来隐藏图标。";
import titleDemo from '../../.vitepress/theme/generated/alert/title.vue';
const titleSource = "<template>\n  <a-row :gutter=\"[40, 20]\">\n    <a-col :span=\"12\">\n      <a-alert title=\"Info\">This is an info alert.<\/a-alert>\n    <\/a-col>\n    <a-col :span=\"12\">\n      <a-alert title=\"Success\" type=\"success\">This is an success alert.<\/a-alert>\n    <\/a-col>\n    <a-col :span=\"12\">\n      <a-alert type=\"warning\">\n        <template #title>\n          Warning\n        <\/template>\n        This is an warning alert.\n      <\/a-alert>\n    <\/a-col>\n    <a-col :span=\"12\">\n      <a-alert type=\"error\">\n        <template #title>\n          Error\n        <\/template>\n        This is an error alert.\n      <\/a-alert>\n    <\/a-col>\n  <\/a-row>\n<\/template>";
const titleTitle = "Title.Md";
const titleDescription = "通过设置 `title` 可以给警告提示添加标题。";
import typeDemo from '../../.vitepress/theme/generated/alert/type.vue';
const typeSource = "<template>\n  <a-row :gutter=\"[40, 20]\">\n    <a-col :span=\"12\">\n      <a-alert>This is an info alert.<\/a-alert>\n    <\/a-col>\n    <a-col :span=\"12\">\n      <a-alert type=\"success\">This is an success alert.<\/a-alert>\n    <\/a-col>\n    <a-col :span=\"12\">\n      <a-alert type=\"warning\">This is an warning alert.<\/a-alert>\n    <\/a-col>\n    <a-col :span=\"12\">\n      <a-alert type=\"error\">This is an error alert.<\/a-alert>\n    <\/a-col>\n    <a-col :span=\"12\">\n      <a-alert type=\"normal\">\n        <template #icon>\n          <icon-exclamation-circle-fill />\n        <\/template>\n        This is an normal alert.\n      <\/a-alert>\n    <\/a-col>\n  <\/a-row>\n<\/template>\n\n<script>\nimport { IconExclamationCircleFill } from '@sd-design/web-vue/es/icon';\n\nexport default {\n  components: { IconExclamationCircleFill }\n};\n<\/script>";
const typeTitle = "Type.Md";
const typeDescription = "警告提示有 `info`、`success`、`warning`、`error` 四种类型。2.41.0 版本新增 `normal` 类型，此类型下默认不展示图标。";
</script>

## 示例


<DemoBlock
  :title="actionTitle"
  :description="actionDescription"
  :code="actionSource"
>
  <actionDemo />
</DemoBlock>

<DemoBlock
  :title="bannerTitle"
  :description="bannerDescription"
  :code="bannerSource"
>
  <bannerDemo />
</DemoBlock>

<DemoBlock
  :title="basicTitle"
  :description="basicDescription"
  :code="basicSource"
>
  <basicDemo />
</DemoBlock>

<DemoBlock
  :title="closableTitle"
  :description="closableDescription"
  :code="closableSource"
>
  <closableDemo />
</DemoBlock>

<DemoBlock
  :title="closeElementTitle"
  :description="closeElementDescription"
  :code="closeElementSource"
>
  <closeElementDemo />
</DemoBlock>

<DemoBlock
  :title="iconTitle"
  :description="iconDescription"
  :code="iconSource"
>
  <iconDemo />
</DemoBlock>

<DemoBlock
  :title="titleTitle"
  :description="titleDescription"
  :code="titleSource"
>
  <titleDemo />
</DemoBlock>

<DemoBlock
  :title="typeTitle"
  :description="typeDescription"
  :code="typeSource"
>
  <typeDemo />
</DemoBlock>
