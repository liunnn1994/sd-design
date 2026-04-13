---
title: "message"
outline: "deep"
---

```yaml
meta:
  type: 组件
  category: 反馈
title: 全局提示 Message
description: 由用户的操作触发的轻量级全局反馈。
```







### `Message` 全局方法

Message提供的全局方法，可以通过以下三种方法使用：
1. 通过this.$message调用
2. 在Composition API中，通过getCurrentInstance().appContext.config.globalProperties.$message调用
3. 导入Message，通过Message本身调用

当通过 import 方式使用时，组件没有办法获取当前的 Vue Context，如 i18n 或 route 等注入在 AppContext 上的内容无法在内部使用，需要在调用时手动传入 AppContext，或者为组件全局指定 AppContext

```ts
import { createApp } from 'vue'
import { Message } from '@sd-design/web-vue';

const app = createApp(App);
Message._context = app._context;
```


### MessageMethod

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|info|显示信息提示|`(    config: string \| MessageConfig,    appContext?: AppContext  ) => MessageReturn`|`-`||
|success|显示成功提示|`(    config: string \| MessageConfig,    appContext?: AppContext  ) => MessageReturn`|`-`||
|warning|显示警告提示|`(    config: string \| MessageConfig,    appContext?: AppContext  ) => MessageReturn`|`-`||
|error|显示错误提示|`(    config: string \| MessageConfig,    appContext?: AppContext  ) => MessageReturn`|`-`||
|loading|显示加载中提示|`(    config: string \| MessageConfig,    appContext?: AppContext  ) => MessageReturn`|`-`||
|normal|显示提示|`(    config: string \| MessageConfig,    appContext?: AppContext  ) => MessageReturn`|`-`|2.41.0|
|clear|清空全部提示|`(position?: MessagePosition) => void`|`-`||



### MessageConfig

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|content|内容|`RenderContent`|`-`||
|id|唯一id|`string`|`-`||
|icon|消息的图标|`RenderFunction`|`-`||
|position|消息的位置|`'top'\|'bottom'`|`-`||
|showIcon|是否显示图标|`boolean`|`false`||
|closable|是否显示关闭按钮|`boolean`|`false`||
|duration|消息显示的持续时间|`number`|`-`||
|onClose|关闭时的回调函数|`(id: number \| string) => void`|`-`||
|resetOnHover|设置鼠标移入后不会自动关闭|`boolean`|`false`|2.39.0|



### MessageReturn

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|close|关闭当前消息|`() => void`|`-`|

