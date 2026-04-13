---
title: 'empty'
outline: 'deep'
---

```yaml
meta:
  type: 组件
  category: 数据展示
title: 空状态 Empty
description: 指当前场景没有对应的数据内容，呈现出的一种状态。
```

## API

### `<empty>` Props

| 参数名             | 描述                         | 类型      | 默认值  | 版本   |
| ------------------ | ---------------------------- | --------- | :-----: | :----- |
| description        | 描述内容                     | `string`  |   `-`   |        |
| img-src            | 自定义图片的地址             | `string`  |   `-`   |        |
| in-config-provider | 是否在 ConfigProvider 中使用 | `boolean` | `false` | 2.47.0 |

### `<empty>` Slots

| 插槽名 |   描述    | 参数 |
| ------ | :-------: | ---- |
| image  | 图片/图标 | -    |

<script setup lang="ts">
import basicDemo from '../../.vitepress/theme/generated/empty/basic.vue';
const basicSource = "<template>\n  <a-empty />\n<\/template>";
const basicTitle = "Basic.Md";
const basicDescription = "空状态组件的基本用法。";
import customDemo from '../../.vitepress/theme/generated/empty/custom.vue';
const customSource = "<template>\n  <a-empty>\n    <template #image>\n      <icon-exclamation-circle-fill />\n    <\/template>\n    No data, please reload!\n  <\/a-empty>\n<\/template>\n\n<script>\nimport { IconExclamationCircleFill } from '@sdata/web-vue/es/icon';\n\nexport default {\n  components: {\n    IconExclamationCircleFill\n  },\n}\n<\/script>";
const customTitle = "Custom.Md";
const customDescription = "通过 `image` 插槽自定义图标、图片，或通过内容修改文案。";
</script>

## 示例

<DemoBlock :title="basicTitle" :description="basicDescription" :code="basicSource"

>   <basicDemo />
> </DemoBlock>

<DemoBlock :title="customTitle" :description="customDescription" :code="customSource"

>   <customDemo />
> </DemoBlock>
