```yaml
title:
  zh-CN: 固定状态改变回调
  en-US: Callback
```

## zh-CN

当固定状态发生改变时，会触发事件。

---

## en-US

Callback when the fixed state changes.

---

```vue
<template>
  <sd-affix :offsetBottom="80" @change="onChange">
    <sd-button type="primary">80px to affix bottom</sd-button>
  </sd-affix>
</template>
<script>
  import { defineComponent } from 'vue';

  export default defineComponent({
    setup() {
      const onChange = (fixed) => {
        console.log(`${fixed}`);
      };
      return {
        onChange,
      };
    },
  });
</script>
```
