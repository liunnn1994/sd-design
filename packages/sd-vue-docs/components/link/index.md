---
title: "link"
outline: "deep"
---

```yaml
meta:
  type: 组件
  category: 通用
title: 链接 Link
description: 链接的基本样式。
```






## API



### `<link>` Props

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|href|链接地址|`string`|`-`||
|status|链接的状态|`'normal' \| 'warning' \| 'success' \| 'danger'`|`'normal'`||
|hoverable|鼠标悬浮时存在底色|`boolean`|`true`|2.7.0|
|icon|图标|`boolean`|`false`|2.7.0|
|loading|链接是否为加载中状态|`boolean`|`false`|2.37.0|
|disabled|链接是否禁用|`boolean`|`false`||
### `<link>` Events

|事件名|描述|参数|
|---|---|---|
|click|点击时触发|ev: `MouseEvent`|

<script setup lang="ts">
import basicDemo from '../../.vitepress/theme/generated/link/basic.vue';
const basicSource = "<template>\n  <a-space>\n    <a-link href=\"link\">Link<\/a-link>\n    <a-link href=\"link\" disabled>Link<\/a-link>\n  <\/a-space>\n<\/template>";
const basicTitle = "Basic.Md";
const basicDescription = "链接的基本用法。";
import hoverableDemo from '../../.vitepress/theme/generated/link/hoverable.vue';
const hoverableSource = "<template>\n  <a-space>\n    <a-link href=\"link\" :hoverable=\"false\">Link<\/a-link>\n    <a-link href=\"link\" status=\"danger\" :hoverable=\"false\">Link<\/a-link>\n  <\/a-space>\n<\/template>";
const hoverableTitle = "Hoverable.Md";
const hoverableDescription = "可以通过 hoverable 属性设置是否在悬浮状态时隐藏底色。";
import iconDemo from '../../.vitepress/theme/generated/link/icon.vue';
const iconSource = "<template>\n  <div>\n    <a-space>\n      <a-link href=\"link\" icon>Link<\/a-link>\n      <a-link href=\"link\" disabled icon>Link<\/a-link>\n    <\/a-space>\n  <\/div>\n  <div>\n    <a-space>\n      <a-link href=\"link\">\n        <template #icon>\n          <icon-edit />\n        <\/template>\n        Link\n      <\/a-link>\n      <a-link href=\"link\" disabled>\n        <template #icon>\n          <icon-edit />\n        <\/template>\n        Link\n      <\/a-link>\n    <\/a-space>\n  <\/div>\n<\/template>\n\n<script>\n  import { IconEdit } from '@sd-design/web-vue/es/icon';\n\n  export default {\n    components: { IconEdit }\n  };\n<\/script>";
const iconTitle = "Icon.Md";
const iconDescription = "通过 `icon` 设置带图标的链接，设置为 `true` 时候显示默认图标。";
import loadingDemo from '../../.vitepress/theme/generated/link/loading.vue';
const loadingSource = "<template>\n  <a-space>\n    <a-link loading>Link<\/a-link>\n    <a-link :loading=\"loading1\" @click=\"handleClick1\">Link<\/a-link>\n    <a-link :loading=\"loading2\" @click=\"handleClick2\">\n      <template #icon>\n        <icon-edit />\n      <\/template>\n      Link\n    <\/a-link>\n  <\/a-space>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\nimport { IconEdit } from '@sd-design/web-vue/es/icon';\n\nexport default {\n  components: {\n    IconEdit,\n  },\n  setup() {\n    const loading1 = ref(false);\n    const loading2 = ref(false);\n\n    const handleClick1 = () => {\n      loading1.value = true;\n      setTimeout(() => {\n        loading1.value = false;\n      }, 3000);\n    }\n    const handleClick2 = () => {\n      loading2.value = true;\n      setTimeout(() => {\n        loading2.value = false;\n      }, 3000);\n    }\n\n    return {\n      loading1,\n      loading2,\n      handleClick1,\n      handleClick2,\n    };\n  }\n}\n<\/script>";
const loadingTitle = "Loading.Md";
const loadingDescription = "通过设置 `loading` 可以让链接处于加载中状态。处于加载中状态的链接不会触发点击事件。";
import statusDemo from '../../.vitepress/theme/generated/link/status.vue';
const statusSource = "<template>\n  <a-space direction=\"vertical\">\n    <a-space>\n      <a-link href=\"link\">Normal Link<\/a-link>\n      <a-link href=\"link\" disabled>Normal Link<\/a-link>\n    <\/a-space>\n    <a-space>\n      <a-link href=\"link\" status=\"success\">Success Link<\/a-link>\n      <a-link href=\"link\" status=\"success\" disabled>Success Link<\/a-link>\n    <\/a-space>\n    <a-space>\n      <a-link href=\"link\" status=\"warning\">Warning Link<\/a-link>\n      <a-link href=\"link\" status=\"warning\" disabled>Warning Link<\/a-link>\n    <\/a-space>\n    <a-space>\n      <a-link href=\"link\" status=\"danger\">Danger Link<\/a-link>\n      <a-link href=\"link\" status=\"danger\" disabled>Danger Link<\/a-link>\n    <\/a-space>\n  <\/a-space>\n<\/template>";
const statusTitle = "Status.Md";
const statusDescription = "链接的状态分为 `normal` - **正常（默认）**、`success` - **成功**、`warning` - **警告**、`danger` - **危险**四种。";
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
  :title="hoverableTitle"
  :description="hoverableDescription"
  :code="hoverableSource"
>
  <hoverableDemo />
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
  :title="statusTitle"
  :description="statusDescription"
  :code="statusSource"
>
  <statusDemo />
</DemoBlock>
