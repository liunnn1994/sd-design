---
title: 'modal'
outline: 'deep'
---

```yaml
meta:
  type: 组件
  category: 反馈
title: Modal 对话框
description: 在当前页面打开一个浮层，承载相关操作。
```

## API

### `<modal>` Props

| 参数名 | 描述 | 类型 | 默认值 | 版本 |
| --- | --- | --- | :-: | :-- |
| visible **(v-model)** | 对话框是否可见 | `boolean` | `-` |  |
| default-visible | 对话框默认是否可见（非受控状态） | `boolean` | `false` |  |
| width | 对话框的宽度，不设置的情况下会使用样式中的宽度值 | `number\|string` | `-` | 2.12.0 |
| top | 对话框的距离顶部的高度，居中显示开启的情况下不生效 | `number\|string` | `-` | 2.12.0 |
| mask | 是否显示遮罩层 | `boolean` | `true` |  |
| title | 标题 | `string` | `-` |  |
| title-align | 标题的水平对齐方向 | `'start' \| 'center'` | `'center'` | 2.17.0 |
| align-center | 对话框是否居中显示 | `boolean` | `true` |  |
| unmount-on-close | 关闭时是否卸载节点 | `boolean` | `false` |  |
| mask-closable | 是否点击遮罩层可以关闭对话框 | `boolean` | `true` |  |
| hide-cancel | 是否隐藏取消按钮 | `boolean` | `false` |  |
| simple | 是否开启简单模式 | `boolean` | `(props: any) => {  return props.notice;}` |  |
| closable | 是否显示关闭按钮 | `boolean` | `true` |  |
| ok-text | 确认按钮的内容 | `string` | `-` |  |
| cancel-text | 取消按钮的内容 | `string` | `-` |  |
| ok-loading | 确认按钮是否为加载中状态 | `boolean` | `false` |  |
| ok-button-props | 确认按钮的Props | `ButtonProps` | `-` |  |
| cancel-button-props | 取消按钮的Props | `ButtonProps` | `-` |  |
| footer | 是否展示页脚部分 | `boolean` | `true` |  |
| render-to-body | 对话框是否挂载在 `body` 元素下 | `boolean` | `true` |  |
| popup-container | 弹出框的挂载容器 | `string \| HTMLElement` | `'body'` |  |
| mask-style | 蒙层的样式 | `CSSProperties` | `-` |  |
| modal-class | 对话框的类名 | `string \| any[]` | `-` |  |
| modal-style | 对话框的样式 | `CSSProperties` | `-` |  |
| on-before-ok | 触发 ok 事件前的回调函数。如果返回 false 则不会触发后续事件，也可使用 done 进行异步关闭。 | `(  done: (closed: boolean) => void) => void \| boolean \| Promise<void \| boolean>` | `-` | 2.7.0 |
| on-before-cancel | 触发 cancel 事件前的回调函数。如果返回 false 则不会触发后续事件。 | `() => boolean` | `-` | 2.7.0 |
| esc-to-close | 是否支持 ESC 键关闭对话框 | `boolean` | `true` | 2.15.0 |
| draggable | 是否支持拖动 | `boolean` | `false` | 2.19.0 |
| fullscreen | 是否开启全屏 | `boolean` | `false` | 2.19.0 |
| mask-animation-name | 遮罩层动画名字 | `string` | `-` | 2.24.0 |
| modal-animation-name | 对话框动画名字 | `string` | `-` | 2.24.0 |
| body-class | 对话框内容部分的类名 | `string \| any[]` | `-` | 2.31.0 |
| body-style | 对话框内容部分的样式 | `StyleValue` | `-` | 2.31.0 |
| hide-title | 是否隐藏标题 | `boolean` | `false` | 2.50.0 |

### `<modal>` Events

