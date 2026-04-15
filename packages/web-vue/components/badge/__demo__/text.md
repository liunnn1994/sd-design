```yaml
title:
  zh-CN: 文本内容
  en-US: Text
```

## zh-CN

设置 `text`，可设置自定义提示内容。

---

## en-US

Customize the content.

---

```vue
<template>
  <sd-space :size="40">
    <sd-badge text="NEW">
      <sd-avatar shape="square">
        <span>
          <IconUser />
        </span>
      </sd-avatar>
    </sd-badge>
    <sd-badge text="HOT">
      <sd-avatar shape="square">
        <span>
          <IconUser />
        </span>
      </sd-avatar>
    </sd-badge>
  </sd-space>
</template>

<script>
  import { IconUser } from '@sdata/web-vue/es/icon';

  export default {
    components: { IconUser },
  };
</script>
```
