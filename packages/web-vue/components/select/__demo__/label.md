```yaml
title:
  zh-CN: 自定义选择框展示内容
  en-US: Label
```

## zh-CN

通过 `#label` 插槽可以自定义选择框展示内容。

---

## en-US

The display content of the select box can be customized through the `#label` slot.

---

```vue
<template>
  <sd-select default-value="Beijing" :style="{ width: '320px' }" placeholder="Please select ...">
    <template #label="{ data }">
      <span><icon-plus />{{ data?.label }}</span>
    </template>
    <sd-option>Beijing</sd-option>
    <sd-option>Shanghai</sd-option>
    <sd-option>Guangzhou</sd-option>
    <sd-option disabled>Disabled</sd-option>
  </sd-select>
</template>

<script>
  import { IconPlus } from '@sdata/web-vue/es/icon';

  export default {
    components: { IconPlus },
  };
</script>
```
