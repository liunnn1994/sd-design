```yaml
title:
  zh-CN: 选择框大小
  en-US: Select Size
```

## zh-CN

选择框分为 `mini`、`small`、`medium`、`large` 四种尺寸。

---

## en-US

The selection box is divided into four sizes: `mini`, `small`, `medium`, and `large`.

---

```vue
<template>
  <sd-space direction="vertical" size="large">
    <sd-radio-group type="button" v-model="size">
      <sd-radio value="mini">Mini</sd-radio>
      <sd-radio value="small">Small</sd-radio>
      <sd-radio value="medium">Medium</sd-radio>
      <sd-radio value="large">Large</sd-radio>
    </sd-radio-group>
    <sd-select
      default-value="Beijing"
      :style="{ width: '320px' }"
      :size="size"
      placeholder="Please select ..."
    >
      <sd-option>Beijing</sd-option>
      <sd-option>Shanghai</sd-option>
      <sd-option>Guangzhou</sd-option>
      <sd-option disabled>Disabled</sd-option>
    </sd-select>
    <sd-select
      :default-value="['Beijing', 'Shanghai']"
      :style="{ width: '320px' }"
      :size="size"
      placeholder="Please select ..."
      multiple
    >
      <sd-option>Beijing</sd-option>
      <sd-option>Shanghai</sd-option>
      <sd-option>Guangzhou</sd-option>
      <sd-option disabled>Disabled</sd-option>
      <sd-option>Shenzhen</sd-option>
      <sd-option>Chengdu</sd-option>
      <sd-option>Wuhan</sd-option>
    </sd-select>
  </sd-space>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const size = ref('medium');

      return {
        size,
      };
    },
  };
</script>
```
