---
title: 'pagination'
outline: 'deep'
---

```yaml
meta:
  type: 组件
  category: 导航
title: 分页 Pagination
description: 采用分页控制单页内的信息数量，也可进行页面跳转。
```

## API

### `<pagination>` Props

| 参数名 | 描述 | 类型 | 默认值 | 版本 |
| --- | --- | --- | :-: | :-- |
| total **(必填)** | 数据总数 | `number` | `-` |  |
| current **(v-model)** | 当前的页数 | `number` | `-` |  |
| default-current | 默认的页数（非受控状态） | `number` | `1` |  |
| page-size **(v-model)** | 每页展示的数据条数 | `number` | `-` |  |
| default-page-size | 默认每页展示的数据条数（非受控状态） | `number` | `10` |  |
| disabled | 是否禁用 | `boolean` | `false` |  |
| hide-on-single-page | 单页时是否隐藏分页 | `boolean` | `false` |  |
| simple | 是否为简单模式 | `boolean` | `false` |  |
| show-total | 是否显示数据总数 | `boolean` | `false` |  |
| show-more | 是否显示更多按钮 | `boolean` | `false` |  |
| show-jumper | 是否显示跳转 | `boolean` | `false` |  |
| show-page-size | 是否显示数据条数选择器 | `boolean` | `false` |  |
| page-size-options | 数据条数选择器的选项列表 | `number[]` | `[10, 20, 30, 40, 50]` |  |
| page-size-props | 数据条数选择器的Props | `SelectProps` | `-` |  |
| size | 分页选择器的大小 | `'mini' \| 'small' \| 'medium' \| 'large'` | `'medium'` |  |
| page-item-style | 分页按钮的样式 | `CSSProperties` | `-` |  |
| active-page-item-style | 当前分页按钮的样式 | `CSSProperties` | `-` |  |
| base-size | 计算显示省略的基础个数。显示省略的个数为 `baseSize + 2 * bufferSize` | `number` | `6` |  |
| buffer-size | 显示省略号时，当前页码左右显示的页码个数 | `number` | `2` |  |
| auto-adjust | 是否在改变数据条数时调整页码 | `boolean` | `true` | 2.34.0 |

### `<pagination>` Events

| 事件名           | 描述               | 参数               |
| ---------------- | ------------------ | ------------------ |
| change           | 页码改变时触发     | current: `number`  |
| page-size-change | 数据条数改变时触发 | pageSize: `number` |

### `<pagination>` Slots

| 插槽名 | 描述 | 参数 | 版本 |
| --- | :-: | --- | :-- |
| total | 总数 | total: `number` | 2.9.0 |
| page-item-ellipsis | 分页按钮（省略） | - | 2.9.0 |
| page-item-step | 分页按钮（步） | type: `'previous'\|'next'`The type of page item step | 2.9.0 |
| page-item | 分页按钮 | page: `number`The page number of the paging button | 2.9.0 |

