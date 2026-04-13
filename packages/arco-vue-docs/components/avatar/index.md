---
title: "avatar"
outline: "deep"
---

```yaml
meta:
  type: 组件
  category: 数据展示
title: 头像 Avatar
description: 用作头像显示，可以为图片、图标或字符形式展示。
```


@import ./\_\_demo\_\_/basic.md

@import ./\_\_demo\_\_/size.md

@import ./\_\_demo\_\_/group.md

@import ./\_\_demo\_\_/icon.md

@import ./\_\_demo\_\_/fit.md

@import ./\_\_demo\_\_/image-url.md

## API


### `<avatar>` Props

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|shape|头像的形状，有圆形(circle)和正方形(square)两种|`'circle' \| 'square'`|`'circle'`||
|image-url|自定义头像图片地址，如果传入该属性，会默认渲染img标签|`string`|`-`|2.40.0|
|size|头像的尺寸大小，单位是 `px`。未填写时使用样式中的大小 `40px`|`number`|`-`||
|auto-fix-font-size|是否自动根据头像尺寸调整字体大小|`boolean`|`true`||
|trigger-type|可点击的头像交互类型|`'mask' \| 'button'`|`'button'`||
|trigger-icon-style|交互图标的样式|`CSSProperties`|`-`||
|object-fit|图片在容器内的的适应类型|`ObjectFit`|`-`|2.52.0|
### `<avatar>` Events

|事件名|描述|参数|
|---|---|---|
|click|点击回调|ev: `MouseEvent`|
|error|图片加载错误|-|
|load|图片加载成功|-|
### `<avatar>` Slots

|插槽名|描述|参数|
|---|:---:|---|
|trigger-icon|可点击的头像交互图标|-|




### `<avatar-group>` Props

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|shape|头像的形状，有圆形(circle)和正方形(square)两种|`'circle' \| 'square'`|`'circle'`||
|size|头像的尺寸大小，单位是 `px`|`number`|`-`||
|auto-fix-font-size|是否自动根据头像尺寸调整字体大小|`boolean`|`true`||
|max-count|头像组最多显示的头像数量，多余头像将以 `+x` 的形式展示。|`number`|`0`||
|z-index-ascend|头像组内的头像 `z-index` 递增，默认是递减。|`boolean`|`false`||
|max-style|多余头像样式。|`CSSProperties`|`-`|2.7.0|
|max-popover-trigger-props|多余头像气泡的 `TriggerProps`|`TriggerProps`|`-`|2.7.0|

