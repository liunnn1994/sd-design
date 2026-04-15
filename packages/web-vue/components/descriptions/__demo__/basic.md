```yaml
title:
  zh-CN: 基本用法
  en-US: Basic Usage
```

## zh-CN

简单地成组展示多个只读字段，一般用于详情页的信息。

---

## en-US

Simply display multiple read-only fields in groups, which are generally used for information on the details page.

---

```vue
<template>
  <sd-space direction="vertical" size="large" fill>
    <sd-descriptions :data="data" title="User Info" layout="inline-horizontal" />
    <sd-descriptions title="User Info" :column="{ xs: 1, md: 3, lg: 4 }">
      <sd-descriptions-item v-for="item of data" :label="item.label" :span="item.span ?? 1">
        <sd-tag>{{ item.value }}</sd-tag>
      </sd-descriptions-item>
    </sd-descriptions>
  </sd-space>
</template>

<script>
  export default {
    setup() {
      const data = [
        {
          label: 'Name',
          value: 'Socrates',
          span: 3,
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
      };
    },
  };
</script>
```
