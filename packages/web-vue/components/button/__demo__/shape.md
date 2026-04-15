```yaml
title:
  zh-CN: 按钮形状
  en-US: Button Shape
```

## zh-CN

按钮分为 `square` - **长方形（默认）**、`circle` - **圆形**、`round` - **全圆角**三种形状。

---

## en-US

Button is divided into three shapes: `square` - **rectangular (default)**, `circle` - **circle**, and `round` - **full rounded corner**.

---

```vue
<template>
  <sd-space>
    <sd-button type="primary">Square</sd-button>
    <sd-button type="primary" shape="round">Round</sd-button>
    <sd-button type="primary">
      <template #icon>
        <icon-plus />
      </template>
    </sd-button>
    <sd-button type="primary" shape="circle">
      <icon-plus />
    </sd-button>
  </sd-space>
</template>
<script>
  import { IconPlus } from '@sdata/web-vue/es/icon';

  export default {
    components: { IconPlus },
  };
</script>
```
