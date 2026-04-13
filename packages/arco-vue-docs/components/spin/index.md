---
title: "spin"
outline: "deep"
---

```yaml
meta:
  type: 组件
  category: 反馈
title: 加载中 Spin
description: 用于页面和区块的加载中状态 - 页面局部处于等待异步数据或正在渲染过程时，合适的加载动效会有效缓解用户的焦虑。
```







## API


### `<spin>` Props

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|size|尺寸|`number`|`-`|
|loading|是否为加载中状态（仅在容器模式下生效）|`boolean`|`false`|
|dot|是否使用点类型的动画|`boolean`|`false`|
|tip|提示内容|`string`|`-`|
|hide-icon|是否隐藏图标|`boolean`|`false`|
### `<spin>` Slots

|插槽名|描述|参数|
|---|:---:|---|
|tip|自定义提示内容|-|
|element|自定义元素|-|
|icon|自定义图标（自动旋转）|-|

<script setup lang="ts">
import basicDemo from '../../.vitepress/theme/generated/spin/basic.vue';
const basicSource = "<template>\n  <a-spin />\n<\/template>";
const basicTitle = "Basic.Md";
const basicDescription = "用于展示加载中的状态。";
import containerDemo from '../../.vitepress/theme/generated/spin/container.vue';
const containerSource = "<template>\n  <a-spin :loading=\"loading\" tip=\"This may take a while...\">\n    <a-card title=\"Arco Card\">\n      ByteDance's core product, Toutiao ('Headlines'), is a content platform in China and around\n      the world. Toutiao started out as a news recommendation engine and gradually evolved into\n      a platform delivering content in various formats.\n    <\/a-card>\n  <\/a-spin>\n<\/template>\n\n<script>\nexport default {\n  data() {\n    return {\n      loading: true\n    }\n  }\n}\n<\/script>";
const containerTitle = "Container.Md";
const containerDescription = "可以给任意内容添加加载中指示符。";
import dotDemo from '../../.vitepress/theme/generated/spin/dot.vue';
const dotSource = "<template>\n  <a-spin dot />\n<\/template>";
const dotTitle = "Dot.Md";
const dotDescription = "通过 `dot` 属性，可以展示点类型的指示符。";
import iconDemo from '../../.vitepress/theme/generated/spin/icon.vue';
const iconSource = "<template>\n  <a-spin>\n    <template #icon>\n      <icon-sync />\n    <\/template>\n  <\/a-spin>\n<\/template>\n\n<script>\nimport { IconSync } from '@arco-design/web-vue/es/icon';\n\nexport default {\n  components: { IconSync }\n};\n<\/script>";
const iconTitle = "Icon.Md";
const iconDescription = "通过 `#icon` 插槽可以自定义图标。";
import sizeDemo from '../../.vitepress/theme/generated/spin/size.vue';
const sizeSource = "<template>\n  <a-space size=\"large\">\n    <a-spin />\n    <a-spin :size=\"28\"/>\n    <a-spin :size=\"32\"/>\n  <\/a-space>\n<\/template>";
const sizeTitle = "Size.Md";
const sizeDescription = "设置 `size` 可以得到不同尺寸的加载图标。";
import tipDemo from '../../.vitepress/theme/generated/spin/tip.vue';
const tipSource = "<template>\n  <a-spin tip=\"This may take a while...\"/>\n<\/template>";
const tipTitle = "Tip.Md";
const tipDescription = "通过 `tip` 属性添加描述文案。";
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
  :title="containerTitle"
  :description="containerDescription"
  :code="containerSource"
>
  <containerDemo />
</DemoBlock>

<DemoBlock
  :title="dotTitle"
  :description="dotDescription"
  :code="dotSource"
>
  <dotDemo />
</DemoBlock>

<DemoBlock
  :title="iconTitle"
  :description="iconDescription"
  :code="iconSource"
>
  <iconDemo />
</DemoBlock>

<DemoBlock
  :title="sizeTitle"
  :description="sizeDescription"
  :code="sizeSource"
>
  <sizeDemo />
</DemoBlock>

<DemoBlock
  :title="tipTitle"
  :description="tipDescription"
  :code="tipSource"
>
  <tipDemo />
</DemoBlock>
