---
title: "scrollbar"
outline: "deep"
---

```yaml
meta:
  type: 组件
  category: 其他
title: 滚动条 Scrollbar
description: 用于替换浏览器默认滚动条样式。
```




### `<scrollbar>` Props

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|type|类型|`'track' \| 'embed'`|`'embed'`|
|outer-class|外层的类名|`string\|object\|array`|`-`|
|outer-style|外层的样式|`StyleValue`|`-`|
### `<scrollbar>` Events

|事件名|描述|参数|
|---|---|---|
|scroll|滚动时触发|-|
### `<scrollbar>` Methods

|方法名|描述|参数|返回值|版本|
|---|---|---|---|:---|
|scrollTo|滚动|options: `number \| {left?: number;top?: number}`<br>y: `number`|-||
|scrollTop|纵向滚动|top: `number`|-|2.40.0|
|scrollLeft|横向滚动|left: `number`|-|2.40.0|

<script setup lang="ts">
import basicDemo from '../../.vitepress/theme/generated/scrollbar/basic.vue';
const basicSource = "<template>\n  <a-scrollbar style=\"height:200px;overflow: auto;\">\n    <div style=\"height: 2000px;width: 2000px; background-color: var(--color-primary-light-4);\">Content<\/div>\n  <\/a-scrollbar>\n<\/template>";
const basicTitle = "Basic.Md";
const basicDescription = "滚动条组件基本用法。scrollbar 的默认插槽需要唯一的子元素。";
import typeDemo from '../../.vitepress/theme/generated/scrollbar/type.vue';
const typeSource = "<template>\n  <a-scrollbar type=\"track\" style=\"height:200px;overflow: auto;\">\n    <div style=\"height: 2000px;width: 2000px; background-color: var(--color-primary-light-4);\">Content<\/div>\n  <\/a-scrollbar>\n<\/template>\n\n<script>\nexport default {\n}\n<\/script>";
const typeTitle = "Type.Md";
const typeDescription = "设置 `type` 属性改变滚动条类型，`track` 类型会显示滚动条轨道。";
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
  :title="typeTitle"
  :description="typeDescription"
  :code="typeSource"
>
  <typeDemo />
</DemoBlock>
