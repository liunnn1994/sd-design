```yaml
title:
  zh-CN: 尺寸
  en-US: Size
```

## zh-CN

设置 `size` 可以使用四种尺寸（`mini` `small` `medium` `large`）的输入框。高度分别对应 24px、28px、32px、36px。

---

## en-US

Setting `size` can use four sizes (`mini` `small` `medium` `large`). The height corresponds to 24px, 28px, 32px, 36px.

---

```vue
<template>
  <div style="margin-bottom: 20px;">
    <sd-radio-group v-model="size" type="button">
      <sd-radio value="mini">mini</sd-radio>
      <sd-radio value="small">small</sd-radio>
      <sd-radio value="medium">medium</sd-radio>
      <sd-radio value="large">large</sd-radio>
    </sd-radio-group>
  </div>
  <sd-date-picker :size="size" style="width: 254px;" />
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
