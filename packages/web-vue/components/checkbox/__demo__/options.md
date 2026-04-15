```yaml
title:
  zh-CN: 复选框组选项
  en-US: Checkbox Group options
```

## zh-CN

`a-checkbox-group` 通过 `options` 属性设置子元素

---

## en-US

`a-checkbox-group` set child elements through `options` prop

---

```vue
<template>
  <sd-space direction="vertical" size="large">
    <sd-checkbox-group v-model="value1" :options="plainOptions" />
    <sd-checkbox-group v-model="value2" :options="options" />
    <sd-checkbox-group v-model="value2" :options="options">
      <template #label="{ data }">
        <sd-tag>{{ data.label }}</sd-tag>
      </template>
    </sd-checkbox-group>
  </sd-space>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const value1 = ref(['Plain 1']);
      const plainOptions = ['Plain 1', 'Plain 2', 'Plain 3'];

      const value2 = ref(['1']);
      const options = [
        { label: 'Option 1', value: '1' },
        { label: 'Option 2', value: '2' },
        { label: 'Option 3', value: '3', disabled: true },
      ];

      return {
        plainOptions,
        options,
        value1,
        value2,
      };
    },
  };
</script>
```
