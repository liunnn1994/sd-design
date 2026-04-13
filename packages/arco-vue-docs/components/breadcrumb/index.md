---
title: "breadcrumb"
outline: "deep"
---

```yaml
meta:
  type: 组件
  category: 导航
title: 面包屑 Breadcrumb
description: 面包屑是辅助导航模式，用于识别页面在层次结构内的位置，并根据需要向上返回。
```








## API


### `<breadcrumb>` Props

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|max-count|最多展示的面包屑数量（0表示不限制）|`number`|`0`||
|routes|设置路径|`BreadcrumbRoute[]`|`-`|2.36.0|
|separator|分隔符文字|`string\|number`|`-`|2.36.0|
|custom-url|自定义链接地址|`(paths: string[]) => string`|`-`|2.36.0|
### `<breadcrumb>` Slots

|插槽名|描述|参数|版本|
|---|:---:|---|:---|
|more-icon|自定义更多图标|-|2.36.0|
|item-render|routes 设置时生效，自定义渲染面包屑|route: `BreadcrumbRoute`<br>routes: `BreadcrumbRoute[]`<br>paths: `string[]`|2.36.0|
|separator|自定义分隔符|-||




### `<breadcrumb-item>` Props

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|separator|分隔符文字|`string\|number`|`-`|2.36.0|
|droplist|下拉菜单内容|`BreadcrumbRoute['children']`|`-`|2.36.0|
|dropdown-props|下拉菜单属性|`DropDownProps`|`-`|2.36.0|
### `<breadcrumb-item>` Slots

|插槽名|描述|参数|版本|
|---|:---:|---|:---|
|droplist|自定义下拉菜单|-|2.36.0|
|separator|自定义分隔符|-|2.36.0|




### BreadcrumbRoute

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|label|面包屑名称|`string`|`-`|
|path|跳转路径 (`a`标签的`href`)|`string`|`-`|
|children|下拉菜单展示项|`{    label: string;    path: string;  }[]`|`-`|



## Tips

同名的自定义插槽优先级是高于属性的

