---
title: "page-header"
outline: "deep"
---

```yaml
meta:
  type: 组件
  category: 导航
title: 页头 PageHeader
description: 页头位于页容器顶部，起到了内容概览和引导页级操作的作用。包括面包屑、标题等内容。
```





## API


### `<page-header>` Props

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|title|页头的主标题|`string`|`-`|
|subtitle|页头的次标题|`string`|`-`|
|show-back|是否显示返回按钮|`boolean`|`true`|
### `<page-header>` Events

|事件名|描述|参数|
|---|---|---|
|back|点击返回按钮时触发|event: `Event`|
### `<page-header>` Slots

|插槽名|描述|参数|版本|
|---|:---:|---|:---|
|breadcrumb|面包屑|-||
|back-icon|返回按钮|-|2.36.0|
|title|主标题|-||
|subtitle|次标题|-||
|extra|额外的展示内容|-||

<script setup lang="ts">
import basicDemo from '../../.vitepress/theme/generated/page-header/basic.vue';
const basicSource = "<template>\n  <div :style=\"{ background: 'var(--color-fill-2)', padding: '28px' }\" >\n    <a-page-header\n      :style=\"{ background: 'var(--color-bg-2)' }\"\n      title=\"ArcoDesign\"\n      subtitle=\"ArcoDesign Vue 2.0\"\n    >\n      <template #extra>\n        <a-radio-group type=\"button\" default-value=\"large\">\n          <a-radio value=\"mini\">Mini<\/a-radio>\n          <a-radio value=\"small\">Small<\/a-radio>\n          <a-radio value=\"large\">Large<\/a-radio>\n        <\/a-radio-group>\n      <\/template>\n    <\/a-page-header>\n  <\/div>\n<\/template>";
const basicTitle = "Basic.Md";
const basicDescription = "基础页头，适合使用在需要简单描述的场景。默认是没有底色的。";
import breadcrumbDemo from '../../.vitepress/theme/generated/page-header/breadcrumb.vue';
const breadcrumbSource = "<template>\n  <div :style=\"{ background: 'var(--color-fill-2)', padding: '28px' }\" >\n    <a-page-header\n      :style=\"{ background: 'var(--color-bg-2)' }\"\n      title=\"ArcoDesign\"\n      subtitle=\"ArcoDesign Vue 2.0\"\n      :show-back=\"false\"\n    >\n      <template #breadcrumb>\n        <a-breadcrumb>\n          <a-breadcrumb-item>Home<\/a-breadcrumb-item>\n          <a-breadcrumb-item>Channel<\/a-breadcrumb-item>\n          <a-breadcrumb-item>News<\/a-breadcrumb-item>\n        <\/a-breadcrumb>\n      <\/template>\n      <template #extra>\n        <a-radio-group type=\"button\" default-value=\"large\">\n          <a-radio value=\"mini\">Mini<\/a-radio>\n          <a-radio value=\"small\">Small<\/a-radio>\n          <a-radio value=\"large\">Large<\/a-radio>\n        <\/a-radio-group>\n      <\/template>\n    <\/a-page-header>\n  <\/div>\n<\/template>";
const breadcrumbTitle = "Breadcrumb.Md";
const breadcrumbDescription = "在页头中展示面包屑。";
import contentDemo from '../../.vitepress/theme/generated/page-header/content.vue';
const contentSource = "<template>\n  <div :style=\"{ background: 'var(--color-fill-2)', padding: '28px' }\" >\n    <a-page-header\n      :style=\"{ background: 'var(--color-bg-2)' }\"\n      title=\"ArcoDesign\"\n    >\n      <template #breadcrumb>\n        <a-breadcrumb>\n          <a-breadcrumb-item>Home<\/a-breadcrumb-item>\n          <a-breadcrumb-item>Channel<\/a-breadcrumb-item>\n          <a-breadcrumb-item>News<\/a-breadcrumb-item>\n        <\/a-breadcrumb>\n      <\/template>\n      <template #subtitle>\n        <a-space>\n          <span>ArcoDesign Vue 2.0<\/span>\n          <a-tag color=\"red\" size=\"small\">Default<\/a-tag>\n        <\/a-space>\n      <\/template>\n      <template #extra>\n        <a-space>\n          <a-button>Cancel<\/a-button>\n          <a-button type=\"primary\">Save<\/a-button>\n        <\/a-space>\n      <\/template>\n      <p>\n        For other uses, see Design\n      <\/p>\n      <p>\n        A design is a plan or specification for the construction of an object or system or for the\n        implementation of an activity or process, or the result of that plan or specification in the\n        form of a prototype, product or process. The verb to design expresses the process of\n        developing a design. In some cases, the direct construction of an object without an explicit\n        prior plan (such as in craftwork, some engineering, coding, and graphic design) may also be\n        considered to be a design activity. The design usually has to satisfy certain goals and\n        constraints, may take into account aesthetic, functional, economic, or socio-political\n        considerations, and is expected to interact with a certain environment. Major examples of\n        designs include architectural blueprints,engineering drawings, business processes, circuit\n        diagrams, and sewing patterns.Major examples of designs include architectural\n        blueprints,engineering drawings, business processes, circuit diagrams, and sewing patterns.\n      <\/p>\n    <\/a-page-header>\n  <\/div>\n<\/template>\n\n<script>\nexport default {\n}\n<\/script>";
const contentTitle = "Content.Md";
const contentDescription = "页头的完整示例。";
import transparentDemo from '../../.vitepress/theme/generated/page-header/transparent.vue';
const transparentSource = "<template>\n  <div :style=\"{\n    backgroundImage: 'radial-gradient(var(--color-fill-3) 1px, rgba(0, 0, 0, 0) 1px)',\n    backgroundSize: '16px 16px',\n    padding: '28px',\n  }\">\n    <a-page-header title=\"ArcoDesign\" subtitle=\"ArcoDesign Vue 2.0\">\n      <template #breadcrumb>\n        <a-breadcrumb>\n          <a-breadcrumb-item>Home<\/a-breadcrumb-item>\n          <a-breadcrumb-item>Channel<\/a-breadcrumb-item>\n          <a-breadcrumb-item>News<\/a-breadcrumb-item>\n        <\/a-breadcrumb>\n      <\/template>\n      <template #extra>\n        <a-radio-group type=\"button\">\n          <a-radio value=\"mini\">Mini<\/a-radio>\n          <a-radio value=\"small\">Small<\/a-radio>\n          <a-radio value=\"large\">Large<\/a-radio>\n        <\/a-radio-group>\n      <\/template>\n    <\/a-page-header>\n  <\/div>\n<\/template>";
const transparentTitle = "Transparent.Md";
const transparentDescription = "默认是没有底色的，如果有需要可以通过`style`或类名设置不同底色。";
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
  :title="breadcrumbTitle"
  :description="breadcrumbDescription"
  :code="breadcrumbSource"
>
  <breadcrumbDemo />
</DemoBlock>

<DemoBlock
  :title="contentTitle"
  :description="contentDescription"
  :code="contentSource"
>
  <contentDemo />
</DemoBlock>

<DemoBlock
  :title="transparentTitle"
  :description="transparentDescription"
  :code="transparentSource"
>
  <transparentDemo />
</DemoBlock>
