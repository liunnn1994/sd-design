```yaml
title:
  zh-CN: 自定义图片和文案
  en-US: Custom Image & Description
```

## zh-CN

通过 `image` 插槽自定义图标、图片，或通过内容修改文案。

---

## en-US

Customize icons and pictures through the `image` slot, or modify the text through the content.

---

```vue
<template>
  <sd-empty>
    <template #image>
      <icon-exclamation-circle-fill />
    </template>
    No data, please reload!
  </sd-empty>
</template>

<script>
  import { IconExclamationCircleFill } from '@sdata/web-vue/es/icon';

  export default {
    components: {
      IconExclamationCircleFill,
    },
  };
</script>
```
