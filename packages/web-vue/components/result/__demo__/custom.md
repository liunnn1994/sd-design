```yaml
title:
  zh-CN: 自定义状态
  en-US: Custom Status
```

## zh-CN

自定义状态。需要传入指定的图标

---

## en-US

Custom Status. You need to set the Icon property

---

```vue
<template>
  <sd-result :status="null" title="This is title content" subtitle="This is subtitle content">
    <template #icon>
      <IconFaceSmileFill />
    </template>
    <template #extra>
      <sd-space>
        <sd-button type="secondary">Again</sd-button>
        <sd-button type="primary">Back</sd-button>
      </sd-space>
    </template>
  </sd-result>
</template>
<script>
  import { IconFaceSmileFill } from '@sdata/web-vue/es/icon';

  export default {
    components: {
      IconFaceSmileFill,
    },
  };
</script>
```
