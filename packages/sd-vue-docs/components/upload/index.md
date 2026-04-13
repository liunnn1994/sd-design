---
title: "upload"
outline: "deep"
---

```yaml
meta:
  type: 组件
  category: 数据输入
title: 上传 Upload
description: 用户可传输文件或提交相应的内容。
```
















## API


### `<upload>` Props

|参数名|描述|类型|默认值|版本|
|---|---|---|:---:|:---|
|file-list **(v-model)**|文件列表|`FileItem[]`|`-`||
|default-file-list|默认的文件列表（非受控状态）|`FileItem[]`|`[]`||
|accept|接收的上传文件类型，具体参考 [HTML标准](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#htmlattrdefaccept "_blank")|`string`|`-`||
|action|上传的URL|`string`|`-`||
|disabled|是否禁用|`boolean`|`false`||
|multiple|是否支持多文件上传|`boolean`|`false`||
|directory|是否支持文件夹上传（需要浏览器支持）|`boolean`|`false`||
|draggable|是否支持拖拽上传|`boolean`|`false`||
|tip|提示文字|`string`|`-`||
|headers|上传请求附加的头信息|`Record<string, string>`|`-`||
|data|上传请求附加的数据|`Record<string, string \| Blob>\| ((fileItem: FileItem) => Record<string, string \| Blob>)`|`-`||
|name|上传的文件名|`string \| ((fileItem: FileItem) => string)`|`-`||
|with-credentials|上传请求是否携带 cookie|`boolean`|`false`||
|custom-request|自定义上传行为|`(option: RequestOption) => UploadRequest`|`-`||
|limit|限制上传文件的数量。`0`表示不限制|`number`|`0`||
|auto-upload|是否自动上传文件|`boolean`|`true`||
|show-file-list|是否显示文件列表|`boolean`|`true`||
|show-remove-button|是否显示删除按钮|`boolean`|`true`|2.11.0|
|show-retry-button|是否显示重试按钮|`boolean`|`true`|2.11.0|
|show-cancel-button|是否显示取消按钮|`boolean`|`true`|2.11.0|
|show-upload-button|是否显示上传按钮。2.14.0 版本新增 `showOnExceedLimit` 支持|`boolean \| { showOnExceedLimit: boolean }`|`true`|2.11.0|
|show-preview-button|照片墙是否显示预览按钮|`boolean`|`true`|2.42.0|
|download|是否在 `<a>` 链接上添加 download 属性|`boolean`|`false`|2.11.0|
|show-link|在列表模式下，如果上传的文件存在 URL 则展示链接。如果关闭仅展示文字并且点击可以触发 `preview` 事件。|`boolean`|`true`|2.13.0|
|image-loading|`<img>` 的原生 HTML 属性，需要浏览器支持|`'eager' \| 'lazy'`|`-`|2.11.0|
|list-type|图片列表类型|`'text' \| 'picture' \| 'picture-card'`|`'text'`||
|response-url-key|Response中获取图片URL的key，开启后会用上传的图片替换预加载的图片|`string \| ((fileItem: FileItem) => string)`|`-`||
|custom-icon|自定义图标|`CustomIcon`|`-`||
|image-preview|是否使用 ImagePreview 组件进行预览|`boolean`|`false`|2.14.0|
|on-before-upload|上传文件前触发|`(file: File) => boolean \| Promise<boolean \| File>`|`-`||
|on-before-remove|移除文件前触发|`(fileItem: FileItem) => Promise<boolean>`|`-`||
|on-button-click|点击上传按钮触发（如果返回 Promise 则会关闭默认 input 上传）|`(event: Event) => Promise<FileList> \| void`|`-`||
### `<upload>` Events

|事件名|描述|参数|
|---|---|---|
|exceed-limit|上传的文件超出限制后触发|fileList: `FileItem[]`<br>files: `File[]`|
|change|上传的文件状态发生改变时触发|fileList: `FileItem[]`<br>fileItem: `fileItem`|
|progress|上传中的文件进度改变时触发|fileItem: `fileItem`<br>ev: `ProgressEvent`|
|preview|点击图片预览时的触发|fileItem: `FileItem`|
|success|上传成功时触发|fileItem: `FileItem`|
|error|上传失败时触发|fileItem: `FileItem`|
### `<upload>` Methods

|方法名|描述|参数|返回值|版本|
|---|---|---|---|:---|
|submit|上传文件（已经初始化完成的文件）|fileItem: `FileItem`|-||
|abort|中止上传|fileItem: `FileItem`|-||
|updateFile|更新文件|id: `string`<br>file: `File`|-||
|upload|上传文件|files: `File[]`|-|2.41.0|
### `<upload>` Slots

|插槽名|描述|参数|版本|
|---|:---:|---|:---|
|extra-button|上传列表额外按钮|fileItem: `FileItem`|2.43.0|
|image|自定义图片|fileItem: `FileItem`|2.23.0|
|file-name|文件名称|-|2.23.0|
|file-icon|文件图标|-|2.23.0|
|remove-icon|删除图标|-|2.23.0|
|preview-icon|预览图标|-|2.23.0|
|cancel-icon|取消图标|-|2.23.0|
|start-icon|开始图标|-|2.23.0|
|error-icon|失败图标|-|2.23.0|
|success-icon|成功图标|-|2.23.0|
|retry-icon|重试图标|-|2.23.0|
|upload-button|上传按钮|-||
|upload-item|上传列表的项目|fileItem: `FileItem`<br>index: `number`||




### FileItem

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|uid|当前上传文件的唯一标示|`string`|`-`|
|status|当前上传文件的状态|`FileStatus`|`-`|
|file|文件对象|`File`|`-`|
|percent|上传进度百分比|`number`|`-`|
|response|当前文件上传请求返回的响应|`any`|`-`|
|url|文件地址|`string`|`-`|
|name|文件名|`string`|`-`|



### CustomIcon

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|startIcon|开始图标|`RenderFunction`|`-`|
|cancelIcon|取消图标|`RenderFunction`|`-`|
|retryIcon|重试图标|`RenderFunction`|`-`|
|successIcon|成功图标|`RenderFunction`|`-`|
|errorIcon|失败图标|`RenderFunction`|`-`|
|removeIcon|移除图标|`RenderFunction`|`-`|
|previewIcon|预览图标|`RenderFunction`|`-`|
|fileIcon|文件图标|`(fileItem: FileItem) => VNode`|`-`|
|fileName|文件名|`(fileItem: FileItem) => string \| VNode`|`-`|



### RequestOption

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|action|上传的URL|`string`|`-`|
|headers|请求报文的头信息|`Record<string, string>`|`-`|
|name|上传文件的文件名|`string \| ((fileItem: FileItem) => string)`|`-`|
|fileItem|上传文件|`FileItem`|`-`|
|data|附加的请求信息|`Record<string, string \| Blob>    \| ((fileItem: FileItem) => Record<string, string \| Blob>)`|`-`|
|withCredentials|是否携带cookie信息|`boolean`|`false`|
|onProgress|更新当前文件的上传进度。percent: 当前上传进度百分比|`(percent: number, event?: ProgressEvent) => void`|`-`|
|onSuccess|上传成功后，调用onSuccess方法，传入的response参数将会附加到当前上传文件的response字段上|`(response?: any) => void`|`-`|
|onError|上传失败后，调用onError方法，传入的response参数将会附加到当前上传文件的response字段上|`(response?: any) => void`|`-`|



### UploadRequest

|参数名|描述|类型|默认值|
|---|---|---|:---:|
|abort|终止上传|`() => void`|`-`|

<script setup lang="ts">
import avatarDemo from '../../.vitepress/theme/generated/upload/avatar.vue';
const avatarSource = "<template>\n  <a-space direction=\"vertical\" :style=\"{ width: '100%' }\">\n    <a-upload\n      action=\"/\"\n      :fileList=\"file ? [file] : []\"\n      :show-file-list=\"false\"\n      @change=\"onChange\"\n      @progress=\"onProgress\"\n    >\n      <template #upload-button>\n        <div\n          :class=\"`sd-upload-list-item${\n            file && file.status === 'error' ? ' sd-upload-list-item-error' : ''\n          }`\"\n        >\n          <div\n            class=\"sd-upload-list-picture custom-upload-avatar\"\n            v-if=\"file && file.url\"\n          >\n            <img :src=\"file.url\" />\n            <div class=\"sd-upload-list-picture-mask\">\n              <IconEdit />\n            <\/div>\n            <a-progress\n              v-if=\"file.status === 'uploading' && file.percent < 100\"\n              :percent=\"file.percent\"\n              type=\"circle\"\n              size=\"mini\"\n              :style=\"{\n                position: 'absolute',\n                left: '50%',\n                top: '50%',\n                transform: 'translateX(-50%) translateY(-50%)',\n              }\"\n            />\n          <\/div>\n          <div class=\"sd-upload-picture-card\" v-else>\n            <div class=\"sd-upload-picture-card-text\">\n              <IconPlus />\n              <div style=\"margin-top: 10px; font-weight: 600\">Upload<\/div>\n            <\/div>\n          <\/div>\n        <\/div>\n      <\/template>\n    <\/a-upload>\n  <\/a-space>\n<\/template>\n\n<script>\nimport { IconEdit, IconPlus } from '@sd-design/web-vue/es/icon';\nimport { ref } from 'vue';\n\nexport default {\n  components: {IconPlus, IconEdit},\n  setup() {\n    const file = ref();\n\n    const onChange = (_, currentFile) => {\n      file.value = {\n        ...currentFile,\n        // url: URL.createObjectURL(currentFile.file),\n      };\n    };\n    const onProgress = (currentFile) => {\n      file.value = currentFile;\n    };\n    return {\n      file,\n      onChange,\n      onProgress\n    }\n  },\n};\n<\/script>";
const avatarTitle = "Avatar.Md";
const avatarDescription = "点击上传用户头像，可使用 beforeUpload 限制用户上传的图片格式和大小。";
import basicDemo from '../../.vitepress/theme/generated/upload/basic.vue';
const basicSource = "<template>\n  <a-space direction=\"vertical\" :style=\"{ width: '100%' }\">\n    <a-upload action=\"/\" />\n    <a-upload action=\"/\" disabled style=\"margin-top: 40px;\"/>\n  <\/a-space>\n<\/template>";
const basicTitle = "Basic.Md";
const basicDescription = "上传组件的基本用法。";
import beforeRemoveDemo from '../../.vitepress/theme/generated/upload/beforeRemove.vue';
const beforeRemoveSource = "<template>\n  <a-space direction=\"vertical\" :style=\"{ width: '100%' }\">\n    <a-upload\n      action=\"/\"\n      :default-file-list=\"[\n        {\n          uid: '-2',\n          name: 'light.png',\n          url: '//p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/a8c8cdb109cb051163646151a4a5083b.png~tplv-uwbnlip3yd-webp.webp',\n        },\n        {\n          uid: '-1',\n          name: 'ice.png',\n          url: '//p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/3ee5f13fb09879ecb5185e440cef6eb9.png~tplv-uwbnlip3yd-webp.webp',\n        },\n      ]\"\n      @before-remove=\"beforeRemove\"\n    />\n  <\/a-space>\n<\/template>\n\n<script>\nimport { Modal } from '@sd-design/web-vue';\n\nexport default {\n  setup() {\n    const beforeRemove = (file) => {\n      return new Promise((resolve, reject) => {\n        Modal.confirm({\n          title: 'on-before-remove',\n          content: `确认删除 ${file.name}`,\n          onOk: () => resolve(true),\n          onCancel: () => reject('cancel'),\n        });\n      });\n    };\n\n    return {\n      beforeRemove\n    }\n  },\n};\n<\/script>";
const beforeRemoveTitle = "Before Remove.Md";
const beforeRemoveDescription = "`on-before-remove` 会在每一个文件移除之前执行。如果返回 `false` 或者` Promise.reject`， 那么将会取消当前文件的操作。";
import beforeUploadDemo from '../../.vitepress/theme/generated/upload/beforeUpload.vue';
const beforeUploadSource = "<template>\n  <a-space direction=\"vertical\" :style=\"{ width: '100%' }\">\n    <a-upload action=\"/\" @before-upload=\"beforeUpload\" />\n  <\/a-space>\n<\/template>\n\n<script>\nimport { Modal } from '@sd-design/web-vue';\n\nexport default {\n  setup() {\n    const beforeUpload = (file) => {\n      return new Promise((resolve, reject) => {\n        Modal.confirm({\n          title: 'beforeUpload',\n          content: `确认上传 ${file.name}`,\n          onOk: () => resolve(true),\n          onCancel: () => reject('cancel'),\n        });\n      });\n    };\n    return {\n      beforeUpload\n    }\n  },\n};\n<\/script>";
const beforeUploadTitle = "Before Upload.Md";
const beforeUploadDescription = "`beforeUpload` 会在每一个文件上传之前执行。如果返回 `false` 或者` Promise.reject`， 那么将会取消当前文件的上传。";
import customButtonDemo from '../../.vitepress/theme/generated/upload/customButton.vue';
const customButtonSource = "<template>\n  <a-upload action=\"/\">\n    <template #upload-button>\n      <div\n        style=\"\n        background-color: var(--color-fill-2);\n        color: var(--color-text-1);\n        border: 1px dashed var(--color-fill-4);\n        height: 158px;\n        width: 380px;\n        border-radius: 2;\n        line-height: 158px;\n        text-align: center;\"\n      >\n        <div>\n          Drag the file here or\n          <span style=\"color: #3370FF\"> Click to upload<\/span>\n        <\/div>\n      <\/div>\n    <\/template>\n  <\/a-upload>\n<\/template>";
const customButtonTitle = "Custom Button.Md";
const customButtonDescription = "可以通过插槽 `upload-button` 传入自定义内容作为文件上传的触发节点。";
import customIconDemo from '../../.vitepress/theme/generated/upload/customIcon.vue';
const customIconSource = "<template>\n  <div>\n    <div style=\"margin-bottom: 20px;\">\n      <a-space>\n        <span>Type: <\/span>\n        <a-radio-group v-model=\"type\">\n          <a-radio value=\"text\">text<\/a-radio>\n          <a-radio value=\"picture\">picture<\/a-radio>\n          <a-radio value=\"picture-card\">picture-card<\/a-radio>\n        <\/a-radio-group>\n      <\/a-space>\n    <\/div>\n    <a-upload\n      action=\"/\"\n      :list-type=\"type\"\n      :default-file-list=\"[\n        {\n          uid: '-1',\n          name: 'ice.png',\n          url: '//p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/3ee5f13fb09879ecb5185e440cef6eb9.png~tplv-uwbnlip3yd-webp.webp',\n        },\n        {\n          uid: '-3',\n          name: 'light.png',\n          url: '//p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/a8c8cdb109cb051163646151a4a5083b.png~tplv-uwbnlip3yd-webp.webp',\n        },\n      ]\"\n      :custom-icon=\"getCustomIcon()\"\n    />\n  <\/div>\n<\/template>\n\n<script>\nimport { h, ref } from 'vue';\nimport { IconUpload, IconFileAudio, IconClose, IconFaceFrownFill } from '@sd-design/web-vue/es/icon';\n\nexport default {\n  setup() {\n    const type = ref('text');\n    const getCustomIcon = () => {\n      return {\n        retryIcon: () => h(IconUpload),\n        cancelIcon: () => h(IconClose),\n        fileIcon: () => h(IconFileAudio),\n        removeIcon: () => h(IconClose),\n        errorIcon: () => h(IconFaceFrownFill),\n        fileName: (file) => {\n          return `文件名： ${file.name}`\n        },\n      };\n    };\n\n    return {\n      type,\n      getCustomIcon\n    }\n  },\n};\n<\/script>";
const customIconTitle = "Custom Icon.Md";
const customIconDescription = "自定义图标";
import directoryDemo from '../../.vitepress/theme/generated/upload/directory.vue';
const directorySource = "<template>\n  <a-space direction=\"vertical\" :style=\"{ width: '100%' }\">\n    <a-upload action=\"/\" directory />\n  <\/a-space>\n<\/template>";
const directoryTitle = "Directory.Md";
const directoryDescription = "可以通过 `directory` 开启文件夹上传";
import draggableDemo from '../../.vitepress/theme/generated/upload/draggable.vue';
const draggableSource = "<template>\n  <a-upload draggable action=\"/\" />\n<\/template>";
const draggableTitle = "Draggable.Md";
const draggableDescription = "通过设置 `draggable` 开启对拖拽的支持。";
import limitDemo from '../../.vitepress/theme/generated/upload/limit.vue';
const limitSource = "<template>\n  <a-upload multiple action=\"/\" :limit=\"3\" />\n<\/template>";
const limitTitle = "Limit.Md";
const limitDescription = "通过 `limit` 限制上传的最大数量。超出后上传按钮会隐藏.";
import pictureCardDemo from '../../.vitepress/theme/generated/upload/pictureCard.vue';
const pictureCardSource = "<template>\n  <a-upload\n    list-type=\"picture-card\"\n    action=\"/\"\n    :default-file-list=\"fileList\"\n    image-preview\n  />\n<\/template>\n\n<script>\nexport default {\n  setup() {\n    const fileList = [\n      {\n        uid: '-2',\n        name: '20200717-103937.png',\n        url: '//p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/a8c8cdb109cb051163646151a4a5083b.png~tplv-uwbnlip3yd-webp.webp',\n      },\n      {\n        uid: '-1',\n        name: 'hahhahahahaha.png',\n        url: '//p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/e278888093bef8910e829486fb45dd69.png~tplv-uwbnlip3yd-webp.webp',\n      },\n    ];\n\n    return {\n      fileList\n    }\n  },\n};\n<\/script>";
const pictureCardTitle = "Picture Card.Md";
const pictureCardDescription = "通过设置 `list-type=\"picture-card\"` 开启照片墙模式。";
import pictureListDemo from '../../.vitepress/theme/generated/upload/pictureList.vue';
const pictureListSource = "<template>\n  <a-upload\n    list-type=\"picture\"\n    action=\"/\"\n    :default-file-list=\"fileList\"\n  />\n<\/template>\n\n<script>\nexport default {\n  setup() {\n    const fileList = [\n      {\n        uid: '-2',\n        name: '20200717-103937.png',\n        url: '//p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/a8c8cdb109cb051163646151a4a5083b.png~tplv-uwbnlip3yd-webp.webp',\n      },\n      {\n        uid: '-1',\n        name: 'hahhahahahaha.png',\n        url: '//p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/e278888093bef8910e829486fb45dd69.png~tplv-uwbnlip3yd-webp.webp',\n      },\n    ];\n\n    return {\n      fileList\n    }\n  },\n};\n<\/script>";
const pictureListTitle = "Picture List.Md";
const pictureListDescription = "通过设置 `list-type=\"picture\"` 开启图片列表样式";
import requestDemo from '../../.vitepress/theme/generated/upload/request.vue';
const requestSource = "<template>\n  <a-upload :custom-request=\"customRequest\" />\n<\/template>\n\n<script>\nexport default {\n  setup() {\n    const customRequest = (option) => {\n      const {onProgress, onError, onSuccess, fileItem, name} = option\n      const xhr = new XMLHttpRequest();\n      if (xhr.upload) {\n        xhr.upload.onprogress = function (event) {\n          let percent;\n          if (event.total > 0) {\n            // 0 ~ 1\n            percent = event.loaded / event.total;\n          }\n          onProgress(percent, event);\n        };\n      }\n      xhr.onerror = function error(e) {\n        onError(e);\n      };\n      xhr.onload = function onload() {\n        if (xhr.status < 200 || xhr.status >= 300) {\n          return onError(xhr.responseText);\n        }\n        onSuccess(xhr.response);\n      };\n\n      const formData = new FormData();\n      formData.append(name || 'file', fileItem.file);\n      xhr.open('post', '//upload-z2.qbox.me/', true);\n      xhr.send(formData);\n\n      return {\n        abort() {\n          xhr.abort()\n        }\n      }\n    };\n\n    return {\n      customRequest\n    }\n  },\n}\n<\/script>";
const requestTitle = "Request.Md";
const requestDescription = "可以通过 `custom-request` 实现自定义上传请求。";
import submitDemo from '../../.vitepress/theme/generated/upload/submit.vue';
const submitSource = "<template>\n  <div>\n    <a-upload\n      action=\"/\"\n      :auto-upload=\"false\"\n      ref=\"uploadRef\"\n      @change=\"onChange\"\n      multiple\n    >\n      <template #upload-button>\n        <a-space>\n          <a-button> select file<\/a-button>\n          <a-button type=\"primary\" @click=\"submit\"> start upload<\/a-button>\n          <a-button type=\"primary\" @click=\"submitOne\">\n            only upload one\n          <\/a-button>\n        <\/a-space>\n      <\/template>\n    <\/a-upload>\n  <\/div>\n<\/template>\n\n<script>\nimport { ref } from 'vue';\n\nexport default {\n  setup() {\n    const uploadRef = ref();\n    const files = ref([]);\n\n    const submitOne = (e) => {\n      e.stopPropagation();\n      console.log(files.value);\n      uploadRef.value.submit(files.value.find((x) => x.status === 'init'));\n    };\n\n    const submit = (e) => {\n      e.stopPropagation();\n      uploadRef.value.submit();\n    };\n\n    const onChange = (fileList) => {\n      files.value = fileList;\n    };\n\n    return {\n      uploadRef,\n      files,\n      submitOne,\n      submit,\n      onChange,\n    };\n  },\n};\n<\/script>";
const submitTitle = "Submit.Md";
const submitDescription = "设置 `auto-upload` 为 `false` 时候，可以通过调用 `submit` 方法进行手动上传。";
import uploadListDemo from '../../.vitepress/theme/generated/upload/uploadList.vue';
const uploadListSource = "<template>\n  <a-upload action=\"/\" :default-file-list=\"fileList\" />\n<\/template>\n\n<script>\nexport default {\n  setup() {\n    const fileList = [\n      {\n        uid: '-1',\n        name: 'ice.png',\n        url: '//p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/3ee5f13fb09879ecb5185e440cef6eb9.png~tplv-uwbnlip3yd-webp.webp',\n      },\n      {\n        status: 'error',\n        uid: '-2',\n        percent: 0,\n        response: '上传错误提示',\n        name: 'cat.png',\n        url: '//p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/e278888093bef8910e829486fb45dd69.png~tplv-uwbnlip3yd-webp.webp',\n      },\n      {\n        uid: '-3',\n        name: 'light.png',\n        url: '//p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/a8c8cdb109cb051163646151a4a5083b.png~tplv-uwbnlip3yd-webp.webp',\n      },\n    ];\n\n    return {\n      fileList\n    }\n  },\n};\n<\/script>";
const uploadListTitle = "Upload List.Md";
const uploadListDescription = "可以指定默认的已上传文件列表。";
</script>

## 示例


<DemoBlock
  :title="avatarTitle"
  :description="avatarDescription"
  :code="avatarSource"
>
  <avatarDemo />
</DemoBlock>

<DemoBlock
  :title="basicTitle"
  :description="basicDescription"
  :code="basicSource"
>
  <basicDemo />
</DemoBlock>

<DemoBlock
  :title="beforeRemoveTitle"
  :description="beforeRemoveDescription"
  :code="beforeRemoveSource"
>
  <beforeRemoveDemo />
</DemoBlock>

<DemoBlock
  :title="beforeUploadTitle"
  :description="beforeUploadDescription"
  :code="beforeUploadSource"
>
  <beforeUploadDemo />
</DemoBlock>

<DemoBlock
  :title="customButtonTitle"
  :description="customButtonDescription"
  :code="customButtonSource"
>
  <customButtonDemo />
</DemoBlock>

<DemoBlock
  :title="customIconTitle"
  :description="customIconDescription"
  :code="customIconSource"
>
  <customIconDemo />
</DemoBlock>

<DemoBlock
  :title="directoryTitle"
  :description="directoryDescription"
  :code="directorySource"
>
  <directoryDemo />
</DemoBlock>

<DemoBlock
  :title="draggableTitle"
  :description="draggableDescription"
  :code="draggableSource"
>
  <draggableDemo />
</DemoBlock>

<DemoBlock
  :title="limitTitle"
  :description="limitDescription"
  :code="limitSource"
>
  <limitDemo />
</DemoBlock>

<DemoBlock
  :title="pictureCardTitle"
  :description="pictureCardDescription"
  :code="pictureCardSource"
>
  <pictureCardDemo />
</DemoBlock>

<DemoBlock
  :title="pictureListTitle"
  :description="pictureListDescription"
  :code="pictureListSource"
>
  <pictureListDemo />
</DemoBlock>

<DemoBlock
  :title="requestTitle"
  :description="requestDescription"
  :code="requestSource"
>
  <requestDemo />
</DemoBlock>

<DemoBlock
  :title="submitTitle"
  :description="submitDescription"
  :code="submitSource"
>
  <submitDemo />
</DemoBlock>

<DemoBlock
  :title="uploadListTitle"
  :description="uploadListDescription"
  :code="uploadListSource"
>
  <uploadListDemo />
</DemoBlock>
