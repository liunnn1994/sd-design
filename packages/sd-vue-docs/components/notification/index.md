---
title: "notification"
outline: "deep"
---

```yaml
meta:
  type: 组件
  category: 反馈
title: 通知提醒框 Notification
description: 全局展示通知提醒，将信息及时有效的传达给用户。
```









## API





### `Notification` 全局方法

`Notification` 提供的全局方法，可以通过以下三种方法使用：
1. 通过 `this.$notification` 调用
2. 在 Composition API 中，通过 `getCurrentInstance().appContext.config.globalProperties.$notification` 调用
3. 导入 `Notification`，通过 `Notification` 本身调用

当通过 `import` 方式使用时，组件没有办法获取当前的 Vue Context，如 i18n 或 route 等注入在 AppContext 上的内容无法在内部使用，需要在调用时手动传入 AppContext，或者为组件全局指定 AppContext

```ts
import { createApp } from 'vue'
import { Notification } from '@sd-design/web-vue';

const app = createApp(App);
Notification._context = app._context;
```


### NotificationMethod

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|info|显示信息提醒框|`(    config: string \| NotificationConfig,    appContext?: AppContext  ) => NotificationReturn`|`-`|
|success|显示成功提醒框|`(    config: string \| NotificationConfig,    appContext?: AppContext  ) => NotificationReturn`|`-`|
|warning|显示警告提醒框|`(    config: string \| NotificationConfig,    appContext?: AppContext  ) => NotificationReturn`|`-`|
|error|显示错误提醒框|`(    config: string \| NotificationConfig,    appContext?: AppContext  ) => NotificationReturn`|`-`|
|remove|清除对应 `id` 的提醒框|`(id: string) => void`|`-`|
|clear|清除全部提醒框|`(position?: NotificationPosition) => void`|`-`|



### NotificationConfig

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|content|内容|`RenderContent`|`-`||
|title|标题|`RenderContent`|`-`||
|icon|图标|`RenderFunction`|`-`||
|id|唯一id|`string`|`-`||
|style|样式|`CSSProperties`|`-`||
|class|样式类名|`ClassName`|`-`||
|position|位置|`'topLeft'\|'topRight'\|'bottomLeft'\|'bottomRight'`|`-`||
|showIcon|是否显示图标|`boolean`|`true`||
|closable|是否可关闭|`boolean`|`false`||
|duration|显示的持续时间，单位为 `ms`|`number`|`3000`||
|footer|底部内容|`RenderFunction`|`-`|2.25.0|
|closeIcon|关闭按钮图标|`RenderFunction`|`-`||
|closeIconElement|关闭按钮元素|`RenderFunction`|`-`||
|onClose|关闭时的回调函数|`(id: number \| string) => void`|`-`||



### NotificationReturn

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|close|关闭当前通知提醒框|`() => void`|`-`|