<script setup lang="ts">
import basicDemo from '../../.vitepress/theme/generated/breadcrumb/basic.vue';
const basicSource = "<template>\n  <a-breadcrumb>\n    <a-breadcrumb-item>Home<\/a-breadcrumb-item>\n    <a-breadcrumb-item>Channel<\/a-breadcrumb-item>\n    <a-breadcrumb-item>News<\/a-breadcrumb-item>\n  <\/a-breadcrumb>\n<\/template>";
const basicTitle = "Basic.Md";
const basicDescription = "面包屑的基本用法。";
import dropdownDemo from '../../.vitepress/theme/generated/breadcrumb/dropdown.vue';
const dropdownSource = "<template>\n  <a-space direction=\"vertical\">\n    <a-breadcrumb :routes=\"routes\"/>\n    <a-breadcrumb>\n      <a-breadcrumb-item>Home<\/a-breadcrumb-item>\n      <a-breadcrumb-item :droplist=\"droplist\">\n        Channel\n      <\/a-breadcrumb-item>\n      <a-breadcrumb-item>News<\/a-breadcrumb-item>\n    <\/a-breadcrumb>\n    <a-breadcrumb>\n      <a-breadcrumb-item>Home<\/a-breadcrumb-item>\n      <a-breadcrumb-item>\n        <template #droplist>\n          <a-doption>Option 1<\/a-doption>\n          <a-dsubmenu value=\"option-1\">\n            <template #default>Option 2<\/template>\n            <template #content>\n              <a-doption>Option 2-1<\/a-doption>\n              <a-doption>Option 2-2<\/a-doption>\n              <a-doption>Option 2-3<\/a-doption>\n            <\/template>\n            <template #footer>\n              <div style=\"padding: 6px; text-align: center;\">\n                <a-button>Click<\/a-button>\n              <\/div>\n            <\/template>\n          <\/a-dsubmenu>\n          <a-doption>Option 3<\/a-doption>\n        <\/template>\n        Channel\n      <\/a-breadcrumb-item>\n      <a-breadcrumb-item>News<\/a-breadcrumb-item>\n    <\/a-breadcrumb>\n  <\/a-space>\n<\/template>\n\n<script>\nexport default {\n  data() {\n    return {\n      routes: [\n        {\n          path: '/',\n          label: 'Home'\n        },\n        {\n          path: '/channel',\n          label: 'Channel',\n          children: [\n            {\n              path: '/users',\n              label: 'Users',\n            },\n            {\n              path: '/permission',\n              label: 'Permission',\n            }\n          ]\n        },\n        {\n          path: '/news',\n          label: 'News'\n        },\n      ],\n      droplist: [\n        {\n          path: '/goods',\n          label: 'Goods',\n        },\n        {\n          path: '/wallet',\n          label: 'Wallet',\n        }\n      ]\n    }\n  }\n}\n<\/script>";
const dropdownTitle = "Dropdown.Md";
const dropdownDescription = "通过 `droplist` 或者 `routes` 来指定下拉菜单。";
import ellipsisDemo from '../../.vitepress/theme/generated/breadcrumb/ellipsis.vue';
const ellipsisSource = "<template>\n  <a-space direction=\"vertical\">\n    <a-breadcrumb :max-count=\"3\">\n      <a-breadcrumb-item>Home<\/a-breadcrumb-item>\n      <a-breadcrumb-item>Sub Home<\/a-breadcrumb-item>\n      <a-breadcrumb-item>All Channel<\/a-breadcrumb-item>\n      <a-breadcrumb-item>Channel<\/a-breadcrumb-item>\n      <a-breadcrumb-item>News<\/a-breadcrumb-item>\n      <a-breadcrumb-item>Post<\/a-breadcrumb-item>\n    <\/a-breadcrumb>\n    <a-breadcrumb :max-count=\"3\">\n      <template #more-icon>\n        <a-tooltip content=\"more routes a/b/c\">\n          <icon-more />\n        <\/a-tooltip>\n      <\/template>\n      <a-breadcrumb-item>Home<\/a-breadcrumb-item>\n      <a-breadcrumb-item>Sub Home<\/a-breadcrumb-item>\n      <a-breadcrumb-item>All Channel<\/a-breadcrumb-item>\n      <a-breadcrumb-item>Channel<\/a-breadcrumb-item>\n      <a-breadcrumb-item>News<\/a-breadcrumb-item>\n      <a-breadcrumb-item>Post<\/a-breadcrumb-item>\n    <\/a-breadcrumb>\n  <\/a-space>\n<\/template>";
const ellipsisTitle = "Ellipsis.Md";
const ellipsisDescription = "通过 `max-count` 来指定面包屑的最多渲染数量，超出的部分将显示为省略号。";
import iconDemo from '../../.vitepress/theme/generated/breadcrumb/icon.vue';
const iconSource = "<template>\n  <a-space direction=\"vertical\">\n    <a-breadcrumb>\n      <a-breadcrumb-item>\n        <icon-home/>\n      <\/a-breadcrumb-item>\n      <a-breadcrumb-item>Channel<\/a-breadcrumb-item>\n      <a-breadcrumb-item>News<\/a-breadcrumb-item>\n    <\/a-breadcrumb>\n     <a-breadcrumb>\n      <a-breadcrumb-item>\n        <icon-home/>\n      <\/a-breadcrumb-item>\n      <a-breadcrumb-item>\n        <icon-at />\n        Channel\n      <\/a-breadcrumb-item>\n      <a-breadcrumb-item>News<\/a-breadcrumb-item>\n    <\/a-breadcrumb>\n  <\/a-space>\n<\/template>";
const iconTitle = "Icon.Md";
const iconDescription = "可以在内容中使用自定义图标。";
import routesDemo from '../../.vitepress/theme/generated/breadcrumb/routes.vue';
const routesSource = "<template>\n  <a-space direction=\"vertical\">\n    <a-breadcrumb :routes=\"routes\"/>\n    <a-breadcrumb :routes=\"routes\">\n      <template #item-render=\"{route, paths}\">\n        <a-link :href=\"paths.join('/')\">\n          {{route.label}}\n        <\/a-link>\n      <\/template>\n    <\/a-breadcrumb>\n  <\/a-space>\n<\/template>\n\n<script>\nexport default {\n  data() {\n    return {\n      routes: [\n        {\n          path: '/',\n          label: 'Home'\n        },\n        {\n          path: '/channel',\n          label: 'Channel',\n        },\n        {\n          path: '/news',\n          label: 'News'\n        },\n      ],\n    }\n  }\n}\n<\/script>";
const routesTitle = "Routes.Md";
const routesDescription = "通过 `routes` 来传递面包屑数据。若是要自定义面包屑的话，建议使用 `<a-breadcrumb-item />` 组件。默认使用 `a` 标签的 `href` 属性绑定路径，可通过 `item` 插槽自定义渲染。";
import separatorDemo from '../../.vitepress/theme/generated/breadcrumb/separator.vue';
const separatorSource = "<template>\n  <a-space direction=\"vertical\">\n    <a-breadcrumb>\n      <template #separator>\n        <icon-right />\n      <\/template>\n      <a-breadcrumb-item>Home<\/a-breadcrumb-item>\n      <a-breadcrumb-item>Channel<\/a-breadcrumb-item>\n      <a-breadcrumb-item>News<\/a-breadcrumb-item>\n    <\/a-breadcrumb>\n    <a-breadcrumb separator=\"~\">\n      <a-breadcrumb-item>Home<\/a-breadcrumb-item>\n      <a-breadcrumb-item>Channel<\/a-breadcrumb-item>\n      <a-breadcrumb-item>News<\/a-breadcrumb-item>\n    <\/a-breadcrumb>\n    <a-breadcrumb>\n      <template #separator>\n        <icon-right />\n      <\/template>\n      <a-breadcrumb-item separator=\"->\">Home<\/a-breadcrumb-item>\n      <a-breadcrumb-item>Channel<\/a-breadcrumb-item>\n      <a-breadcrumb-item>News<\/a-breadcrumb-item>\n    <\/a-breadcrumb>\n  <\/a-space>\n<\/template>";
const separatorTitle = "Separator.Md";
const separatorDescription = "通过 `separator` 属性或插槽自定义分隔符。面包屑子项也可通过 `separator` 属性或插槽自定义分隔符，且优先级高于父项。";
import sizeDemo from '../../.vitepress/theme/generated/breadcrumb/size.vue';
const sizeSource = "<template>\n  <a-space direction=\"vertical\">\n    <a-breadcrumb>\n      <a-breadcrumb-item>Home<\/a-breadcrumb-item>\n      <a-breadcrumb-item>Channel<\/a-breadcrumb-item>\n      <a-breadcrumb-item>News<\/a-breadcrumb-item>\n    <\/a-breadcrumb>\n    <a-breadcrumb :style=\"{fontSize: `12px`}\">\n      <a-breadcrumb-item>Home<\/a-breadcrumb-item>\n      <a-breadcrumb-item>Channel<\/a-breadcrumb-item>\n      <a-breadcrumb-item>News<\/a-breadcrumb-item>\n    <\/a-breadcrumb>\n  <\/a-space>\n<\/template>";
const sizeTitle = "Size.Md";
const sizeDescription = "通过指定样式来自定义面包屑的尺寸。";
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
  :title="dropdownTitle"
  :description="dropdownDescription"
  :code="dropdownSource"
>
  <dropdownDemo />
</DemoBlock>

<DemoBlock
  :title="ellipsisTitle"
  :description="ellipsisDescription"
  :code="ellipsisSource"
>
  <ellipsisDemo />
</DemoBlock>

<DemoBlock
  :title="iconTitle"
  :description="iconDescription"
  :code="iconSource"
>
  <iconDemo />
</DemoBlock>

<DemoBlock
  :title="routesTitle"
  :description="routesDescription"
  :code="routesSource"
>
  <routesDemo />
</DemoBlock>

<DemoBlock
  :title="separatorTitle"
  :description="separatorDescription"
  :code="separatorSource"
>
  <separatorDemo />
</DemoBlock>

<DemoBlock
  :title="sizeTitle"
  :description="sizeDescription"
  :code="sizeSource"
>
  <sizeDemo />
</DemoBlock>
