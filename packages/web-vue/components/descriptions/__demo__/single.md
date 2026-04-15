```yaml
title:
  zh-CN: 单列样式
  en-US: Single Row
```

## zh-CN

单列的描述列表样式。

---

## en-US

A single-column description list style.

---

```vue
<template>
  <sd-radio-group type="button" v-model="size">
    <sd-radio value="mini">mini</sd-radio>
    <sd-radio value="small">small</sd-radio>
    <sd-radio value="medium">medium</sd-radio>
    <sd-radio value="large">large</sd-radio>
  </sd-radio-group>
  <sd-descriptions
    style="margin-top: 20px"
    :data="data"
    :size="size"
    title="User Info"
    :column="1"
  />
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const size = ref('medium');

      const data = [
        {
          label: 'Name',
          value: 'Socrates',
        },
        {
          label: 'Mobile',
          value: '123-1234-1234',
        },
        {
          label: 'Residence',
          value: 'Beijing',
        },
        {
          label: 'Hometown',
          value: 'Beijing',
        },
        {
          label: 'Address',
          value: 'Yingdu Building, Zhichun Road, Beijing',
        },
      ];

      return {
        data,
        size,
      };
    },
  };
</script>
```
