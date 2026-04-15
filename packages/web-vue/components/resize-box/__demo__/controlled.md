```yaml
title:
  zh-CN: 受控的高宽
  en-US: two-way binding
```

## zh-CN

`ResizeBox` 的 `width` 和 `height` 都支持 `v-model`。

---

## en-US

Both `width` and `height` of `ResizeBox` support `v-model`..

---

```vue
<template>
  <div>
    <sd-resize-box
      :directions="['right', 'bottom']"
      :style="{ minWidth: '100px', maxWidth: '100%', textAlign: 'center' }"
      v-model:width="width"
      v-model:height="height"
    >
      <sd-typography-paragraph
        >We are building the future of content discovery and creation.</sd-typography-paragraph
      >
      <sd-divider />
      <sd-typography-paragraph>
        ByteDance's content platforms enable people to enjoy content powered by AI technology. We
        inform, entertain, and inspire people across language, culture and geography.
      </sd-typography-paragraph>
      <sd-divider>ByteDance</sd-divider>
      <sd-typography-paragraph
        >Yiming Zhang is the founder and CEO of ByteDance.</sd-typography-paragraph
      >
    </sd-resize-box>
  </div>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const width = ref(500);
      const height = ref(200);
      return {
        width,
        height,
      };
    },
  };
</script>
```
