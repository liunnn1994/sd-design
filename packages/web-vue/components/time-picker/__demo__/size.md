```yaml
title:
  zh-CN: 尺寸
  en-US: Size
```

## zh-CN

有四种尺寸可供选择。

---

## en-US

There are four sizes.

---

```vue
<template>
  <div style="marginBottom: 20px">
    <sd-radio-group v-model="size" type="button">
      <sd-radio value="mini">mini</sd-radio>
      <sd-radio value="small">small</sd-radio>
      <sd-radio value="medium">medium</sd-radio>
      <sd-radio value="large">large</sd-radio>
    </sd-radio-group>
  </div>
  <sd-time-picker style="width: 194px;" :size="size" />
</template>
<script>
  export default {
    data() {
      return {
        size: 'small',
      };
    },
  };
</script>
```