<script setup lang="ts">
import basicDemo from '../../.vitepress/theme/generated/avatar/basic.vue';
const basicSource = "<template>\n  <a-space size=\"large\">\n    <a-avatar>A<\/a-avatar>\n    <a-avatar :style=\"{ backgroundColor: '#3370ff' }\">\n      <IconUser />\n    <\/a-avatar>\n    <a-avatar :style=\"{ backgroundColor: '#14a9f8' }\">Arco<\/a-avatar>\n    <a-avatar :style=\"{ backgroundColor: '#00d0b6' }\">Design<\/a-avatar>\n    <a-avatar>\n      <img\n        alt=\"avatar\"\n        src=\"https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/3ee5f13fb09879ecb5185e440cef6eb9.png~tplv-uwbnlip3yd-webp.webp\"\n      />\n    <\/a-avatar>\n  <\/a-space>\n<\/template>\n\n<script>\nimport { IconUser } from '@arco-design/web-vue/es/icon';\n\nexport default {\n  components: { IconUser },\n};\n<\/script>";
const basicTitle = "Basic.Md";
const basicDescription = "头像的基础使用。如果头像是文字的话，会自动调节字体大小，来适应头像框。";
import fitDemo from '../../.vitepress/theme/generated/avatar/fit.vue';
const fitSource = "<template>\n  <a-avatar\n    :style=\"{\n      marginRight: '24px',\n      verticalAlign: 'middle',\n      backgroundColor: '#14a9f8',\n    }\"\n  >\n    {{ text }}\n  <\/a-avatar>\n  <a-button\n    type=\"secondary\"\n    @click=\"onClick\"\n    :style=\"{ verticalAlign: 'middle' }\"\n  >\n    Change\n  <\/a-button>\n<\/template>\n\n<script>\nimport { computed, ref } from 'vue';\n\nconst list = ['B', 'Arco', 'Design', 'Tom', 'AD'];\nexport default {\n  setup() {\n    const index = ref(0);\n    const text = computed(() => list[index.value])\n\n    const onClick = () => {\n      index.value = index.value >= list.length - 1 ? 0 : index.value + 1;\n    };\n\n    return {\n      text,\n      onClick\n    }\n  },\n};\n<\/script>";
const fitTitle = "Fit.Md";
const fitDescription = "如果头像是文字的话，会自动调节字体大小，来适应头像框。";
import groupDemo from '../../.vitepress/theme/generated/avatar/group.vue';
const groupSource = "<template>\n  <a-space :size=\"32\">\n    <a-avatar-group>\n      <a-avatar :style=\"{ backgroundColor: '#7BC616' }\">A<\/a-avatar>\n      <a-avatar :style=\"{ backgroundColor: '#14C9C9' }\">B<\/a-avatar>\n      <a-avatar :style=\"{ backgroundColor: '#168CFF' }\">C<\/a-avatar>\n      <a-avatar :style=\"{ backgroundColor: '#FF7D00' }\">Arco<\/a-avatar>\n      <a-avatar :style=\"{ backgroundColor: '#FFC72E' }\">Design<\/a-avatar>\n    <\/a-avatar-group>\n\n    <a-avatar-group :size=\"24\">\n      <a-avatar :style=\"{ backgroundColor: '#7BC616' }\">A<\/a-avatar>\n      <a-avatar :style=\"{ backgroundColor: '#14C9C9' }\">B<\/a-avatar>\n      <a-avatar :style=\"{ backgroundColor: '#168CFF' }\">C<\/a-avatar>\n      <a-avatar :style=\"{ backgroundColor: '#FF7D00' }\">Arco<\/a-avatar>\n      <a-avatar :style=\"{ backgroundColor: '#FFC72E' }\">Design<\/a-avatar>\n    <\/a-avatar-group>\n\n    <a-avatar-group :size=\"24\" :max-count=\"3\">\n      <a-avatar :style=\"{ backgroundColor: '#7BC616' }\">A<\/a-avatar>\n      <a-avatar :style=\"{ backgroundColor: '#14C9C9' }\">B<\/a-avatar>\n      <a-avatar :style=\"{ backgroundColor: '#168CFF' }\">C<\/a-avatar>\n      <a-avatar :style=\"{ backgroundColor: '#FF7D00' }\">Arco<\/a-avatar>\n      <a-avatar :style=\"{ backgroundColor: '#FFC72E' }\">Design<\/a-avatar>\n    <\/a-avatar-group>\n  <\/a-space>\n<\/template>";
const groupTitle = "Group.Md";
const groupDescription = "使用 `Avatar.Group` 可以使用头像组功能，可通过 `size` 指定头像的大小。";
import iconDemo from '../../.vitepress/theme/generated/avatar/icon.vue';
const iconSource = "<template>\n  <a-space size=\"large\">\n    <a-avatar\n      :trigger-icon-style=\"{ color: '#3491FA' }\"\n      :auto-fix-font-size=\"false\"\n      @click=\"toast\"\n      :style=\"{ backgroundColor: '#168CFF' }\"\n    >\n      A\n      <template #trigger-icon>\n        <IconCamera />\n      <\/template>\n    <\/a-avatar>\n    <a-avatar @click=\"toast\" :style=\"{ backgroundColor: '#14C9C9' }\">\n      <IconUser />\n      <template #trigger-icon>\n        <IconEdit />\n      <\/template>\n    <\/a-avatar>\n    <a-avatar\n      @click=\"toast\"\n      shape=\"square\"\n      :style=\"{ backgroundColor: '#FFC72E' }\"\n    >\n      <IconUser />\n      <template #trigger-icon>\n        <IconEdit />\n      <\/template>\n    <\/a-avatar>\n    <a-avatar trigger-type=\"mask\">\n      <img\n        alt=\"avatar\"\n        src=\"https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/3ee5f13fb09879ecb5185e440cef6eb9.png~tplv-uwbnlip3yd-webp.webp\"\n      />\n      <template #trigger-icon>\n        <IconEdit />\n      <\/template>\n    <\/a-avatar>\n  <\/a-space>\n<\/template>\n\n<script>\nimport { IconCamera, IconEdit, IconUser } from '@arco-design/web-vue/es/icon';\n\nexport default {\n  components: { IconCamera, IconEdit },\n  methods: {\n    toast() {\n      this.$message.info('Uploading...');\n    },\n  },\n};\n<\/script>";
const iconTitle = "Icon.Md";
const iconDescription = "可以通过 `trigger-icon` `trigger-type` 来定制交互按钮，类型有 `mask (遮罩)` 和 `button (按钮)` 两种。";
import imageUrlDemo from '../../.vitepress/theme/generated/avatar/imageUrl.vue';
const imageUrlSource = "<template>\n  <a-space size=\"large\">\n    <a-avatar\n      imageUrl=\"https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/3ee5f13fb09879ecb5185e440cef6eb9.png~tplv-uwbnlip3yd-webp.webp\"\n    >\n    <\/a-avatar>\n    加载失败:\n    <a-avatar\n      imageUrl=\"https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/3ee5f13fb09879ecb5185e440cef6eb9123.png~tplv-uwbnlip3yd-webp.webp\"\n    >\n    <\/a-avatar>\n  <\/a-space>\n<\/template>";
const imageUrlTitle = "Image Url.Md";
const imageUrlDescription = "自定义头像图片路径";
import sizeDemo from '../../.vitepress/theme/generated/avatar/size.vue';
const sizeSource = "<template>\n  <a-space size=\"large\" direction=\"vertical\">\n    <a-space size=\"large\">\n      <a-avatar :size=\"64\">Arco<\/a-avatar>\n      <a-avatar :size=\"40\">Arco<\/a-avatar>\n      <a-avatar :size=\"32\">Arco<\/a-avatar>\n      <a-avatar :size=\"24\">Arco<\/a-avatar>\n    <\/a-space>\n    <a-space size=\"large\">\n      <a-avatar :size=\"64\" shape=\"square\">Arco<\/a-avatar>\n      <a-avatar :size=\"40\" shape=\"square\">Arco<\/a-avatar>\n      <a-avatar :size=\"32\" shape=\"square\">Arco<\/a-avatar>\n      <a-avatar :size=\"24\" shape=\"square\">Arco<\/a-avatar>\n    <\/a-space>\n  <\/a-space>\n<\/template>";
const sizeTitle = "Size.Md";
const sizeDescription = "通过设置 `size` 字段，可以调节头像的大小，默认大小为 `40px`。设置 `shape` 字段，可以设置头像是圆形 (circle) 还是正方形 (square)。";
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
  :title="fitTitle"
  :description="fitDescription"
  :code="fitSource"
>
  <fitDemo />
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
  :title="imageUrlTitle"
  :description="imageUrlDescription"
  :code="imageUrlSource"
>
  <imageUrlDemo />
</DemoBlock>

<DemoBlock
  :title="sizeTitle"
  :description="sizeDescription"
  :code="sizeSource"
>
  <sizeDemo />
</DemoBlock>