| 事件名       | 描述                         | 参数                              | 版本   |
| ------------ | ---------------------------- | --------------------------------- | :----- |
| ok           | 点击确定按钮时触发           | ev: `MouseEvent`                  |        |
| cancel       | 点击取消、关闭按钮时触发     | ev: `MouseEvent \| KeyboardEvent` |        |
| open         | 对话框打开后（动画结束）触发 | -                                 |        |
| close        | 对话框关闭后（动画结束）触发 | -                                 |        |
| before-open  | 对话框打开前触发             | -                                 | 2.16.0 |
| before-close | 对话框关闭前触发             | -                                 | 2.16.0 |

### `<modal>` Slots

| 插槽名 | 描述 | 参数 |
| ------ | :--: | ---- |
| title  | 标题 | -    |
| footer | 页脚 | -    |

### `<modal>` 全局方法

Modal提供的全局方法，可以通过以下三种方法使用：

1. 通过this.$modal调用
2. 在Composition API中，通过getCurrentInstance().appContext.config.globalProperties.$modal调用
3. 导入Modal，通过Modal本身调用

当通过 import 方式使用时，组件没有办法获取当前的 Vue Context，如 i18n 或 route 等注入在 AppContext 上的内容无法在内部使用，需要在调用时手动传入 AppContext，或者为组件全局指定 AppContext

```ts
import { createApp } from 'vue';
import { Modal } from '@sdata/web-vue';

const app = createApp(App);
Modal._context = app._context;
```

### ModalConfig

| 参数名 | 描述 | 类型 | 默认值 | 版本 |
| --- | --- | --- | :-: | :-- |
| title | 标题 | `RenderContent` | `-` |  |
| content | 内容 | `RenderContent` | `-` |  |
| footer | 页脚 | `boolean \| RenderContent` | `true` |  |
| closable | 是否显示关闭按钮 | `boolean` | `true` |  |
| okText | 确认按钮的内容 | `string` | `-` |  |
| cancelText | 取消按钮的内容 | `string` | `-` |  |
| okButtonProps | 确认按钮的Props | `ButtonProps` | `-` |  |
| cancelButtonProps | 取消按钮的Props | `ButtonProps` | `-` |  |
| okLoading | 确认按钮是否为加载中状态 | `boolean` | `false` |  |
| hideCancel | 是否隐藏取消按钮 | `boolean` | `false` |  |
| mask | 是否显示遮罩层 | `boolean` | `true` |  |
| simple | 是否开启简单模式 | `boolean` | `false` |  |
| maskClosable | 是否点击遮罩层可以关闭对话框 | `boolean` | `true` |  |
| maskStyle | 蒙层的样式 | `CSSProperties` | `-` |  |
| alignCenter | 对话框是否居中显示 | `boolean` | `true` |  |
| escToClose | 是否支持 ESC 键关闭对话框 | `boolean` | `true` | 2.15.0 |
| draggable | 是否支持拖动 | `boolean` | `false` | 2.19.0 |
| fullscreen | 是否开启全屏 | `boolean` | `false` | 2.19.0 |
| onOk | 点击确定按钮的回调函数 | `(e?: Event) => void` | `-` |  |
| onCancel | 点击取消按钮的回调函数 | `(e?: Event) => void` | `-` |  |
| onBeforeOk | 触发 ok 事件前的回调函数。如果返回 false 则不会触发后续事件，也可使用 done 进行异步关闭。 | `(    done: (closed: boolean) => void  ) => void \| boolean \| Promise<void \| boolean>` | `-` | 2.7.0 |
| onBeforeCancel | 触发 cancel 事件前的回调函数。如果返回 false 则不会触发后续事件。 | `() => boolean` | `-` | 2.7.0 |
| onOpen | 对话框打开后（动画结束）触发 | `() => void` | `-` |  |
| onClose | 对话框关闭后（动画结束）触发 | `() => void` | `-` |  |
| onBeforeOpen | 对话框打开前触发 | `() => void` | `-` | 2.16.0 |
| onBeforeClose | 对话框关闭前触发 | `() => void` | `-` | 2.16.0 |
| width | 对话框的宽度，不设置的情况下会使用样式中的宽度值 | `number \| string` | `-` | 2.12.0 |
| top | 对话框的距离顶部的高度，居中显示开启的情况下不生效 | `number \| string` | `-` | 2.12.0 |
| titleAlign | 标题的水平对齐方向 | `'start' \| 'center'` | `'center'` | 2.17.0 |
| renderToBody | 对话框是否挂载在 `body` 元素下 | `boolean` | `true` |  |
| popupContainer | 弹出框的挂载容器 | `string \| HTMLElement` | `'body'` |  |
| modalClass | 对话框的类名 | `string \| any[]` | `-` |  |
| modalStyle | 对话框的样式 | `CSSProperties` | `-` |  |
| maskAnimationName | 遮罩层动画名字 | `string` | `-` | 2.24.0 |
| modalAnimationName | 对话框动画名字 | `string` | `-` | 2.24.0 |
| hideTitle | 是否隐藏标题 | `boolean` | `false` | 2.50.0 |
| bodyClass | 对话框内容部分的类名 | `string \| any[]` | `-` |  |
| bodyStyle | 对话框内容部分的样式 | `StyleValue` | `-` |  |

