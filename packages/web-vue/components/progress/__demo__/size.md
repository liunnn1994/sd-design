```yaml
title:
  zh-CN: 进度条大小
  en-US: Progress Size
```

## zh-CN

通过 `size` 设置进度条的大小

---

## en-US

Set the size of the progress bar through `size`

---

```vue
<template>
  <sd-space direction="vertical" size="large" :style="{ width: '50%' }">
    <sd-radio-group v-model="size" type="button">
      <sd-radio value="small">Small</sd-radio>
      <sd-radio value="medium">Medium</sd-radio>
      <sd-radio value="large">Large</sd-radio>
    </sd-radio-group>
    <sd-progress :size="size" :percent="0.2" />
    <sd-progress status="warning" :size="size" :percent="0.2" />
    <sd-progress status="danger" :size="size" :percent="0.2" />
    <sd-space>
      <sd-progress type="circle" :size="size" :percent="0.2" />
      <sd-progress type="circle" status="warning" :size="size" :percent="0.2" />
      <sd-progress type="circle" status="danger" :size="size" :percent="0.2" />
    </sd-space>
  </sd-space>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      return {
        size: ref('medium'),
      };
    },
  };
</script>
```
