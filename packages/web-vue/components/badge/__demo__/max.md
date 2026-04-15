```yaml
title:
  zh-CN: 最大值
  en-US: Max Count
```

## zh-CN

设置 `max-count`，可以限制最大显示的徽标数值，超过将会加 `+` 后缀。`max-count` 默认为 `99`。

---

## en-US

If the count is larger than `max-count`, the `${max-count}+` will be displayed. The default value of `max-count` is `99`.

---

```vue
<template>
  <sd-space :size="40">
    <sd-badge :max-count="10" :count="0">
      <sd-avatar shape="square">
        <span>
          <IconUser />
        </span>
      </sd-avatar>
    </sd-badge>
    <sd-badge :max-count="10" :count="100">
      <sd-avatar shape="square">
        <span>
          <IconUser />
        </span>
      </sd-avatar>
    </sd-badge>
    <sd-badge :count="100">
      <sd-avatar shape="square">
        <span>
          <IconUser />
        </span>
      </sd-avatar>
    </sd-badge>
    <sd-badge :max-count="999" :count="1000">
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
