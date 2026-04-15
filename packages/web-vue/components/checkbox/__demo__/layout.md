```yaml
title:
  zh-CN: 布局
  en-US: Layout
```

## zh-CN

使用 `<sd-checkbox-group>` 传入 `<sd-checkbox>`，配合 `<sd-grid>` 组件实现灵活的布局。

---

## en-US

We can use `<sd-checkbox>` and `<sd-grid>` in `<sd-checkbox-group>`, to implement complex layout.

---

```vue
<template>
  <sd-checkbox-group v-model="checkedValue">
    <sd-grid :cols="3" :colGap="24" :rowGap="16">
      <sd-grid-item>
        <sd-checkbox value="1">Option 1</sd-checkbox>
      </sd-grid-item>
      <sd-grid-item>
        <sd-checkbox value="2" disabled>Option 2</sd-checkbox>
      </sd-grid-item>
      <sd-grid-item>
        <sd-checkbox value="3">Option 3</sd-checkbox>
      </sd-grid-item>
      <sd-grid-item>
        <sd-checkbox value="4">Option 4</sd-checkbox>
      </sd-grid-item>
      <sd-grid-item>
        <sd-checkbox value="5">Option 5</sd-checkbox>
      </sd-grid-item>
    </sd-grid>
  </sd-checkbox-group>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const checkedValue = ref(['1', '2']);

      return {
        checkedValue,
      };
    },
  };
</script>
```
