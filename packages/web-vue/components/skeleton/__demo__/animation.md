```yaml
title:
  zh-CN: 动画
  en-US: Animation
```

## zh-CN

通过设置 `animation` 属性，让骨架屏显示动画效果。

---

## en-US

By setting the `animation` property, the skeleton screen can display the animation effect.

---

```vue
<template>
  <sd-space direction="vertical" size="large" :style="{ width: '100%' }">
    <sd-space>
      <span>Animation</span>
      <sd-switch v-model="animation" />
    </sd-space>
    <sd-skeleton :animation="animation">
      <sd-space direction="vertical" :style="{ width: '100%' }" size="large">
        <sd-skeleton-line :rows="3" />
        <sd-skeleton-shape />
      </sd-space>
    </sd-skeleton>
  </sd-space>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const animation = ref(true);

      return {
        animation,
      };
    },
  };
</script>
```
