---
title: "list"
outline: "deep"
---

```yaml
meta:
  type: 组件
  category: 数据展示
title: 列表 List
description: 最基础的列表展示，可承载文字、列表、图片、段落，常用于后台数据展示页面。
```










## API


### `<list>` Props

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|data|列表数据，需要和 `item` 插槽同时使用|`any[]`|`-`||
|size|列表大小|`'small' \| 'medium' \| 'large'`|`'medium'`||
|bordered|是否显示边框|`boolean`|`true`||
|split|是否显示分割线|`boolean`|`true`||
|loading|是否为加载中状态|`boolean`|`false`||
|hoverable|是否显示选中样式|`boolean`|`false`||
|pagination-props|列表分页配置|`PaginationProps`|`-`||
|grid-props|列表栅格配置|`object`|`-`||
|max-height|列表的最大高度|`string \| number`|`0`||
|bottom-offset|触发到达底部的距离阈值|`number`|`0`||
|virtual-list-props|传递虚拟列表属性，传入此参数以开启虚拟滚动 [VirtualListProps](#VirtualListProps)|`VirtualListProps`|`-`||
|scrollbar|是否开启虚拟滚动条|`boolean \| ScrollbarProps`|`true`|2.38.0|
### `<list>` Events

|事件名|描述|参数|
|---|---|---|
|scroll|列表滚动时触发|-|
|reach-bottom|当列表到达底部时触发|-|
|page-change|表格分页发生改变时触发|page: `number`|
|page-size-change|表格每页数据数量发生改变时触发|pageSize: `number`|
### `<list>` Methods

|方法名|描述|参数|返回值|
|---|---|---|---|
|scrollIntoView|虚拟滚动到某个元素|options: `{ index?: number; key?: number \| string; align: 'auto' \| 'top' \| 'bottom'}`|-|
### `<list>` Slots

|插槽名|描述|参数|版本|
|---|:---:|---|:---|
|scroll-loading|滚动加载状态时，滚动到底部的提示|-|2.20.0|
|item|列表项|index: `number`<br>item: `any`||
|empty|空白展示|-||
|footer|底部信息|-||
|header|头部信息|-||




### `<list-item>` Props

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|action-layout|操作组排列方向|`Direction`|`'horizontal'`|
### `<list-item>` Slots

|插槽名|描述|参数|
|---|:---:|---|
|meta|meta信息|-|
|extra|额外内容|-|
|actions|操作组|-|




### `<list-item-meta>` Props

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|title|标题|`string`|`-`|
|description|描述内容|`string`|`-`|
### `<list-item-meta>` Slots

|插槽名|描述|参数|
|---|:---:|---|
|avatar|头像|-|
|title|标题|-|
|description|描述内容|-|




### VirtualListProps

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|height|可视区域高度|`number \| string`|`-`||
|threshold|开启虚拟滚动的元素数量阈值，当数据数量小于阈值时不会开启虚拟滚动。|`number`|`-`||
|isStaticItemHeight|（已废除）元素高度是否是固定的。2.34.1 版本废除，请使用 `fixedSize`|`boolean`|`false`||
|fixedSize|元素高度是否是固定的。|`boolean`|`false`|2.34.1|
|estimatedSize|元素高度不固定时的预估高度。|`number`|`-`|2.34.1|
|buffer|视口边界外提前挂载的元素数量。|`number`|`10`|2.34.1|

<script setup lang="ts">
import actionsLayoutDemo from '../../.vitepress/theme/generated/list/actionsLayout.vue';
const actionsLayoutSource = "<template>\n  <a-list\n    class=\"list-demo-action-layout\"\n    :bordered=\"false\"\n    :data=\"dataSource\"\n    :pagination-props=\"paginationProps\"\n  >\n    <template #item=\"{ item }\">\n      <a-list-item class=\"list-demo-item\" action-layout=\"vertical\">\n        <template #actions>\n          <span><icon-heart />83<\/span>\n          <span><icon-star />{{ item.index }}<\/span>\n          <span><icon-message />Reply<\/span>\n        <\/template>\n        <template #extra>\n          <div className=\"image-area\">\n            <img alt=\"sd-design\" :src=\"item.imageSrc\" />\n          <\/div>\n        <\/template>\n        <a-list-item-meta\n          :title=\"item.title\"\n          :description=\"item.description\"\n        >\n          <template #avatar>\n            <a-avatar shape=\"square\">\n              <img alt=\"avatar\" :src=\"item.avatar\" />\n            <\/a-avatar>\n          <\/template>\n        <\/a-list-item-meta>\n      <\/a-list-item>\n    <\/template>\n  <\/a-list>\n<\/template>\n\n<script>\nimport { reactive } from 'vue'\n\nconst names = ['Socrates', 'Balzac', 'Plato'];\nconst avatarSrc = [\n  '//p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/a8c8cdb109cb051163646151a4a5083b.png~tplv-uwbnlip3yd-webp.webp',\n  '//p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/e278888093bef8910e829486fb45dd69.png~tplv-uwbnlip3yd-webp.webp',\n  '//p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/9eeb1800d9b78349b24682c3518ac4a3.png~tplv-uwbnlip3yd-webp.webp',\n];\nconst imageSrc = [\n  '//p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/29c1f9d7d17c503c5d7bf4e538cb7c4f.png~tplv-uwbnlip3yd-webp.webp',\n  '//p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/04d7bc31dd67dcdf380bc3f6aa07599f.png~tplv-uwbnlip3yd-webp.webp',\n  '//p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/1f61854a849a076318ed527c8fca1bbf.png~tplv-uwbnlip3yd-webp.webp',\n];\nconst dataSource = new Array(15).fill(null).map((_, index) => {\n  return {\n    index: index,\n    avatar: avatarSrc[index % avatarSrc.length],\n    title: names[index % names.length],\n    description:\n      'Beijing ByteDance Technology Co., Ltd. is an enterprise located in China. ByteDance has products such as TikTok, Toutiao, volcano video and Douyin (the Chinese version of TikTok).',\n    imageSrc: imageSrc[index % imageSrc.length],\n  };\n});\n\nexport default {\n  setup() {\n    return {\n      dataSource,\n      paginationProps: reactive({\n        defaultPageSize: 3,\n        total: dataSource.length\n      })\n    }\n  },\n}\n<\/script>\n\n<style scoped>\n.list-demo-action-layout .image-area {\n  width: 183px;\n  height: 119px;\n  border-radius: 2px;\n  overflow: hidden;\n}\n\n.list-demo-action-layout .list-demo-item {\n  padding: 20px 0;\n  border-bottom: 1px solid var(--color-fill-3);\n}\n\n.list-demo-action-layout .image-area img {\n  width: 100%;\n}\n\n.list-demo-action-layout .sd-list-item-action .sd-icon {\n  margin: 0 4px;\n}\n<\/style>";
const actionsLayoutTitle = "Actions Layout.Md";
const actionsLayoutDescription = "这是一个包括分页、右侧内容、下方列表操作的示例。";
import actionsDemo from '../../.vitepress/theme/generated/list/actions.vue';
const actionsSource = "<template>\n  <a-list>\n    <a-list-item v-for=\"idx in 4\" :key=\"idx\">\n      <a-list-item-meta\n        title=\"Beijing Bytedance Technology Co., Ltd.\"\n        description=\"Beijing ByteDance Technology Co., Ltd. is an enterprise located in China.\"\n      >\n        <template #avatar>\n          <a-avatar shape=\"square\">\n            <img\n              alt=\"avatar\"\n              src=\"https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/3ee5f13fb09879ecb5185e440cef6eb9.png~tplv-uwbnlip3yd-webp.webp\"\n            />\n          <\/a-avatar>\n        <\/template>\n      <\/a-list-item-meta>\n      <template #actions>\n        <icon-edit />\n        <icon-delete />\n      <\/template>\n    <\/a-list-item>\n  <\/a-list>\n<\/template>";
const actionsTitle = "Actions.Md";
const actionsDescription = "通过 `actions` 来为列表添加操作项。";
import basicDemo from '../../.vitepress/theme/generated/list/basic.vue';
const basicSource = "<template>\n  <a-list>\n    <template #header>\n      List title\n    <\/template>\n    <a-list-item>Beijing Bytedance Technology Co., Ltd.<\/a-list-item>\n    <a-list-item>Bytedance Technology Co., Ltd.<\/a-list-item>\n    <a-list-item>Beijing Toutiao Technology Co., Ltd.<\/a-list-item>\n    <a-list-item>Beijing Volcengine Technology Co., Ltd.<\/a-list-item>\n    <a-list-item>China Beijing Bytedance Technology Co., Ltd.<\/a-list-item>\n  <\/a-list>\n<\/template>";
const basicTitle = "Basic.Md";
const basicDescription = "列表的基本使用方法。可用于承载文字、列表、图片和段落。";
import gridDemo from '../../.vitepress/theme/generated/list/grid.vue';
const gridSource = "<template>\n  <a-list :gridProps=\"{ gutter: 0, span: 6 }\" :bordered=\"false\">\n    <a-list-item>\n      <a-list>\n        <template #header>Platform<\/template>\n        <a-list-item>iOS<\/a-list-item>\n        <a-list-item>Android<\/a-list-item>\n        <a-list-item>Web<\/a-list-item>\n      <\/a-list>\n    <\/a-list-item>\n    <a-list-item>\n      <a-list>\n        <template #header>Framework<\/template>\n        <a-list-item>Angular<\/a-list-item>\n        <a-list-item>Vue<\/a-list-item>\n        <a-list-item>React<\/a-list-item>\n      <\/a-list>\n    <\/a-list-item>\n    <a-list-item>\n      <a-list>\n        <template #header>Language<\/template>\n        <a-list-item>C++<\/a-list-item>\n        <a-list-item>JavaScript<\/a-list-item>\n        <a-list-item>Python<\/a-list-item>\n      <\/a-list>\n    <\/a-list-item>\n    <a-list-item>\n      <a-list>\n        <template #header>Component<\/template>\n        <a-list-item>Button<\/a-list-item>\n        <a-list-item>Breadcrumb<\/a-list-item>\n        <a-list-item>Transfer<\/a-list-item>\n      <\/a-list>\n    <\/a-list-item>\n  <\/a-list>\n<\/template>";
const gridTitle = "Grid.Md";
const gridDescription = "通过 `grid` 属性来配置格栅列表。";
import metaDemo from '../../.vitepress/theme/generated/list/meta.vue';
const metaSource = "<template>\n  <a-list>\n    <a-list-item v-for=\"idx in 4\" :key=\"idx\">\n      <a-list-item-meta\n        title=\"Beijing Bytedance Technology Co., Ltd.\"\n        description=\"Beijing ByteDance Technology Co., Ltd. is an enterprise located in China.\"\n      >\n        <template #avatar>\n          <a-avatar shape=\"square\">\n            <img\n              alt=\"avatar\"\n              src=\"https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/3ee5f13fb09879ecb5185e440cef6eb9.png~tplv-uwbnlip3yd-webp.webp\"\n            />\n          <\/a-avatar>\n        <\/template>\n      <\/a-list-item-meta>\n    <\/a-list-item>\n  <\/a-list>\n<\/template>";
const metaTitle = "Meta.Md";
const metaDescription = "使用 `list-item-meta` 组件可快速指定头像、标题、文字。";
import responsiveGridDemo from '../../.vitepress/theme/generated/list/responsiveGrid.vue';
const responsiveGridSource = "<template>\n  <a-list\n    :grid-props=\"{ gutter: [20, 20], sm: 24, md: 12, lg: 8, xl: 6 }\"\n    :data=\"dataSource\"\n    :bordered=\"false\"\n  >\n    <template #item=\"{ item }\">\n      <a-list :data=\"item.data\">\n        <template #header>{{ item.title }}<\/template>\n        <template #item=\"{ item: subItem }\">\n          <a-list-item>{{ subItem }}<\/a-list-item>\n        <\/template>\n      <\/a-list>\n    <\/template>\n  <\/a-list>\n<\/template>\n\n<script>\nconst dataSource = [\n  {\n    title: 'Platform',\n    data: ['iOS', 'Android', 'Web'],\n  },\n  {\n    title: 'Framework',\n    data: ['Angular', 'Vue', 'React'],\n  },\n  {\n    title: 'Language',\n    data: ['C++', 'JavaScript', 'Python'],\n  },\n  {\n    title: 'Component',\n    data: ['Button', 'Breadcrumb', 'Transfer'],\n  },\n  {\n    title: 'Design',\n    data: ['Figma', 'Sketch', 'Adobe XD'],\n  },\n  {\n    title: 'Plugin',\n    data: ['Edu Tools', 'BashSupport', 'GitToolBox'],\n  },\n  {\n    title: 'Platform',\n    data: ['iOS', 'Android', 'Web'],\n  },\n  {\n    title: 'Framework',\n    data: ['Angular', 'Vue', 'React'],\n  },\n  {\n    title: 'Language',\n    data: ['C++', 'JavaScript', 'Python'],\n  },\n];\n\nexport default {\n  setup() {\n    return {\n      dataSource\n    }\n  }\n}\n<\/script>";
const responsiveGridTitle = "Responsive Grid.Md";
const responsiveGridDescription = "通过 `grid.sm` 等响应式参数动态设置每个单项横跨的列数，注意此时不要设置 `grid.span`。";
import scrollDemo from '../../.vitepress/theme/generated/list/scroll.vue';
const scrollSource = "<template>\n  <div style=\"margin-bottom: 10px\">\n    <a-switch v-model=\"scrollbar\" />\n    Virtual Scrollbar\n  <\/div>\n  <a-list :max-height=\"240\" @reach-bottom=\"fetchData\" :scrollbar=\"scrollbar\">\n    <template #header>\n      List title\n    <\/template>\n    <template #scroll-loading>\n      <div v-if=\"bottom\">No more data<\/div>\n      <a-spin v-else />\n    <\/template>\n    <a-list-item v-for=\"item of data\">{{item}}<\/a-list-item>\n  <\/a-list>\n<\/template>\n\n<script>\nimport { reactive, ref } from 'vue';\n\nexport default {\n  setup() {\n    const current = ref(1);\n    const bottom = ref(false);\n    const data = reactive([]);\n    const scrollbar = ref(true);\n\n    const fetchData = () => {\n      console.log('reach bottom!');\n      if (current.value <= 5) {\n        window.setTimeout(() => {\n          const index = data.length;\n          data.push(\n            `Beijing Bytedance Technology Co., Ltd. ${index + 1}`,\n            `Bytedance Technology Co., Ltd. ${index + 2}`,\n            `Beijing Toutiao Technology Co., Ltd. ${index + 3}`,\n            `Beijing Volcengine Technology Co., Ltd. ${index + 4}`,\n            `China Beijing Bytedance Technology Co., Ltd. ${index + 5}`\n          );\n          current.value += 1\n        }, 2000)\n      } else {\n        bottom.value = true\n      }\n    }\n\n    return {\n      current,\n      bottom,\n      data,\n      fetchData,\n      scrollbar\n    }\n  },\n}\n<\/script>";
const scrollTitle = "Scroll.Md";
const scrollDescription = "通过设置 `max-height` 属性限制列表的最大高度。通过 `reach-bottom` 事件可以监听列表触底的事件。";
import sizeDemo from '../../.vitepress/theme/generated/list/size.vue';
const sizeSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\">\n    <a-radio-group v-model=\"size\" type=\"button\">\n      <a-radio value=\"small\">Small<\/a-radio>\n      <a-radio value=\"medium\">Medium<\/a-radio>\n      <a-radio value=\"large\">Large<\/a-radio>\n    <\/a-radio-group>\n    <a-list :size=\"size\">\n      <template #header>\n        List title\n      <\/template>\n      <a-list-item>Beijing Bytedance Technology Co., Ltd.<\/a-list-item>\n      <a-list-item>Bytedance Technology Co., Ltd.<\/a-list-item>\n      <a-list-item>Beijing Toutiao Technology Co., Ltd.<\/a-list-item>\n      <a-list-item>Beijing Volcengine Technology Co., Ltd.<\/a-list-item>\n      <a-list-item>China Beijing Bytedance Technology Co., Ltd.<\/a-list-item>\n    <\/a-list>\n  <\/a-space>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const size = ref('medium');\n\n    return {\n      size\n    }\n  },\n}\n<\/script>";
const sizeTitle = "Size.Md";
const sizeDescription = "列表组件提供了三种大小 `small, medium, large` ，可根据业务需求自行选择。";
import virtualListDemo from '../../.vitepress/theme/generated/list/virtualList.vue';
const virtualListSource = "<template>\n  <h3 :style=\"{ color: 'var(--color-text-2)' }\">10000 items<\/h3>\n  <a-list\n    :style=\"{ width: `600px` }\"\n    :virtualListProps=\"{\n      height: 560,\n    }\"\n    :data=\"list\"\n  >\n    <template #item=\"{ item, index }\">\n      <a-list-item :key=\"index\">\n        <a-list-item-meta\n          :title=\"item.title\"\n          :description=\"item.description\"\n        >\n          <template #avatar>\n            <a-avatar shape=\"square\">\n              A\n            <\/a-avatar>\n          <\/template>\n        <\/a-list-item-meta>\n      <\/a-list-item>\n    <\/template>\n  <\/a-list>\n<\/template>\n\n<script>\nimport { reactive } from 'vue';\n\nexport default {\n  setup() {\n    const list = reactive(Array(10000).fill(null).map((_, index) => {\n      const prefix = `0000${index}`.slice(-5);\n      return {\n        title: 'Beijing Bytedance Technology Co., Ltd.',\n        description: `(${prefix}) Beijing ByteDance Technology Co., Ltd. is an enterprise located in China.`,\n      };\n    }))\n\n    return {\n      list\n    }\n  },\n}\n<\/script>";
const virtualListTitle = "Virtual List.Md";
const virtualListDescription = "通过指定 `virtualListProps` 来开启虚拟列表，在大量数据时获得高性能表现。\n在使用虚拟列表时，如果列表元素之间高度变化较大可能导致滚动时视口出现空白区域，可通过调整 `virtualListProps.buffer` 属性解决，[使用方式](/vue/docs/faq#%E8%99%9A%E6%8B%9F%E5%88%97%E8%A1%A8%E7%9A%84%E4%BD%BF%E7%94%A8)。";
</script>

## 示例


<DemoBlock
  :title="actionsLayoutTitle"
  :description="actionsLayoutDescription"
  :code="actionsLayoutSource"
>
  <actionsLayoutDemo />
</DemoBlock>

<DemoBlock
  :title="actionsTitle"
  :description="actionsDescription"
  :code="actionsSource"
>
  <actionsDemo />
</DemoBlock>

<DemoBlock
  :title="basicTitle"
  :description="basicDescription"
  :code="basicSource"
>
  <basicDemo />
</DemoBlock>

<DemoBlock
  :title="gridTitle"
  :description="gridDescription"
  :code="gridSource"
>
  <gridDemo />
</DemoBlock>

<DemoBlock
  :title="metaTitle"
  :description="metaDescription"
  :code="metaSource"
>
  <metaDemo />
</DemoBlock>

<DemoBlock
  :title="responsiveGridTitle"
  :description="responsiveGridDescription"
  :code="responsiveGridSource"
>
  <responsiveGridDemo />
</DemoBlock>

<DemoBlock
  :title="scrollTitle"
  :description="scrollDescription"
  :code="scrollSource"
>
  <scrollDemo />
</DemoBlock>

<DemoBlock
  :title="sizeTitle"
  :description="sizeDescription"
  :code="sizeSource"
>
  <sizeDemo />
</DemoBlock>

<DemoBlock
  :title="virtualListTitle"
  :description="virtualListDescription"
  :code="virtualListSource"
>
  <virtualListDemo />
</DemoBlock>