<script setup lang="ts">
import basicDemo from '../../.vitepress/theme/generated/notification/basic.vue';
const basicSource = "<template>\n  <a-space>\n    <a-button type=\"primary\" @click=\"() => this.$notification.info({\n      title:'Notification',\n      content:'This is a notification!'\n    })\"\n    >\n      Open Notification\n    <\/a-button>\n    <a-button @click=\"handleNotification\">\n      Open Notification\n    <\/a-button>\n  <\/a-space>\n<\/template>\n\n<script>\nimport { Notification } from '@sd-design/web-vue';\n\nexport default {\n  setup() {\n    const handleNotification = () => {\n      Notification.info({\n        title: 'Notification',\n        content: 'This is a notification!',\n      })\n    }\n\n    return { handleNotification }\n  }\n}\n<\/script>";
const basicTitle = "Basic.Md";
const basicDescription = "通知提醒框的基本用法。";
import btnDemo from '../../.vitepress/theme/generated/notification/btn.vue';
const btnSource = "<template>\n  <a-button type=\"primary\" @click=\"handleNotification\">\n    Open Notification\n  <\/a-button>\n<\/template>\n\n<script lang=\"jsx\">\nimport { Notification, Space, Button } from '@sd-design/web-vue';\n\nexport default {\n  setup() {\n    const handleNotification = () => {\n      const id = `${Date.now()}`;\n      const closeNotification =  Notification.info({\n        id,\n        title:'Notification',\n        content:'This is a notification!',\n        duration: 0,\n        footer: <Space>\n          <Button\n            type=\"secondary\"\n            size=\"small\"\n            onClick={() => Notification.remove(id)}\n          >\n            Cancel\n          <\/Button>\n          <Button type=\"primary\" size=\"small\" onClick={closeNotification}>\n            Ok\n          <\/Button>\n        <\/Space>\n      })\n    }\n\n    return { handleNotification }\n  }\n}\n<\/script>";
const btnTitle = "Btn.Md";
const btnDescription = "通过指定 `btn` 字段，可以添加操作按钮。";
import customCloseDemo from '../../.vitepress/theme/generated/notification/customClose.vue';
const customCloseSource = "<template>\n  <a-space>\n    <a-button type=\"primary\" @click=\"handleNotification\">\n      Open Notification\n    <\/a-button>\n    <a-button type=\"primary\" status=\"danger\" @click=\"handleNotification2\">\n      Open Notification\n    <\/a-button>\n  <\/a-space>\n<\/template>\n\n<script lang=\"jsx\">\nimport { Notification, Button } from '@sd-design/web-vue';\nimport { IconCloseCircle } from '@sd-design/web-vue/es/icon';\n\nexport default {\n  setup() {\n    const handleNotification = () => {\n      Notification.info({\n        title:'Notification',\n        content:'This is a notification!',\n        closable: true,\n        closeIcon: <IconCloseCircle />\n      })\n    }\n\n    const handleNotification2 = () => {\n      Notification.error({\n        title:'Notification',\n        content:'This is a notification!',\n        closable: true,\n        closeIconElement: <Button size=\"mini\">Close<\/Button>\n      })\n    }\n\n    return { handleNotification, handleNotification2 }\n  }\n}\n<\/script>";
const customCloseTitle = "Custom Close.Md";
const customCloseDescription = "需要设置 `closable: true`，自定义元素使用 `closeIconElement`，仅图标使用 `closeIcon` (会有 `hover` 样式)。";
import positionDemo from '../../.vitepress/theme/generated/notification/position.vue';
const positionSource = "<template>\n  <a-space>\n    <a-button type=\"primary\" @click=\"handleNotification\"> Top Right <\/a-button>\n    <a-button type=\"primary\" @click=\"handleNotificationTopLeft\"> Top Left <\/a-button>\n    <a-button type=\"primary\" @click=\"handleNotificationBottomRight\"> Bottom Right <\/a-button>\n    <a-button type=\"primary\" @click=\"handleNotificationBottomLeft\"> Bottom Left <\/a-button>\n  <\/a-space>\n<\/template>\n\n<script>\nimport { Notification } from '@sd-design/web-vue';\n\nexport default {\n  setup() {\n    const handleNotification = () => {\n      Notification.info({\n        title: 'Title',\n        content: 'This is a Notification!',\n      })\n    }\n\n    const handleNotificationTopLeft = () => {\n      Notification.info({\n        title: 'Title',\n        content: 'This is a Notification!',\n        position: \"topLeft\"\n      })\n    }\n\n    const handleNotificationBottomRight = () => {\n      Notification.info({\n        title: 'Title',\n        content: 'This is a Notification!',\n        position: 'bottomRight'\n      })\n    }\n\n    const handleNotificationBottomLeft = () => {\n      Notification.info({\n        title: 'Title',\n        content: 'This is a Notification!',\n        position: \"bottomLeft\"\n      })\n    }\n\n    return {\n      handleNotification,\n      handleNotificationTopLeft,\n      handleNotificationBottomRight,\n      handleNotificationBottomLeft\n    }\n  }\n}\n<\/script>";
const positionTitle = "Position.Md";
const positionDescription = "通知提醒框有 4 种不同的弹出位置，分别为：`左上角`, `右上角 (默认)`, `左下角`, `右下角`。";
import styleDemo from '../../.vitepress/theme/generated/notification/style.vue';
const styleSource = "<template>\n  <a-button type=\"primary\" @click=\"handleNotification\">\n    Open Notification\n  <\/a-button>\n<\/template>\n\n<script>\nimport { Notification } from '@sd-design/web-vue';\n\nexport default {\n  setup() {\n    const handleNotification = () => {\n      Notification.info({\n        title: 'Notification',\n        content: 'This is a notification!',\n        closable: true,\n        style: { width: '500px' }\n      })\n    }\n\n    return { handleNotification }\n  }\n}\n<\/script>";
const styleTitle = "Style.Md";
const styleDescription = "可以设置 `style` 和 `class` 来定制样式。";
import typeDemo from '../../.vitepress/theme/generated/notification/type.vue';
const typeSource = "<template>\n  <a-space>\n    <a-button\n      type='primary'\n      @click=\"() => this.$notification.info('This is an info message!')\"\n    >\n      Info\n    <\/a-button>\n    <a-button\n      type='primary'\n      status=\"success\"\n      @click=\"() => this.$notification.success('This is a success message!')\"\n    >\n      Success\n    <\/a-button>\n    <a-button\n      type='primary'\n      status=\"warning\"\n      @click=\"() => this.$notification.warning('This is a warning message!')\"\n    >\n      Warning\n    <\/a-button>\n    <a-button\n      type='primary'\n      status=\"danger\"\n      @click=\"() => this.$notification.error('This is an error message!')\"\n    >\n      Error\n    <\/a-button>\n    <a-button\n      type='secondary'\n      @click=\"() => this.$notification.info({\n        content: 'This is an error message!',\n        showIcon: false\n      })\"\n    >\n      Normal\n    <\/a-button>\n  <\/a-space>\n<\/template>";
const typeTitle = "Type.Md";
const typeDescription = "通知提醒框的消息类型。";
import updateDurationDemo from '../../.vitepress/theme/generated/notification/updateDuration.vue';
const updateDurationSource = "<template>\n  <a-button type=\"primary\" @click=\"handleNotification\">\n    Open Notification\n  <\/a-button>\n<\/template>\n\n<script>\nimport { Notification } from '@sd-design/web-vue';\n\nexport default {\n  setup() {\n    const handleNotification = () => {\n      Notification.warning({\n        id: 'your_id',\n        title: 'Ready to update',\n        content: 'Will update after 2 seconds...',\n        duration: 0,\n      })\n\n      setTimeout(() => {\n        Notification.success({\n          id: 'your_id',\n          title: 'Success',\n          content: 'Update success!',\n          duration: 3000,\n        });\n      }, 2000)\n    }\n\n    return { handleNotification }\n  }\n}\n<\/script>";
const updateDurationTitle = "Update Duration.Md";
const updateDurationDescription = "通过指定参数 `id`，可以更新已经存在的通知提醒框。";
import updateNotificationDemo from '../../.vitepress/theme/generated/notification/updateNotification.vue';
const updateNotificationSource = "<template>\n  <a-button type=\"primary\" @click=\"handleNotification\">\n    Open Notification\n  <\/a-button>\n<\/template>\n\n<script>\nimport { Notification } from '@sd-design/web-vue';\n\nexport default {\n  setup() {\n    const handleNotification = () => {\n      Notification.warning({\n        id: 'your_id',\n        title: 'Ready to update',\n        content: 'Will update after 2 seconds...',\n      })\n\n      setTimeout(() => {\n        Notification.success({\n          id: 'your_id',\n          title: 'Success',\n          content: 'Update success!',\n        });\n      }, 2000)\n    }\n\n    return { handleNotification }\n  }\n}\n<\/script>";
const updateNotificationTitle = "Update Notification.Md";
const updateNotificationDescription = "通过指定参数 `id`，可以更新已经存在的通知提醒框。";
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
  :title="btnTitle"
  :description="btnDescription"
  :code="btnSource"
>
  <btnDemo />
</DemoBlock>

<DemoBlock
  :title="customCloseTitle"
  :description="customCloseDescription"
  :code="customCloseSource"
>
  <customCloseDemo />
</DemoBlock>

<DemoBlock
  :title="positionTitle"
  :description="positionDescription"
  :code="positionSource"
>
  <positionDemo />
</DemoBlock>

<DemoBlock
  :title="styleTitle"
  :description="styleDescription"
  :code="styleSource"
>
  <styleDemo />
</DemoBlock>

<DemoBlock
  :title="typeTitle"
  :description="typeDescription"
  :code="typeSource"
>
  <typeDemo />
</DemoBlock>

<DemoBlock
  :title="updateDurationTitle"
  :description="updateDurationDescription"
  :code="updateDurationSource"
>
  <updateDurationDemo />
</DemoBlock>

<DemoBlock
  :title="updateNotificationTitle"
  :description="updateNotificationDescription"
  :code="updateNotificationSource"
>
  <updateNotificationDemo />
</DemoBlock>
