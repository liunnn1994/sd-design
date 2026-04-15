```yaml
title:
  zh-CN: 多选选择器
  en-US: Multiple Select
```

## zh-CN

通过设置 `multiple` ，可以让选择器支持多选。此外通过 `max-tag-count` 可以设置最多显示的标签个数。

---

## en-US

By setting `multiple`, the selector can support multiple selection. In addition, the maximum number of tags displayed can be set by `max-tag-count`.

---

```vue
<template>
  <div style="margin-bottom: 10px">
    <sd-switch v-model="scrollbar" />
    Virtual Scrollbar
  </div>
  <sd-space direction="vertical" size="large">
    <sd-select
      :default-value="['Beijing', 'Shanghai']"
      :style="{ width: '360px' }"
      placeholder="Please select ..."
      multiple
      :scrollbar="scrollbar"
    >
      <sd-option>Beijing</sd-option>
      <sd-option :tag-props="{ color: 'red' }">Shanghai</sd-option>
      <sd-option>Guangzhou</sd-option>
      <sd-option disabled>Disabled</sd-option>
      <sd-option>Shenzhen</sd-option>
      <sd-option>Wuhan</sd-option>
    </sd-select>
    <sd-select
      :default-value="['Beijing', 'Shanghai', 'Guangzhou']"
      :style="{ width: '360px' }"
      placeholder="Please select ..."
      multiple
      :max-tag-count="2"
      allow-clear
      :scrollbar="scrollbar"
    >
      <sd-option>Beijing</sd-option>
      <sd-option>Shanghai</sd-option>
      <sd-option>Guangzhou</sd-option>
      <sd-option disabled>Disabled</sd-option>
      <sd-option>Shenzhen</sd-option>
      <sd-option>Chengdu</sd-option>
      <sd-option>Wuhan</sd-option>
    </sd-select>
    <sd-select
      :default-value="['Beijing', 'Shanghai']"
      :style="{ width: '360px' }"
      placeholder="Please select ..."
      multiple
      :limit="2"
      :scrollbar="scrollbar"
    >
      <sd-option>Beijing</sd-option>
      <sd-option :tag-props="{ color: 'red' }">Shanghai</sd-option>
      <sd-option>Guangzhou</sd-option>
      <sd-option disabled>Disabled</sd-option>
      <sd-option>Shenzhen</sd-option>
      <sd-option>Wuhan</sd-option>
    </sd-select>
  </sd-space>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const scrollbar = ref(true);

      return {
        scrollbar,
      };
    },
  };
</script>
```
