```yaml
title:
  zh-CN: 图标
  en-US: Icon
```

## zh-CN

通过 `icon` 设置带图标的链接，设置为 `true` 时候显示默认图标。

---

## en-US

Customize icon node. If true, the default icon will be displayed.

---

```vue
<template>
  <div>
    <sd-space>
      <sd-link href="link" icon>Link</sd-link>
      <sd-link href="link" disabled icon>Link</sd-link>
    </sd-space>
  </div>
  <div>
    <sd-space>
      <sd-link href="link">
        <template #icon>
          <icon-edit />
        </template>
        Link
      </sd-link>
      <sd-link href="link" disabled>
        <template #icon>
          <icon-edit />
        </template>
        Link
      </sd-link>
    </sd-space>
  </div>
</template>

<script>
  import { IconEdit } from '@sdata/web-vue/es/icon';

  export default {
    components: { IconEdit },
  };
</script>
```
