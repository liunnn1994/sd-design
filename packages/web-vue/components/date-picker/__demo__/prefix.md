```yaml
title:
  zh-CN: 前缀
  en-US: Prefix
```

## zh-CN

通过 `prefix` 插槽可以设置输入框前缀

---

## en-US

The prefix of the input box can be set through the `prefix` slot

---

```vue
<template>
  <div>
    <div>
      <sd-date-picker style="width: 300px;">
        <template #prefix>
          <IconInfoCircle />
        </template>
      </sd-date-picker>
    </div>
    <sd-range-picker
      showTime
      :defaultValue="['2019-08-08 00:00:00', '2019-08-18 00:00:00']"
      @select="onSelect"
      @change="onChange"
      :style="{ width: '400px', marginTop: '20px' }"
    >
      <template #prefix>
        <IconInfoCircle />
      </template>
    </sd-range-picker>
  </div>
</template>

<script>
  import { IconInfoCircle } from '@sdata/web-vue/es/icon';

  export default {
    components: { IconInfoCircle },
  };
</script>
```