### ModalReturn

| 参数名 | 描述       | 类型                                  | 默认值 | 版本   |
| ------ | ---------- | ------------------------------------- | :----: | :----- |
| close  | 关闭对话框 | `() => void`                          |  `-`   |        |
| update | 更新对话框 | `(config: ModalUpdateConfig) => void` |  `-`   | 2.43.2 |

### ModalMethod

| 参数名 | 描述 | 类型 | 默认值 |
| --- | --- | --- | :-: |
| open | 打开对话框 | `(config: ModalConfig, appContext?: AppContext) => ModalReturn` | `-` |
| confirm | 打开对话框（简单模式） | `(config: ModalConfig, appContext?: AppContext) => ModalReturn` | `-` |
| info | 打开信息对话框 | `(config: ModalConfig, appContext?: AppContext) => ModalReturn` | `-` |
| success | 打开成功对话框 | `(config: ModalConfig, appContext?: AppContext) => ModalReturn` | `-` |
| warning | 打开警告对话框 | `(config: ModalConfig, appContext?: AppContext) => ModalReturn` | `-` |
| error | 打开错误对话框 | `(config: ModalConfig, appContext?: AppContext) => ModalReturn` | `-` |

<script setup lang="ts">
import asyncDemo from '../../.vitepress/theme/generated/modal/async.vue';
const asyncSource = "<template>\n  <a-button @click=\"handleClick\">Open Modal<\/a-button>\n  <a-modal v-model:visible=\"visible\" @cancel=\"handleCancel\" :on-before-ok=\"handleBeforeOk\" unmountOnClose>\n    <template #title>\n      Title\n    <\/template>\n    <div>You can customize modal body text by the current situation. This modal will be closed immediately once you\n      press the OK button.\n    <\/div>\n  <\/a-modal>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const visible = ref(false);\n\n    const handleClick = () => {\n      visible.value = true;\n    };\n    const handleBeforeOk = async () => {\n      await new Promise(resolve => setTimeout(resolve, 3000));\n      return true;\n      // prevent close\n      // return false;\n    };\n    const handleCancel = () => {\n      visible.value = false;\n    }\n\n    return {\n      visible,\n      handleClick,\n      handleBeforeOk,\n      handleCancel\n    }\n  },\n}\n<\/script>";
const asyncTitle = "Async.Md";
const asyncDescription = "可以通过 on-before-ok 更简洁的实现异步关闭功能";
import basicDemo from '../../.vitepress/theme/generated/modal/basic.vue';
const basicSource = "<template>\n  <a-button @click=\"handleClick\">Open Modal<\/a-button>\n  <a-modal v-model:visible=\"visible\" @ok=\"handleOk\" @cancel=\"handleCancel\">\n    <template #title>\n      Title\n    <\/template>\n    <div>You can customize modal body text by the current situation. This modal will be closed immediately once you press the OK button.<\/div>\n  <\/a-modal>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const visible = ref(false);\n\n    const handleClick = () => {\n      visible.value = true;\n    };\n    const handleOk = () => {\n      visible.value = false;\n    };\n    const handleCancel = () => {\n      visible.value = false;\n    }\n\n    return {\n      visible,\n      handleClick,\n      handleOk,\n      handleCancel\n    }\n  },\n}\n<\/script>";
const basicTitle = "Basic.Md";
const basicDescription = "对话框的基本用法。";
import confirmDemo from '../../.vitepress/theme/generated/modal/confirm.vue';
const confirmSource = "<template>\n  <a-button type=\"primary\" @click=\"handleClick\">Confirm<\/a-button>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\nimport { Modal } from '@sdata/web-vue';\n\nexport default {\n  setup() {\n    const handleClick = () => {\n      Modal.confirm({\n        title: 'Confirm deletion',\n        content: 'Are you sure you want to delete the 3 selected items? Once you press the delete button, the items will be deleted immediately. You can’t undo this action.',\n        okButtonProps: {\n          status: 'danger'\n        }\n      })\n    };\n\n    return {\n      handleClick\n    }\n  },\n}\n<\/script>";
const confirmTitle = "Confirm.Md";
const confirmDescription = "使用Modal.confirm()，可以快速弹出对话框。";
import customDemo from '../../.vitepress/theme/generated/modal/custom.vue';
const customSource = "<template>\n  <a-button @click=\"handleClick\">Open Modal<\/a-button>\n  <a-modal :visible=\"visible\" @ok=\"handleOk\" @cancel=\"handleCancel\" okText=\"Confirm\" cancelText=\"Exit\" unmountOnClose>\n    <template #title>\n      Title\n    <\/template>\n    <div>You can customize modal body text by the current situation. This modal will be closed immediately once you press the OK button.<\/div>\n  <\/a-modal>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const visible = ref(false);\n\n    const handleClick = () => {\n      visible.value = true;\n    };\n    const handleOk = () => {\n      visible.value = false;\n    };\n    const handleCancel = () => {\n      visible.value = false;\n    }\n\n    return {\n      visible,\n      handleClick,\n      handleOk,\n      handleCancel\n    }\n  },\n}\n<\/script>";
const customTitle = "Custom.Md";
const customDescription = "设置 `okText` 与 `cancelText` 可以自定义按钮文字。";
import draggableDemo from '../../.vitepress/theme/generated/modal/draggable.vue';
const draggableSource = "<template>\n  <a-button @click=\"handleClick\">Open Draggable Modal<\/a-button>\n  <a-modal v-model:visible=\"visible\" @ok=\"handleOk\" @cancel=\"handleCancel\" draggable>\n    <template #title>\n      Title\n    <\/template>\n    <div>You can customize modal body text by the current situation. This modal will be closed immediately once you press the OK button.<\/div>\n  <\/a-modal>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const visible = ref(false);\n\n    const handleClick = () => {\n      visible.value = true;\n    };\n    const handleOk = () => {\n      visible.value = false;\n    };\n    const handleCancel = () => {\n      visible.value = false;\n    }\n\n    return {\n      visible,\n      handleClick,\n      handleOk,\n      handleCancel\n    }\n  },\n}\n<\/script>";
const draggableTitle = "Draggable.Md";
const draggableDescription = "开启 `draggable` 属性，允许用户拖动对话框。";
import formDemo from '../../.vitepress/theme/generated/modal/form.vue';
const formSource = "<template>\n  <a-button @click=\"handleClick\">Open Form Modal<\/a-button>\n  <a-modal v-model:visible=\"visible\" title=\"Modal Form\" @cancel=\"handleCancel\" @before-ok=\"handleBeforeOk\">\n    <a-form :model=\"form\">\n      <a-form-item field=\"name\" label=\"Name\">\n        <a-input v-model=\"form.name\" />\n      <\/a-form-item>\n      <a-form-item field=\"post\" label=\"Post\">\n        <a-select v-model=\"form.post\">\n          <a-option value=\"post1\">Post1<\/a-option>\n          <a-option value=\"post2\">Post2<\/a-option>\n          <a-option value=\"post3\">Post3<\/a-option>\n          <a-option value=\"post4\">Post4<\/a-option>\n        <\/a-select>\n      <\/a-form-item>\n    <\/a-form>\n  <\/a-modal>\n<\/template>\n\n<script>\nimport { reactive, ref } from 'vue';\n\nexport default {\n  setup() {\n    const visible = ref(false);\n    const form = reactive({\n      name: '',\n      post: ''\n    });\n\n    const handleClick = () => {\n      visible.value = true;\n    };\n    const handleBeforeOk = (done) => {\n      console.log(form)\n      window.setTimeout(() => {\n        done()\n        // prevent close\n        // done(false)\n      }, 3000)\n    };\n    const handleCancel = () => {\n      visible.value = false;\n    }\n\n    return {\n      visible,\n      form,\n      handleClick,\n      handleBeforeOk,\n      handleCancel\n    }\n  },\n}\n<\/script>";
const formTitle = "Form.Md";
const formDescription = "在对话框中使用表单";
import fullscreenDemo from '../../.vitepress/theme/generated/modal/fullscreen.vue';
const fullscreenSource = "<template>\n  <a-button @click=\"handleClick\">Open Modal<\/a-button>\n  <a-modal v-model:visible=\"visible\" @ok=\"handleOk\" @cancel=\"handleCancel\" fullscreen>\n    <template #title>\n      Title\n    <\/template>\n    <div>You can customize modal body text by the current situation. This modal will be closed immediately once you press the OK button.<\/div>\n  <\/a-modal>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const visible = ref(false);\n\n    const handleClick = () => {\n      visible.value = true;\n    };\n    const handleOk = () => {\n      visible.value = false;\n    };\n    const handleCancel = () => {\n      visible.value = false;\n    }\n\n    return {\n      visible,\n      handleClick,\n      handleOk,\n      handleCancel\n    }\n  },\n}\n<\/script>";
const fullscreenTitle = "Fullscreen.Md";
const fullscreenDescription = "开启 `fullscreen` 属性，可以让对话框占满整个容器。";
import functionDemo from '../../.vitepress/theme/generated/modal/function.vue';
const functionSource = "<template>\n  <a-button @click=\"handleClick\">Open Modal<\/a-button>\n<\/template>\n\n<script>\nimport { h } from 'vue';\nimport { Modal, Button } from '@sdata/web-vue';\n\nconst ModalContent = {\n  setup() {\n    const onClick = () => {\n      Modal.info({\n        title: 'Info Title',\n        content: 'This is an nest info message'\n      });\n    };\n\n    return () => h('div', {class: 'info-modal-content'}, [\n      h('span', {style: 'margin-bottom: 10px;'}, 'This is an info message'),\n      h(Button, {size: 'mini', onClick}, 'Open Nest Modal')\n    ])\n  },\n}\n\nexport default {\n  setup() {\n    const handleClick = () => {\n      Modal.info({\n        title: 'Info Title',\n        content: () => h(ModalContent)\n      });\n    };\n\n    return {\n      handleClick\n    }\n  },\n}\n<\/script>\n\n<style>\n.info-modal-content {\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  align-items: center;\n}\n<\/style>";
const functionTitle = "Function.Md";
const functionDescription = "通过函数的方式使用对话框。";
import noticeDemo from '../../.vitepress/theme/generated/modal/notice.vue';
const noticeSource = "<template>\n  <a-space>\n    <a-button @click=\"handleClickInfo\">Info<\/a-button>\n    <a-button @click=\"handleClickSuccess\" status=\"success\">Success<\/a-button>\n    <a-button @click=\"handleClickWarning\" status=\"warning\">Warning<\/a-button>\n    <a-button @click=\"handleClickError\" status=\"danger\">Error<\/a-button>\n  <\/a-space>\n<\/template>\n\n<script>\nimport { Modal } from '@sdata/web-vue';\n\nexport default {\n  setup() {\n    const handleClickInfo = () => {\n      Modal.info({\n        title: 'Info Notification',\n        content: 'This is an info description which directly indicates a neutral informative change or action.'\n      });\n    };\n    const handleClickSuccess = () => {\n      Modal.success({\n        title: 'Success Notification',\n        content: 'This is a success notification'\n      });\n    };\n    const handleClickWarning = () => {\n      Modal.warning({\n        title: 'Warning Notification',\n        content: 'This is a warning description which directly indicates a warning that might need attention.'\n      });\n    };\n    const handleClickError = () => {\n      Modal.error({\n        title: 'Error Notification',\n        content: 'This is an error description which directly indicates a dangerous or potentially negative action.'\n      });\n    };\n\n    return {\n      handleClickInfo,\n      handleClickSuccess,\n      handleClickWarning,\n      handleClickError\n    }\n  },\n}\n<\/script>";
const noticeTitle = "Notice.Md";
const noticeDescription = "有**info**, **success**, **warning**, **error**四种类型的消息提示，仅提供一个确认按钮用于关闭消息提示对话框。\n消息默认会默认开启 `simple` 和 `hideCancel`，如果想要取消可以再次设置。";
import widthDemo from '../../.vitepress/theme/generated/modal/width.vue';
const widthSource = "<template>\n  <a-button @click=\"handleClick\">Open Modal<\/a-button>\n  <a-modal width=\"auto\" v-model:visible=\"visible\" @ok=\"handleOk\" @cancel=\"handleCancel\">\n    <template #title>\n      Title\n    <\/template>\n    <div>You can customize modal body text by the current situation. This modal will be closed immediately once you press the OK button.<\/div>\n  <\/a-modal>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const visible = ref(false);\n\n    const handleClick = () => {\n      visible.value = true;\n    };\n    const handleOk = () => {\n      visible.value = false;\n    };\n    const handleCancel = () => {\n      visible.value = false;\n    }\n\n    return {\n      visible,\n      handleClick,\n      handleOk,\n      handleCancel\n    }\n  },\n}\n<\/script>";
const widthTitle = "Width.Md";
const widthDescription = "设置 `width=\"auto\"` 可以让对话框自适应宽度";
</script>

