```yaml
title:
  zh-CN: 布局模式
  en-US: Layouts
```

## zh-CN

有水平排列、垂直排列、行内水平排列、行内垂直排列四种布局模式。

---

## en-US

There are four layout modes: horizontal arrangement, vertical arrangement, horizontal arrangement in a row, and vertical arrangement in a row.

---

```vue
<template>
  <sd-radio-group type="button" v-model="size">
    <sd-radio value="mini">mini</sd-radio>
    <sd-radio value="small">small</sd-radio>
    <sd-radio value="medium">medium</sd-radio>
    <sd-radio value="large">large</sd-radio>
  </sd-radio-group>
  <div style="margin-top: 20px">
    <sd-descriptions :data="data" :size="size" title="User Info (horizontal)" bordered />
    <sd-descriptions
      :data="data"
      :size="size"
      title="User Info (inline-horizontal)"
      layout="inline-horizontal"
      bordered
    />
    <sd-descriptions
      :data="data"
      :size="size"
      title="User Info (vertical)"
      layout="vertical"
      bordered
    />
    <sd-descriptions
      :data="data"
      :size="size"
      title="User Info (inline-vertical)"
      layout="inline-vertical"
      bordered
    />
  </div>
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
