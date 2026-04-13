---
title: "anchor"
outline: "deep"
---

```yaml
meta:
  type: 组件
  category: 其他
title: 锚点 Anchor
description: 通过锚点可快速找到信息内容在当前页面的位置。
```






## API


### `<anchor>` Props

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|boundary|滚动边界值，设置该值为数字后，将会在距离滚动容器 `boundary` 距离时停止滚动。|`'start' \| 'end' \| 'center' \| 'nearest' \| number`|`'start'`|
|line-less|是否显示左侧轴线|`boolean`|`false`|
|scroll-container|滚动容器|`string \| HTMLElement \| Window`|`-`|
|change-hash|是否改变hash。设置为 `false` 时点击锚点不会改变页面的 hash|`boolean`|`true`|
|smooth|是否使用平滑滚动|`boolean`|`true`|
### `<anchor>` Events

|事件名|描述|参数|
|---|---|---|
|select|用户点击链接时触发|hash: ` string \| undefined `<br>preHash: `string`|
|change|链接发生改变时触发|hash: `string`|




### `<anchor-link>` Props

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|title|锚点链接的文本内容|`string`|`-`|
|href|锚点链接的地址|`string`|`-`|

<script setup lang="ts">
import affixDemo from '../../.vitepress/theme/generated/anchor/affix.vue';
const affixSource = "<template>\n  <a-affix :offsetTop=\"80\">\n    <a-anchor :style=\"{backgroundColor: 'var(--color-bg-1)'}\">\n      <a-anchor-link href=\"#basic\">Basic<\/a-anchor-link>\n      <a-anchor-link href=\"#line-less\">LineLess Mode<\/a-anchor-link>\n      <a-anchor-link href=\"#affix\">\n        Affix\n        <template #sublist>\n          <a-anchor-link href=\"#boundary\">Scroll Boundary<\/a-anchor-link>\n          <a-anchor-link href=\"#hash\">Hash mode<\/a-anchor-link>\n        <\/template>\n      <\/a-anchor-link>\n    <\/a-anchor>\n  <\/a-affix>\n<\/template>";
const affixTitle = "Affix.Md";
const affixDescription = "使用 `affix` 组件可以让锚点固定在页面之内。";
import basicDemo from '../../.vitepress/theme/generated/anchor/basic.vue';
const basicSource = "<template>\n  <a-anchor>\n    <a-anchor-link href=\"#basic\">Basic<\/a-anchor-link>\n    <a-anchor-link href=\"#line-less\">LineLess Mode<\/a-anchor-link>\n    <a-anchor-link href=\"#affix\">\n      Affix\n      <template #sublist>\n        <a-anchor-link href=\"#boundary\">Scroll Boundary<\/a-anchor-link>\n        <a-anchor-link href=\"#hash\">Hash mode<\/a-anchor-link>\n      <\/template>\n    <\/a-anchor-link>\n  <\/a-anchor>\n<\/template>";
const basicTitle = "Basic.Md";
const basicDescription = "锚点的基础用法";
import boundaryDemo from '../../.vitepress/theme/generated/anchor/boundary.vue';
const boundarySource = "<template>\n  <a-anchor boundary=\"center\">\n    <a-anchor-link href=\"#basic\">Basic<\/a-anchor-link>\n    <a-anchor-link href=\"#line-less\">LineLess Mode<\/a-anchor-link>\n    <a-anchor-link href=\"#affix\">\n      Affix\n      <template #sublist>\n        <a-anchor-link href=\"#boundary\">Scroll Boundary<\/a-anchor-link>\n        <a-anchor-link href=\"#hash\">Hash mode<\/a-anchor-link>\n      <\/template>\n    <\/a-anchor-link>\n  <\/a-anchor>\n<\/template>";
const boundaryTitle = "Boundary.Md";
const boundaryDescription = "可以设置 `boundary` 来定制锚点滚动偏移量。";
import hashDemo from '../../.vitepress/theme/generated/anchor/hash.vue';
const hashSource = "<template>\n  <a-anchor :change-hash=\"false\">\n    <a-anchor-link href=\"#basic\">Basic<\/a-anchor-link>\n    <a-anchor-link href=\"#line-less\">LineLess Mode<\/a-anchor-link>\n    <a-anchor-link href=\"#affix\">\n      Affix\n      <template #sublist>\n        <a-anchor-link href=\"#boundary\">Scroll Boundary<\/a-anchor-link>\n        <a-anchor-link href=\"#hash\">Hash mode<\/a-anchor-link>\n      <\/template>\n    <\/a-anchor-link>\n  <\/a-anchor>\n<\/template>";
const hashTitle = "Hash.Md";
const hashDescription = "可以设置点击锚点而不改变浏览器历史。";
import lineLessDemo from '../../.vitepress/theme/generated/anchor/lineLess.vue';
const lineLessSource = "<template>\n  <a-anchor line-less>\n    <a-anchor-link href=\"#basic\">Basic<\/a-anchor-link>\n    <a-anchor-link href=\"#line-less\">LineLess Mode<\/a-anchor-link>\n    <a-anchor-link href=\"#affix\">\n      Affix\n      <template #sublist>\n        <a-anchor-link href=\"#boundary\">Scroll Boundary<\/a-anchor-link>\n        <a-anchor-link href=\"#hash\">Hash mode<\/a-anchor-link>\n      <\/template>\n    <\/a-anchor-link>\n  <\/a-anchor>\n<\/template>";
const lineLessTitle = "Line Less.Md";
const lineLessDescription = "设置 `line-less` 时，可以使用无左侧轴线的锚点样式。";
</script>

## 示例


<DemoBlock
  :title="affixTitle"
  :description="affixDescription"
  :code="affixSource"
>
  <affixDemo />
</DemoBlock>

<DemoBlock
  :title="basicTitle"
  :description="basicDescription"
  :code="basicSource"
>
  <basicDemo />
</DemoBlock>

<DemoBlock
  :title="boundaryTitle"
  :description="boundaryDescription"
  :code="boundarySource"
>
  <boundaryDemo />
</DemoBlock>

<DemoBlock
  :title="hashTitle"
  :description="hashDescription"
  :code="hashSource"
>
  <hashDemo />
</DemoBlock>

<DemoBlock
  :title="lineLessTitle"
  :description="lineLessDescription"
  :code="lineLessSource"
>
  <lineLessDemo />
</DemoBlock>