<script setup lang="ts">
import basicDemo from '../../.vitepress/theme/generated/message/basic.vue';
const basicSource = "<template>\n  <a-button @click=\"handleClick\">Info Message<\/a-button>\n<\/template>\n\n<script>\nexport default {\n  methods: {\n    handleClick() {\n      this.$message.info('This is an info message')\n    }\n  }\n};\n<\/script>";
const basicTitle = "Basic.Md";
const basicDescription = "全局提示的基本用法。";
import closeableDemo from '../../.vitepress/theme/generated/message/closeable.vue';
const closeableSource = "<template>\n  <a-button @click=\"handleClick\">Closeable Message<\/a-button>\n<\/template>\n\n<script>\nexport default {\n  methods: {\n    handleClick(){\n      this.$message.info({\n        content:'This is an info message!',\n        closable: true\n      })\n    }\n  }\n};\n<\/script>";
const closeableTitle = "Closeable.Md";
const closeableDescription = "设置 `closable` 来显示关闭按钮。";
import iconDemo from '../../.vitepress/theme/generated/message/icon.vue';
const iconSource = "<template>\n  <a-button @click=\"handleClick\">Info Message<\/a-button>\n<\/template>\n\n<script>\nimport { h } from 'vue';\nimport { IconFaceSmileFill } from '@sd-design/web-vue/es/icon';\n\nexport default {\n  methods: {\n    handleClick() {\n      this.$message.info({\n        content: 'This is an info message!',\n        icon: () => h(IconFaceSmileFill)\n      });\n    }\n  }\n}\n<\/script>";
const iconTitle = "Icon.Md";
const iconDescription = "设置 `icon` 来自定义图标。";
import positionDemo from '../../.vitepress/theme/generated/message/position.vue';
const positionSource = "<template>\n  <a-space>\n    <a-button @click=\"()=>this.$message.info({content:'This is an info message!'})\">Top Message<\/a-button>\n    <a-button @click=\"()=>this.$message.info({content:'This is an info message!',position:'bottom'})\">Bottom Message<\/a-button>\n  <\/a-space>\n<\/template>";
const positionTitle = "Position.Md";
const positionDescription = "全局提示有 2 种不同的弹出位置，分别为顶部和底部。";
import typeDemo from '../../.vitepress/theme/generated/message/type.vue';
const typeSource = "<template>\n  <div>\n    <a-space>\n      <a-button @click=\"()=>this.$message.info('This is an info message!')\">Info Message<\/a-button>\n      <a-button @click=\"()=>this.$message.success('This is a success message!')\" status=\"success\">Success Message\n      <\/a-button>\n      <a-button @click=\"()=>this.$message.warning('This is a warning message!')\" status=\"warning\">Warning Message\n      <\/a-button>\n      <a-button @click=\"()=>this.$message.error('This is an error message!')\" status=\"danger\">Error Message<\/a-button>\n    <\/a-space>\n  <\/div>\n  <div style=\"margin-top: 20px\">\n    <a-space>\n      <a-button @click=\"()=>this.$message.normal('This is a normal message!')\">Normal Message<\/a-button>\n      <a-button @click=\"()=>this.$message.normal({\n    content:'This is a normal message!',\n    icon:renderIcon\n    })\">Normal Message With Icon\n      <\/a-button>\n      <a-button @click=\"()=>this.$message.loading('This is a loading message!')\" status=\"primary\">Loading Message\n      <\/a-button>\n    <\/a-space>\n  <\/div>\n<\/template>\n\n<script>\nimport { h } from 'vue';\nimport { IconExclamationCircleFill } from '@sd-design/web-vue/es/icon';\n\nexport default {\n  setup() {\n    const renderIcon = () => h(IconExclamationCircleFill);\n    return {\n      renderIcon\n    }\n  }\n};\n<\/script>";
const typeTitle = "Type.Md";
const typeDescription = "全局提示有 6 种不同的类型，分别为：`info`, `success`, `warning`, `error`, `loading`。2.41.0 版本增加 `normal` 类型，此类型下默认没有图标。";
import updateDemo from '../../.vitepress/theme/generated/message/update.vue';
const updateSource = "<template>\n  <a-button @click=\"handleClick\">Update Info Message<\/a-button>\n<\/template>\n\n<script>\nexport default {\n  data() {\n    return {\n      index: 0\n    }\n  },\n  methods: {\n    handleClick() {\n      this.$message.info({\n        id: 'myInfo',\n        content: `This is an info message ${this.$data.index++}`,\n        duration: 2000\n      })\n    }\n  }\n};\n<\/script>";
const updateTitle = "Update.Md";
const updateDescription = "更新消息内容，通过设置 `duration` 属性可以重置定时器。";
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
  :title="closeableTitle"
  :description="closeableDescription"
  :code="closeableSource"
>
  <closeableDemo />
</DemoBlock>

<DemoBlock
  :title="iconTitle"
  :description="iconDescription"
  :code="iconSource"
>
  <iconDemo />
</DemoBlock>

<DemoBlock
  :title="positionTitle"
  :description="positionDescription"
  :code="positionSource"
>
  <positionDemo />
</DemoBlock>

<DemoBlock
  :title="typeTitle"
  :description="typeDescription"
  :code="typeSource"
>
  <typeDemo />
</DemoBlock>

<DemoBlock
  :title="updateTitle"
  :description="updateDescription"
  :code="updateSource"
>
  <updateDemo />
</DemoBlock>
