```yaml
title:
  zh-CN: 加载中状态
  en-US: Loading Status
```

## zh-CN

通过设置 `loading` 可以让按钮处于加载中状态。处于加载中状态的按钮不会触发点击事件。

---

## en-US

The button can be in the loading state by setting `loading`. The button in the loading state will not trigger the `click` event.

---

```vue
<template>
  <sd-space>
    <sd-button type="primary" loading>Primary</sd-button>
    <sd-button loading>Default</sd-button>
    <sd-button type="dashed" loading>Dashed</sd-button>
    <sd-button type="primary" :loading="loading1" @click="handleClick1">Click Me</sd-button>
    <sd-button type="primary" :loading="loading2" @click="handleClick2">
      <template #icon>
        <icon-plus />
      </template>
      Click Me
    </sd-button>
  </sd-space>
</template>

<script>
  import { ref } from 'vue';
  import { IconPlus } from '@sdata/web-vue/es/icon';

  export default {
    components: {
      IconPlus,
    },
    setup() {
      const loading1 = ref(false);
      const loading2 = ref(false);

      const handleClick1 = () => {
        loading1.value = !loading1.value;
      };
      const handleClick2 = () => {
        loading2.value = !loading2.value;
      };

      return {
        loading1,
        loading2,
        handleClick1,
        handleClick2,
      };
    },
  };
</script>
```
