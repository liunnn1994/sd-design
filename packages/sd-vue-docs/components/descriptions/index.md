---
title: 'descriptions'
outline: 'deep'
---

```yaml
meta:
  type: 组件
  category: 数据展示
title: 描述列表 Descriptions
description: 一般用于详情页的信息展示。
```

## API

### `<descriptions>` Props

| 参数名 | 描述 | 类型 | 默认值 | 版本 |
| --- | --- | --- | :-: | :-- |
| data | 描述列表的数据 | `DescData[]` | `[]` |  |
| column | 每行放置的数据个数。2.20.0 版本支持响应式配置，配置可参考 Grid | `number \| ResponsiveValue` | `3` |  |
| title | 描述列表的标题 | `string` | `-` |  |
| layout | 描述列表的排列方式 | `'horizontal' \| 'vertical' \| 'inline-horizontal' \| 'inline-vertical'` | `'horizontal'` |  |
| align | 文字的对齐位置 | `TextAlign \| { label?: TextAlign; value?: TextAlign }` | `'left'` |  |
| size | 描述列表的大小 | `'mini' \| 'small' \| 'medium' \| 'large'` | `-` |  |
| bordered | 是否显示边框 | `boolean` | `false` |  |
| label-style | 数据标签的样式 | `CSSProperties` | `-` |  |
| value-style | 数据内容的样式 | `CSSProperties` | `-` |  |
| table-layout | 描述中表格样式的 `layout-fixed`，当设置成 `fixed` 时，宽度会均分。 | `'auto' \| 'fixed'` | `'auto'` | 2.38.0 |

### `<descriptions>` Slots

| 插槽名 |   描述   | 参数                                                   |
| ------ | :------: | ------------------------------------------------------ |
| value  | 数据内容 | value: `string`<br>index: `number`<br>data: `DescData` |
| label  | 数据标签 | label: `string`<br>index: `number`<br>data: `DescData` |
| title  |   标题   | -                                                      |

### `<descriptions-item>` Props

| 参数名 | 描述     | 类型     | 默认值 | 版本   |
| ------ | -------- | -------- | :----: | :----- |
| span   | 所占列数 | `number` |  `1`   | 2.18.0 |
| label  | 标签     | `string` |  `-`   | 2.18.0 |

### `<descriptions-item>` Slots

| 插槽名 | 描述 | 参数 | 版本   |
| ------ | :--: | ---- | :----- |
| label  | 标签 | -    | 2.18.0 |

### DescData

| 参数名 | 描述     | 类型                       | 默认值 |
| ------ | -------- | -------------------------- | :----: |
| label  | 标签     | `string \| RenderFunction` |  `-`   |
| value  | 数据     | `string \| RenderFunction` |  `-`   |
| span   | 所占列数 | `number`                   |  `1`   |