## 示例

<DemoBlock :title="asyncTitle" :description="asyncDescription" :code="asyncSource"

>   <asyncDemo />
> </DemoBlock>

<DemoBlock :title="basicTitle" :description="basicDescription" :code="basicSource"

>   <basicDemo />
> </DemoBlock>

<DemoBlock :title="confirmTitle" :description="confirmDescription" :code="confirmSource"

>   <confirmDemo />
> </DemoBlock>

<DemoBlock :title="customTitle" :description="customDescription" :code="customSource"

>   <customDemo />
> </DemoBlock>

<DemoBlock :title="draggableTitle" :description="draggableDescription" :code="draggableSource"

>   <draggableDemo />
> </DemoBlock>

<DemoBlock :title="formTitle" :description="formDescription" :code="formSource"

>   <formDemo />
> </DemoBlock>

<DemoBlock :title="fullscreenTitle" :description="fullscreenDescription" :code="fullscreenSource"

>   <fullscreenDemo />
> </DemoBlock>

<DemoBlock :title="functionTitle" :description="functionDescription" :code="functionSource"

>   <functionDemo />
> </DemoBlock>

<DemoBlock :title="noticeTitle" :description="noticeDescription" :code="noticeSource"

>   <noticeDemo />
> </DemoBlock>

<DemoBlock :title="widthTitle" :description="widthDescription" :code="widthSource"

>   <widthDemo />
> </DemoBlock>
