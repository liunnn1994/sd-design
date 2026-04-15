```yaml
title:
  zh-CN: 受控
  en-US: Controlled
```

## zh-CN

通过 `v-model` (`model-value`) 属性控制是否选中

---

## en-US

Control whether the radio is selected

---

```vue
<template>
  <sd-space size="large">
    <sd-radio v-model="checked1">v-model</sd-radio>
    <sd-radio :model-value="true">binding "true"</sd-radio>
    <sd-radio :model-value="checked2">binding value2</sd-radio>
    <sd-radio :default-checked="true">uncontrolled state</sd-radio>
  </sd-space>
  <div :style="{ marginTop: '20px' }">
    <sd-space size="large">
      <sd-button type="primary" @click="handleSetCheck">
        {{ checked2 ? 'uncheck' : 'check' }} value2
      </sd-button>
      <sd-button @click="handleReset"> reset all </sd-button>
    </sd-space>
  </div>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const checked1 = ref(false);
      const checked2 = ref(false);

      const handleSetCheck = () => {
        checked2.value = !checked2.value;
      };

      const handleReset = () => {
        checked1.value = false;
        checked2.value = false;
      };

      return {
        checked1,
        checked2,
        handleSetCheck,
        handleReset,
      };
    },
  };
</script>
```