<script setup lang="ts">
import alignDemo from '../../.vitepress/theme/generated/descriptions/align.vue';
const alignSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\">\n    <a-descriptions :data=\"data\" title=\"User Info\" align=\"right\" />\n    <a-descriptions :data=\"data\" title=\"User Info\" :align=\"{ label: 'right' }\" />\n    <a-descriptions :data=\"data\" title=\"User Info\" layout=\"inline-vertical\" />\n  <\/a-space>\n<\/template>\n\n<script>\nexport default {\n  setup() {\n    const data = [{\n      label: 'Name',\n      value: 'Socrates',\n    }, {\n      label: 'Mobile',\n      value: '123-1234-1234',\n    }, {\n      label: 'Residence',\n      value: 'Beijing'\n    }, {\n      label: 'Hometown',\n      value: 'Beijing',\n    }, {\n      label: 'Address',\n      value: 'Yingdu Building, Zhichun Road, Beijing'\n    }];\n\n    return {\n      data\n    }\n  },\n}\n<\/script>";
const alignTitle = "Align.Md";
const alignDescription = "标签文本可以设置左对齐右对齐，也可以设置垂直的排列方式。";
import basicDemo from '../../.vitepress/theme/generated/descriptions/basic.vue';
const basicSource = "<template>\n  <a-space direction=\"vertical\" size=\"large\" fill>\n    <a-descriptions :data=\"data\" title=\"User Info\" layout=\"inline-horizontal\" />\n    <a-descriptions title=\"User Info\" :column=\"{xs:1, md:3, lg:4}\">\n      <a-descriptions-item v-for=\"item of data\" :label=\"item.label\" :span=\"item.span ?? 1\">\n        <a-tag>{{ item.value }}<\/a-tag>\n      <\/a-descriptions-item>\n    <\/a-descriptions>\n  <\/a-space>\n<\/template>\n\n<script>\nexport default {\n  setup() {\n    const data = [{\n      label: 'Name',\n      value: 'Socrates',\n      span: 3,\n    }, {\n      label: 'Mobile',\n      value: '123-1234-1234',\n    }, {\n      label: 'Residence',\n      value: 'Beijing'\n    }, {\n      label: 'Hometown',\n      value: 'Beijing',\n    }, {\n      label: 'Address',\n      value: 'Yingdu Building, Zhichun Road, Beijing'\n    }];\n\n    return {\n      data\n    }\n  },\n}\n<\/script>";
const basicTitle = "Basic.Md";
const basicDescription = "简单地成组展示多个只读字段，一般用于详情页的信息。";
import borderedDemo from '../../.vitepress/theme/generated/descriptions/bordered.vue';
const borderedSource = "<template>\n  <a-descriptions :data=\"data\" title=\"User Info\" bordered/>\n<\/template>\n\n<script>\nexport default {\n  setup() {\n    const data = [{\n      label: 'Name',\n      value: 'Socrates',\n    }, {\n      label: 'Mobile',\n      value: '123-1234-1234',\n    }, {\n      label: 'Residence',\n      value: 'Beijing'\n    }, {\n      label: 'Hometown',\n      value: 'Beijing',\n    }, {\n      label: 'Address',\n      value: 'Yingdu Building, Zhichun Road, Beijing'\n    }];\n\n    return {\n      data\n    }\n  },\n}\n<\/script>";
const borderedTitle = "Bordered.Md";
const borderedDescription = "带边框和背景颜色的列表。";
import exampleDemo from '../../.vitepress/theme/generated/descriptions/example.vue';
const exampleSource = "<template>\n  <a-form :model=\"form\" auto-label-width>\n    <a-form-item label=\"size\">\n      <a-radio-group v-model=\"form.size\" type=\"button\" :options=\"sizeOptions\" />\n    <\/a-form-item>\n\n    <a-form-item label=\"layout\">\n      <a-radio-group\n        v-model=\"form.layout\"\n        type=\"button\"\n        :options=\"layoutOptions\"\n      />\n    <\/a-form-item>\n\n    <a-form-item label=\"table-layout\">\n      <a-radio-group\n        v-model=\"form.tableLayout\"\n        type=\"button\"\n        :options=\"['auto', 'fixed']\"\n      />\n    <\/a-form-item>\n\n    <a-form-item label=\"column\">\n      <a-radio-group\n        v-model=\"form.column\"\n        type=\"button\"\n        :options=\"columnOptions\"\n      />\n    <\/a-form-item>\n\n    <a-form-item label=\"firstSpan\">\n      <a-radio-group\n        v-model=\"form.firstSpan\"\n        type=\"button\"\n        :options=\"firstSpanOptions\"\n      />\n    <\/a-form-item>\n  <\/a-form>\n  <div style=\"margin-top: 20px\">\n    <a-descriptions\n      title=\"Layout Example\"\n      :size=\"form.size\"\n      :column=\"form.column\"\n      :layout=\"form.layout\"\n      :table-layout=\"form.tableLayout\"\n      bordered\n    >\n      <a-descriptions-item label=\"Item1\" :span=\"form.firstSpan\">\n        <div>Span：{{form.firstSpan}}\n          <span v-if=\"form.firstSpan > form.column\" style=\"color: red;\">\n            Exceeds Column, set to Column size\n          <\/span>\n        <\/div>\n      <\/a-descriptions-item>\n      <a-descriptions-item label=\"Item2\" :span=\"2\">Span：2<\/a-descriptions-item>\n      <a-descriptions-item label=\"Item3\" :span=\"3\">Span：3<\/a-descriptions-item>\n      <a-descriptions-item label=\"Item4\" :span=\"2\">Span：2<\/a-descriptions-item>\n      <a-descriptions-item label=\"Item5\" :span=\"1\">Span：1<\/a-descriptions-item>\n      <a-descriptions-item label=\"Item6\" :span=\"1\">Span：1<\/a-descriptions-item>\n    <\/a-descriptions>\n  <\/div>\n<\/template>\n\n<script setup>\nimport { reactive } from 'vue';\n\nconst form = reactive({\n  size: 'medium',\n  layout: 'horizontal',\n  column: 4,\n  tableLayout: 'auto',\n  firstSpan: 2\n});\n\nconst layoutOptions = [\n  'horizontal',\n  'inline-horizontal',\n  'vertical',\n  'inline-vertical',\n];\nconst columnOptions = [1, 2, 3, 4, 5];\nconst firstSpanOptions = [1, 2, 3, 4, 5];\nconst sizeOptions = ['mini', 'small', 'medium', 'large'];\n<\/script>";
const exampleTitle = "Example.Md";
const exampleDescription = "`span` 所占列数大于 `column` 可放置的数据个数时，`span` 会被设置为 `column` 的值，当行剩余列数不够放置下一列时将自动换行，每行末尾列会自动填充剩余量。";
import layoutDemo from '../../.vitepress/theme/generated/descriptions/layout.vue';
const layoutSource = "<template>\n  <a-radio-group type=\"button\" v-model=\"size\">\n    <a-radio value=\"mini\">mini<\/a-radio>\n    <a-radio value=\"small\">small<\/a-radio>\n    <a-radio value=\"medium\">medium<\/a-radio>\n    <a-radio value=\"large\">large<\/a-radio>\n  <\/a-radio-group>\n  <div style=\"margin-top: 20px\">\n    <a-descriptions :data=\"data\" :size=\"size\" title=\"User Info (horizontal)\" bordered />\n    <a-descriptions :data=\"data\" :size=\"size\" title=\"User Info (inline-horizontal)\" layout=\"inline-horizontal\" bordered />\n    <a-descriptions :data=\"data\" :size=\"size\" title=\"User Info (vertical)\" layout=\"vertical\" bordered />\n    <a-descriptions :data=\"data\" :size=\"size\" title=\"User Info (inline-vertical)\" layout=\"inline-vertical\" bordered />\n  <\/div>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const size = ref('medium');\n\n    const data = [{\n      label: 'Name',\n      value: 'Socrates',\n    }, {\n      label: 'Mobile',\n      value: '123-1234-1234',\n    }, {\n      label: 'Residence',\n      value: 'Beijing'\n    }, {\n      label: 'Hometown',\n      value: 'Beijing',\n    }, {\n      label: 'Address',\n      value: 'Yingdu Building, Zhichun Road, Beijing'\n    }];\n\n    return {\n      data,\n      size\n    }\n  },\n}\n<\/script>";
const layoutTitle = "Layout.Md";
const layoutDescription = "有水平排列、垂直排列、行内水平排列、行内垂直排列四种布局模式。";
import singleDemo from '../../.vitepress/theme/generated/descriptions/single.vue';
const singleSource = "<template>\n  <a-radio-group type=\"button\" v-model=\"size\">\n    <a-radio value=\"mini\">mini<\/a-radio>\n    <a-radio value=\"small\">small<\/a-radio>\n    <a-radio value=\"medium\">medium<\/a-radio>\n    <a-radio value=\"large\">large<\/a-radio>\n  <\/a-radio-group>\n  <a-descriptions style=\"margin-top: 20px\" :data=\"data\" :size=\"size\" title=\"User Info\" :column=\"1\"/>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const size = ref('medium');\n\n    const data = [{\n      label: 'Name',\n      value: 'Socrates',\n    }, {\n      label: 'Mobile',\n      value: '123-1234-1234',\n    }, {\n      label: 'Residence',\n      value: 'Beijing'\n    }, {\n      label: 'Hometown',\n      value: 'Beijing',\n    }, {\n      label: 'Address',\n      value: 'Yingdu Building, Zhichun Road, Beijing'\n    }];\n\n    return {\n      data,\n      size\n    }\n  },\n}\n<\/script>";
const singleTitle = "Single.Md";
const singleDescription = "单列的描述列表样式。";
</script>

## 示例

<DemoBlock :title="alignTitle" :description="alignDescription" :code="alignSource"

>   <alignDemo />
> </DemoBlock>

<DemoBlock :title="basicTitle" :description="basicDescription" :code="basicSource"

>   <basicDemo />
> </DemoBlock>

<DemoBlock :title="borderedTitle" :description="borderedDescription" :code="borderedSource"

>   <borderedDemo />
> </DemoBlock>

<DemoBlock :title="exampleTitle" :description="exampleDescription" :code="exampleSource"

>   <exampleDemo />
> </DemoBlock>

<DemoBlock :title="layoutTitle" :description="layoutDescription" :code="layoutSource"

>   <layoutDemo />
> </DemoBlock>

<DemoBlock :title="singleTitle" :description="singleDescription" :code="singleSource"

>   <singleDemo />
> </DemoBlock>