<script setup lang="ts">
import allDemo from '../../.vitepress/theme/generated/pagination/all.vue';
const allSource = "<template>\n  <a-pagination :total=\"50\" show-total show-jumper show-page-size/>\n<\/template>";
const allTitle = "All.Md";
const allDescription = "展示全部配置项。";
import basicDemo from '../../.vitepress/theme/generated/pagination/basic.vue';
const basicSource = "<template>\n  <a-pagination :total=\"50\"/>\n<\/template>";
const basicTitle = "Basic.Md";
const basicDescription = "分页的基本用法，`total` 属性为必填项。";
import customDemo from '../../.vitepress/theme/generated/pagination/custom.vue';
const customSource = "<template>\n  <a-pagination :total=\"200\">\n    <template #page-item=\"{ page }\">\n      - {{page}} -\n    <\/template>\n    <template #page-item-step=\"{ type }\">\n      <icon-send :style=\"type==='previous' ? {transform:`rotate(180deg)`} : undefined\" />\n    <\/template>\n    <template #page-item-ellipsis>\n      <icon-sun-fill />\n    <\/template>\n  <\/a-pagination>\n<\/template>";
const customTitle = "Custom.Md";
const customDescription = "可以通过插槽自定义分页按钮内容";
import ellipsisDemo from '../../.vitepress/theme/generated/pagination/ellipsis.vue';
const ellipsisSource = "<template>\n  <a-pagination :total=\"200\"/>\n<\/template>";
const ellipsisTitle = "Ellipsis.Md";
const ellipsisDescription = "当页码较大时，会使用更多页码的分页样式。";
import jumperDemo from '../../.vitepress/theme/generated/pagination/jumper.vue';
const jumperSource = "<template>\n  <a-pagination :total=\"50\" show-jumper/>\n<\/template>";
const jumperTitle = "Jumper.Md";
const jumperDescription = "通过设置 `show-jumper`，显示页码跳转输入框。";
import pageSizeDemo from '../../.vitepress/theme/generated/pagination/pageSize.vue';
const pageSizeSource = "<template>\n  <a-pagination :total=\"200\" show-page-size/>\n<\/template>";
const pageSizeTitle = "Page Size.Md";
const pageSizeDescription = "通过设置 `show-page-size`， 展示每页条数选择器。";
import simpleDemo from '../../.vitepress/theme/generated/pagination/simple.vue';
const simpleSource = "<template>\n  <a-pagination :total=\"200\" simple/>\n<\/template>";
const simpleTitle = "Simple.Md";
const simpleDescription = "通过设置 `simple` 属性开启简洁模式。";
import sizeDemo from '../../.vitepress/theme/generated/pagination/size.vue';
const sizeSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\">\n    <a-radio-group type=\"button\" v-model=\"size\">\n      <a-radio value=\"mini\">Mini<\/a-radio>\n      <a-radio value=\"small\">Small<\/a-radio>\n      <a-radio value=\"medium\">Medium<\/a-radio>\n      <a-radio value=\"large\">Large<\/a-radio>\n    <\/a-radio-group>\n    <a-pagination :total=\"50\" :size=\"size\" show-total show-jumper show-page-size />\n  <\/a-space>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const size = ref('medium');\n\n    return {\n      size\n    }\n  },\n}\n<\/script>";
const sizeTitle = "Size.Md";
const sizeDescription = "分页分为 `mini`、`small`、`medium`、`large` 四种尺寸。";
import totalDemo from '../../.vitepress/theme/generated/pagination/total.vue';
const totalSource = "<template>\n  <a-pagination :total=\"200\" show-total/>\n<\/template>";
const totalTitle = "Total.Md";
const totalDescription = "通过设置 `show-total` 属性显示数据总数。";
</script>

## 示例

<DemoBlock :title="allTitle" :description="allDescription" :code="allSource"

>   <allDemo />
> </DemoBlock>

<DemoBlock :title="basicTitle" :description="basicDescription" :code="basicSource"

>   <basicDemo />
> </DemoBlock>

<DemoBlock :title="customTitle" :description="customDescription" :code="customSource"

>   <customDemo />
> </DemoBlock>

<DemoBlock :title="ellipsisTitle" :description="ellipsisDescription" :code="ellipsisSource"

>   <ellipsisDemo />
> </DemoBlock>

<DemoBlock :title="jumperTitle" :description="jumperDescription" :code="jumperSource"

>   <jumperDemo />
> </DemoBlock>

<DemoBlock :title="pageSizeTitle" :description="pageSizeDescription" :code="pageSizeSource"

>   <pageSizeDemo />
> </DemoBlock>

<DemoBlock :title="simpleTitle" :description="simpleDescription" :code="simpleSource"

>   <simpleDemo />
> </DemoBlock>

<DemoBlock :title="sizeTitle" :description="sizeDescription" :code="sizeSource"

>   <sizeDemo />
> </DemoBlock>

<DemoBlock :title="totalTitle" :description="totalDescription" :code="totalSource"

>   <totalDemo />
> </DemoBlock>
