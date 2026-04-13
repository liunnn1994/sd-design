---
title: "space"
outline: "deep"
---

```yaml
meta:
  type: 组件
  category: 布局
title: 间距 Space
description: 设置组件之间的间距
```







## API


### `<space>` Props

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|align|对齐方式|`'start' \| 'end' \| 'center' \| 'baseline'`|`-`||
|direction|间距方向|`'vertical' \| 'horizontal'`|`'horizontal'`||
|size|间距大小，支持分别制定横向和竖向的间距|`number \| 'mini' \| 'small' \| 'medium' \| 'large' \| [SpaceSize, SpaceSize]`|`'small'`||
|wrap|环绕类型的间距，用于折行的场景。|`boolean`|`false`||
|fill|充满整行|`boolean`|`false`|2.11.0|
### `<space>` Slots

|插槽名|描述|参数|
|---|:---:|---|
|split|设置分隔符|-|



## Type
```ts
type SpaceSize = number | 'mini' | 'small' | 'medium' | 'large';
```

<script setup lang="ts">
import alignDemo from '../../.vitepress/theme/generated/space/align.vue';
const alignSource = "<template>\n  <div>\n    <div style=\"marginBottom: 20px\">\n      <a-radio-group v-model=\"align\" type='button'>\n        <a-radio value=\"start\">start<\/a-radio>\n        <a-radio value=\"center\">center<\/a-radio>\n        <a-radio value=\"end\">end<\/a-radio>\n        <a-radio value=\"baseline\">baseline<\/a-radio>\n      <\/a-radio-group>\n    <\/div>\n    <a-space :align=\"align\" style=\"backgroundColor: var(--color-fill-2);padding: 10px;\">\n      <a-typography-text>Space:<\/a-typography-text>\n      <a-button type=\"primary\">Item2<\/a-button>\n      <a-card title='Card'>\n        Card content\n      <\/a-card>\n    <\/a-space>\n  <\/div>\n<\/template>\n<script>\nexport default {\n  data() {\n    return {\n      align: 'center',\n    }\n  }\n};\n<\/script>";
const alignTitle = "Align.Md";
const alignDescription = "内置 4 种对齐方式，分别为 `start` `center` `end` `baseline`，在水平模式下默认为 `center`。";
import basicDemo from '../../.vitepress/theme/generated/space/basic.vue';
const basicSource = "<template>\n  <a-space>\n    <a-typography-text>Space:<\/a-typography-text>\n    <a-tag v-if=\"false\" color='sdblue'>Tag<\/a-tag>\n    <a-button type=\"primary\">Item1<\/a-button>\n    <a-button type=\"primary\">Item2<\/a-button>\n    <a-switch defaultChecked />\n  <\/a-space>\n<\/template>";
const basicTitle = "Basic.Md";
const basicDescription = "间距组件的基本用法。";
import sizeDemo from '../../.vitepress/theme/generated/space/size.vue';
const sizeSource = "<template>\n  <div>\n    <div style=\"marginBottom: 20px\">\n      <a-radio-group v-model=\"size\" type='button'>\n        <a-radio value=\"mini\">mini<\/a-radio>\n        <a-radio value=\"small\">small<\/a-radio>\n        <a-radio value=\"medium\">medium<\/a-radio>\n        <a-radio value=\"large\">large<\/a-radio>\n      <\/a-radio-group>\n    <\/div>\n    <a-space :size=\"size\">\n      <a-button type=\"primary\">Item1<\/a-button>\n      <a-button type=\"primary\">Item2<\/a-button>\n      <a-button type=\"primary\">Item3<\/a-button>\n    <\/a-space>\n  <\/div>\n<\/template>\n<script>\nexport default {\n  data() {\n    return {\n      size: 'medium',\n    }\n  }\n};\n<\/script>";
const sizeTitle = "Size.Md";
const sizeDescription = "内置 4 个尺寸，`mini - 4px` `small - 8px (默认)` `medium - 16px` `large - 24px`，也支持传数字来自定义尺寸。";
import splitDemo from '../../.vitepress/theme/generated/space/split.vue';
const splitSource = "<template>\n  <a-space>\n    <template #split>\n      <a-divider direction=\"vertical\" :margin=\"0\" />\n    <\/template>\n    <a-button type=\"primary\">Item1<\/a-button>\n    <a-tag v-if=\"show\" color='sdblue'>Tag<\/a-tag>\n    <a-button type=\"primary\">Item2<\/a-button>\n    <a-button type=\"primary\">Item3<\/a-button>\n    <a-switch v-model=\"show\"/>\n  <\/a-space>\n  <a-divider />\n  <a-space>\n    <template #split>\n      <a-divider direction=\"vertical\" :margin=\"0\" />\n    <\/template>\n    <a-link type=\"primary\">Link1<\/a-link>\n    <a-link type=\"primary\">Link2<\/a-link>\n    <a-link type=\"primary\">Link3<\/a-link>\n  <\/a-space>\n<\/template>\n\n<script setup>\nimport { ref } from 'vue'\n\nconst show = ref(false)\n<\/script>";
const splitTitle = "Split.Md";
const splitDescription = "为相邻子元素设置分隔符。";
import verticalDemo from '../../.vitepress/theme/generated/space/vertical.vue';
const verticalSource = "<template>\n  <a-space direction=\"vertical\" fill>\n    <a-button type=\"primary\" long>Item1<\/a-button>\n    <a-button type=\"primary\" long>Item2<\/a-button>\n    <a-button type=\"primary\" long>Item3<\/a-button>\n  <\/a-space>\n<\/template>";
const verticalTitle = "Vertical.Md";
const verticalDescription = "可以设置垂直方向排列的间距。";
import wrapDemo from '../../.vitepress/theme/generated/space/wrap.vue';
const wrapSource = "<template>\n  <a-space wrap>\n    <a-button type=\"primary\">Item1<\/a-button>\n    <a-button type=\"primary\">Item2<\/a-button>\n    <a-button type=\"primary\">Item3<\/a-button>\n    <a-button type=\"primary\">Item4<\/a-button>\n    <a-button type=\"primary\">Item5<\/a-button>\n    <a-button type=\"primary\">Item6<\/a-button>\n    <a-button type=\"primary\">Item7<\/a-button>\n    <a-button type=\"primary\">Item8<\/a-button>\n    <a-button type=\"primary\">Item9<\/a-button>\n    <a-button type=\"primary\">Item10<\/a-button>\n    <a-button type=\"primary\">Item11<\/a-button>\n    <a-button type=\"primary\">Item12<\/a-button>\n    <a-button type=\"primary\">Item13<\/a-button>\n    <a-button type=\"primary\">Item14<\/a-button>\n    <a-button type=\"primary\">Item15<\/a-button>\n    <a-button type=\"primary\">Item16<\/a-button>\n    <a-button type=\"primary\">Item17<\/a-button>\n    <a-button type=\"primary\">Item18<\/a-button>\n    <a-button type=\"primary\">Item19<\/a-button>\n    <a-button type=\"primary\">Item20<\/a-button>\n  <\/a-space>\n<\/template>";
const wrapTitle = "Wrap.Md";
const wrapDescription = "环绕类型的间距，四周都有间距，一般用于换行的场景。";
</script>

## 示例


<DemoBlock
  :title="alignTitle"
  :description="alignDescription"
  :code="alignSource"
>
  <alignDemo />
</DemoBlock>

<DemoBlock
  :title="basicTitle"
  :description="basicDescription"
  :code="basicSource"
>
  <basicDemo />
</DemoBlock>

<DemoBlock
  :title="sizeTitle"
  :description="sizeDescription"
  :code="sizeSource"
>
  <sizeDemo />
</DemoBlock>

<DemoBlock
  :title="splitTitle"
  :description="splitDescription"
  :code="splitSource"
>
  <splitDemo />
</DemoBlock>

<DemoBlock
  :title="verticalTitle"
  :description="verticalDescription"
  :code="verticalSource"
>
  <verticalDemo />
</DemoBlock>

<DemoBlock
  :title="wrapTitle"
  :description="wrapDescription"
  :code="wrapSource"
>
  <wrapDemo />
</DemoBlock>
