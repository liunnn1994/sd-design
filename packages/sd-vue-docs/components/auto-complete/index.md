---
title: 'auto-complete'
outline: 'deep'
---

```yaml
meta:
  type: 组件
  category: 数据输入
title: 自动补全 AutoComplete
description: 输入框的自动补全功能。
```

## API

### `<auto-complete>` Props

| 参数名 | 描述 | 类型 | 默认值 | 版本 |
| --- | --- | --- | :-: | :-- |
| model-value **(v-model)** | 绑定值 | `string` | `-` |  |
| default-value | 默认值（非受控模式） | `string` | `''` |  |
| disabled | 是否禁用 | `boolean` | `false` |  |
| data | 用于自动提示的数据 | `(string \| number \| SelectOptionData \| SelectOptionGroup)[]` | `[]` |  |
| popup-container | 弹出框的挂载容器 | `string \| HTMLElement \| null \| undefined` | `-` |  |
| strict | 是否为严格校验模式 | `boolean` | `false` |  |
| filter-option | 自定义选项过滤方法 | `FilterOption` | `true` |  |
| trigger-props | trigger 组件属性 | `TriggerProps` | `-` | 2.14.0 |
| allow-clear | 是否允许清空输入框 | `boolean` | `false` | 2.23.0 |
| virtual-list-props | 传递虚拟列表属性，传入此参数以开启虚拟滚动 [VirtualListProps](#VirtualListProps) | `VirtualListProps` | `-` | 2.50.0 |

### `<auto-complete>` Events

| 事件名                | 描述                     | 参数            | 版本   |
| --------------------- | ------------------------ | --------------- | :----- |
| change                | 绑定值发生改变时触发     | value: `string` |        |
| search                | 用户搜索时触发           | value: `string` |        |
| select                | 选择选项时触发           | value: `string` |        |
| clear                 | 用户点击清除按钮时触发   | ev: `Event`     | 2.23.0 |
| dropdown-scroll       | 下拉菜单发生滚动时触发   | ev: `Event`     | 2.52.0 |
| dropdown-reach-bottom | 下拉菜单滚动到底部时触发 | ev: `Event`     | 2.52.0 |

### `<auto-complete>` Methods

| 方法名 | 描述             | 参数 | 返回值 | 版本   |
| ------ | ---------------- | ---- | ------ | :----- |
| focus  | 使输入框获取焦点 | -    | -      | 2.40.0 |
| blur   | 使输入框失去焦点 | -    | -      | 2.40.0 |

### `<auto-complete>` Slots

| 插槽名 |     描述     | 参数               | 版本   |
| ------ | :----------: | ------------------ | :----- |
| option |   选项内容   | data: `OptionInfo` | 2.13.0 |
| footer | 弹出框的页脚 | -                  |        |

<script setup lang="ts">
import basicDemo from '../../.vitepress/theme/generated/auto-complete/basic.vue';
const basicSource = "<template>\n  <a-auto-complete :data=\"data\" @search=\"handleSearch\" :style=\"{width:'360px'}\" placeholder=\"please enter something\"/>\n<\/template>\n\n<script>\nexport default {\n  data() {\n    return {\n      data: []\n    }\n  },\n  methods: {\n    handleSearch(value) {\n      if (value) {\n        this.data = [...Array(5)].map((_, index) => `${value}-${index}`)\n        console.log(this.data)\n      } else {\n        this.data = []\n      }\n    }\n  }\n}\n<\/script>";
const basicTitle = "Basic.Md";
const basicDescription = "自动补全的基础用法";
import footerDemo from '../../.vitepress/theme/generated/auto-complete/footer.vue';
const footerSource = "<template>\n  <a-auto-complete :data=\"data\" @search=\"handleSearch\" :style=\"{width:'360px'}\" placeholder=\"please enter something\">\n    <template #footer>\n      <div style=\"padding: 6px 0; text-align: center;\">\n        <a-button>Click Me<\/a-button>\n      <\/div>\n    <\/template>\n  <\/a-auto-complete>\n<\/template>\n\n<script>\nexport default {\n  data() {\n    return {\n      data: []\n    }\n  },\n  methods: {\n    handleSearch(value) {\n      if (value) {\n        this.data = [...Array(5)].map((_, index) => `${value}-${index}`)\n        console.log(this.data)\n      } else {\n        this.data = []\n      }\n    }\n  }\n}\n<\/script>";
const footerTitle = "Footer.Md";
const footerDescription = "自定义弹出框的页脚";
import scrollDemo from '../../.vitepress/theme/generated/auto-complete/scroll.vue';
const scrollSource = "<template>\n  <a-auto-complete\n    :data=\"data\"\n    :style=\"{ width: '360px' }\"\n    placeholder=\"please enter something\"\n    @dropdown-scroll=\"handleScroll\"\n    @dropdown-reach-bottom=\"handleReachBottom\"\n  />\n<\/template>\n\n<script>\nimport { ref } from 'vue'\n\nexport default {\n  setup() {\n    const data = ref([...Array(100)].map((_, index) => `option-${index}`))\n\n    const handleScroll = (ev) => {\n      console.log('scroll', ev)\n    }\n    const handleReachBottom = (ev) => {\n      console.log('reach the bottom', ev)\n    }\n\n    return {\n      data,\n      handleScroll,\n      handleReachBottom\n    }\n  },\n}\n<\/script>";
const scrollTitle = "Scroll.Md";
const scrollDescription = "可以通过 `dropdown-scroll` 监听下拉菜单的滚动事件。或者通过 `dropdown-reach-bottom` 监听下拉菜单滚动到底部的事件。";
import strictDemo from '../../.vitepress/theme/generated/auto-complete/strict.vue';
const strictSource = "<template>\n  <a-auto-complete :data=\"data\" :style=\"{width:'360px'}\" placeholder=\"please enter something\" strict />\n<\/template>\n\n<script>\nexport default {\n  data() {\n    return {\n      data: ['Beijing', 'Shanghai', 'Chengdu', 'WuHan']\n    }\n  },\n}\n<\/script>";
const strictTitle = "Strict.Md";
const strictDescription = "使用 `strict` 属性来指明在匹配时严格区分大小写。";
import virtualListDemo from '../../.vitepress/theme/generated/auto-complete/virtualList.vue';
const virtualListSource = "<template>\n  <a-auto-complete\n    :data=\"data\"\n    @search=\"handleSearch\"\n    :style=\"{ width: '360px' }\"\n    placeholder=\"please enter something\"\n    :virtual-list-props=\"{ height: 200, threshold: 20 }\"\n  />\n<\/template>\n\n<script>\nexport default {\n  data() {\n    return {\n      data: [],\n    };\n  },\n  methods: {\n    handleSearch(value) {\n      if (value) {\n        this.data = [...Array(5000)].map((_, index) => `${value}-${index}`);\n      } else {\n        this.data = [];\n      }\n    },\n  },\n};\n<\/script>";
const virtualListTitle = "Virtual List.Md";
const virtualListDescription = "虚拟列表的使用方法。";
</script>

## 示例

<DemoBlock :title="basicTitle" :description="basicDescription" :code="basicSource"

>   <basicDemo />
> </DemoBlock>

<DemoBlock :title="footerTitle" :description="footerDescription" :code="footerSource"

>   <footerDemo />
> </DemoBlock>

<DemoBlock :title="scrollTitle" :description="scrollDescription" :code="scrollSource"

>   <scrollDemo />
> </DemoBlock>

<DemoBlock :title="strictTitle" :description="strictDescription" :code="strictSource"

>   <strictDemo />
> </DemoBlock>

<DemoBlock :title="virtualListTitle" :description="virtualListDescription" :code="virtualListSource"

>   <virtualListDemo />
> </DemoBlock>
