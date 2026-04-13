---
title: "badge"
outline: "deep"
---

```yaml
meta:
  type: 组件
  category: 数据展示
title: 徽标数 Badge
description: 一般出现在图标或文字的右上角。提供及时、重要的信息提示。
```








## API


### `<badge>` Props

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|text|自定义提示内容|`string`|`-`|
|dot|显示为小红点|`boolean`|`false`|
|dot-style|徽标的样式|`object`|`-`|
|max-count|徽标最大显示数值，如果count超过这个数值会显示为maxCount|`number`|`99`|
|offset|设置徽标位置的偏移|`number[]`|`[]`|
|color|内置的一些颜色|`ColorType \| string`|`-`|
|status|徽标的状态类型|`'normal' \| 'processing' \| 'success' \| 'warning' \| 'danger'`|`-`|
|count|徽标显示的数字|`number`|`-`|

<script setup lang="ts">
import aloneDemo from '../../.vitepress/theme/generated/badge/alone.vue';
const aloneSource = "<template>\n  <a-space :size=\"40\">\n    <a-badge :count=\"2\" />\n    <a-badge\n      :count=\"2\"\n      :dotStyle=\"{ background: '#E5E6EB', color: '#86909C' }\"\n    />\n    <a-badge :count=\"16\" />\n    <a-badge :count=\"1000\" :max-count=\"99\" />\n  <\/a-space>\n<\/template>";
const aloneTitle = "Alone.Md";
const aloneDescription = "`default slot` 为空时，将会独立展示徽标。";
import basicDemo from '../../.vitepress/theme/generated/badge/basic.vue';
const basicSource = "<template>\n  <a-space :size=\"40\">\n    <a-badge :count=\"9\">\n      <a-avatar shape=\"square\" />\n    <\/a-badge>\n    <a-badge :count=\"9\" dot :dotStyle=\"{ width: '10px', height: '10px' }\">\n      <a-avatar shape=\"square\" />\n    <\/a-badge>\n    <a-badge :dotStyle=\"{ height: '16px', width: '16px', fontSize: '14px' }\">\n      <template #content>\n        <IconClockCircle\n          :style=\"{ verticalAlign: 'middle', color: 'var(--color-text-2)' }\"\n        />\n      <\/template>\n      <a-avatar shape=\"square\" />\n    <\/a-badge>\n  <\/a-space>\n<\/template>\n\n<script>\nimport { IconClockCircle } from '@sd-design/web-vue/es/icon';\n\nexport default {\n  components: { IconClockCircle },\n};\n<\/script>";
const basicTitle = "Basic.Md";
const basicDescription = "基本用法。只需指定 `count`或者 `content slot`，即可显示徽标。";
import colorDemo from '../../.vitepress/theme/generated/badge/color.vue';
const colorSource = "<template>\n  <div>\n    <a-badge\n      v-for=\"color in colors\"\n      :key=\"color\"\n      :color=\"color\"\n      :text=\"color\"\n      :style=\"{ marginRight: '24px' }\"\n    />\n  <\/div>\n  <br />\n  <div>\n    <a-badge\n      v-for=\"color in customColors\"\n      :key=\"color\"\n      :color=\"color\"\n      :text=\"color\"\n      :style=\"{ marginRight: '24px' }\"\n    />\n  <\/div>\n<\/template>\n\n<script>\nconst COLORS = [\n  'red',\n  'orangered',\n  'orange',\n  'gold',\n  'lime',\n  'green',\n  'cyan',\n  'sdblue',\n  'purple',\n  'pinkpurple',\n  'magenta',\n  'gray',\n];\n\nconst COLORS_CUSTOM = [\n  '#F53F3F',\n  '#7816FF',\n  '#00B42A',\n  '#165DFF',\n  '#FF7D00',\n  '#EB0AA4',\n  '#7BC616',\n  '#86909C',\n  '#B71DE8',\n  '#0FC6C2',\n  '#FFB400',\n  '#168CFF',\n  '#FF5722',\n];\nexport default {\n  data() {\n    return {\n      colors: COLORS,\n      customColors: COLORS_CUSTOM,\n    };\n  },\n};\n<\/script>";
const colorTitle = "Color.Md";
const colorDescription = "我们提供多种预设色彩的徽标样式。如果预设值不能满足你的需求，`color` 字段也可以设置自定义色值。";
import dotDemo from '../../.vitepress/theme/generated/badge/dot.vue';
const dotSource = "<template>\n  <a-space :size=\"40\">\n    <a-badge :count=\"9\" dot :offset=\"[6, -2]\">\n      <a href=\"#\">Link<\/a>\n    <\/a-badge>\n    <a-badge :count=\"9\" dot :offset=\"[2, -2]\">\n      <IconNotification\n        :style=\"{ color: '#888', fontSize: '18px', verticalAlign: '-3px' }\"\n      />\n    <\/a-badge>\n  <\/a-space>\n<\/template>\n\n<script>\nimport { IconNotification } from '@sd-design/web-vue/es/icon';\n\nexport default {\n  components: { IconNotification },\n};\n<\/script>";
const dotTitle = "Dot.Md";
const dotDescription = "设置 `dot`，即可只显示小红点而不显示数字。`count > 0` 时才显示。";
import maxDemo from '../../.vitepress/theme/generated/badge/max.vue';
const maxSource = "<template>\n  <a-space :size=\"40\">\n    <a-badge :max-count=\"10\" :count=\"0\">\n      <a-avatar shape=\"square\">\n        <span>\n          <IconUser />\n        <\/span>\n      <\/a-avatar>\n    <\/a-badge>\n    <a-badge :max-count=\"10\" :count=\"100\">\n      <a-avatar shape=\"square\">\n        <span>\n          <IconUser />\n        <\/span>\n      <\/a-avatar>\n    <\/a-badge>\n    <a-badge :count=\"100\">\n      <a-avatar shape=\"square\">\n        <span>\n          <IconUser />\n        <\/span>\n      <\/a-avatar>\n    <\/a-badge>\n    <a-badge :max-count=\"999\" :count=\"1000\">\n      <a-avatar shape=\"square\">\n        <span>\n          <IconUser />\n        <\/span>\n      <\/a-avatar>\n    <\/a-badge>\n  <\/a-space>\n<\/template>\n\n<script>\nimport { IconUser } from '@sd-design/web-vue/es/icon';\n\nexport default {\n  components: { IconUser },\n};\n<\/script>";
const maxTitle = "Max.Md";
const maxDescription = "设置 `max-count`，可以限制最大显示的徽标数值，超过将会加 `+` 后缀。`max-count` 默认为 `99`。";
import statusDemo from '../../.vitepress/theme/generated/badge/status.vue';
const statusSource = "<template>\n  <a-space size=\"large\" direction=\"vertical\">\n    <a-space size=\"large\">\n      <a-badge status=\"normal\" />\n      <a-badge status=\"processing\" />\n      <a-badge status=\"success\" />\n      <a-badge status=\"warning\" />\n      <a-badge status=\"danger\" />\n    <\/a-space>\n    <a-space size=\"large\">\n      <a-badge status=\"normal\" text=\"Normal\" />\n      <a-badge status=\"processing\" text=\"Processing\" />\n      <a-badge status=\"success\" text=\"Success\" />\n      <a-badge status=\"warning\" text=\"Warning\" />\n      <a-badge status=\"danger\" text=\"Danger\" />\n    <\/a-space>\n  <\/a-space>\n<\/template>";
const statusTitle = "Status.Md";
const statusDescription = "设置 `status`，可以得到不同的状态点。`normal - 正常` `processing - 进行中` `success - 成功` `warning - 提醒` `danger - 危险`。";
import textDemo from '../../.vitepress/theme/generated/badge/text.vue';
const textSource = "<template>\n  <a-space :size=\"40\">\n    <a-badge text=\"NEW\">\n      <a-avatar shape=\"square\">\n        <span>\n          <IconUser />\n        <\/span>\n      <\/a-avatar>\n    <\/a-badge>\n    <a-badge text=\"HOT\">\n      <a-avatar shape=\"square\">\n        <span>\n          <IconUser />\n        <\/span>\n      <\/a-avatar>\n    <\/a-badge>\n  <\/a-space>\n<\/template>\n\n<script>\nimport { IconUser } from '@sd-design/web-vue/es/icon';\n\nexport default {\n  components: { IconUser },\n};\n<\/script>";
const textTitle = "Text.Md";
const textDescription = "设置 `text`，可设置自定义提示内容。";
</script>

## 示例


<DemoBlock
  :title="aloneTitle"
  :description="aloneDescription"
  :code="aloneSource"
>
  <aloneDemo />
</DemoBlock>

<DemoBlock
  :title="basicTitle"
  :description="basicDescription"
  :code="basicSource"
>
  <basicDemo />
</DemoBlock>

<DemoBlock
  :title="colorTitle"
  :description="colorDescription"
  :code="colorSource"
>
  <colorDemo />
</DemoBlock>

<DemoBlock
  :title="dotTitle"
  :description="dotDescription"
  :code="dotSource"
>
  <dotDemo />
</DemoBlock>

<DemoBlock
  :title="maxTitle"
  :description="maxDescription"
  :code="maxSource"
>
  <maxDemo />
</DemoBlock>

<DemoBlock
  :title="statusTitle"
  :description="statusDescription"
  :code="statusSource"
>
  <statusDemo />
</DemoBlock>

<DemoBlock
  :title="textTitle"
  :description="textDescription"
  :code="textSource"
>
  <textDemo />
</DemoBlock>
