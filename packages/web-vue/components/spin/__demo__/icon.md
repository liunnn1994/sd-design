```yaml
title:
  zh-CN: 自定义图标
  en-US: Custom Icon
```

## zh-CN

通过 `#icon` 插槽可以自定义图标。

---

## en-US

$END$

---

```vue
<template>
  <sd-spin>
    <template #icon>
      <icon-sync />
    </template>
  </sd-spin>
</template>

<script>
  import { IconSync } from '@sdata/web-vue/es/icon';

  export default {
    components: { IconSync },
  };
</script>
```
