```yaml
title:
  zh-CN: 双向绑定
  en-US: Two-way binding
```

## zh-CN

通过 `v-model` 实现值的双向绑定

---

## en-US

Support two-way binding through `v-model`

---

```vue
<template>
  <sd-space>
    <sd-date-picker v-model="value" style="width: 200px;" />
    <sd-range-picker v-model="rangeValue" style="width: 300px;" />
  </sd-space>
</template>
<script>
  export default {
    data() {
      return {
        value: Date.now(),
        rangeValue: [Date.now(), Date.now()],
      };
    },
  };
</script>
```
