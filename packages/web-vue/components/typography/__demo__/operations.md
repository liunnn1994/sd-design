```yaml
title:
  zh-CN: 可交互
  en-US: Interactive
```

## zh-CN

提供复制、编辑文本等功能。

---

## en-US

Provide functions such as copying and editing text.

---

```vue
<template>
  <sd-typography>
    <sd-typography-paragraph copyable> Click the icon to copy this text. </sd-typography-paragraph>
    <sd-typography-paragraph editable v-model:editText="str">
      {{ str }}
    </sd-typography-paragraph>
  </sd-typography>
</template>
<script>
  import { defineComponent, ref } from 'vue';
  export default defineComponent({
    setup() {
      const str = ref('Click the icon to edit this text.');
      return {
        str,
      };
    },
  });
</script>
```
