```yaml
title:
  zh-CN: 切换拦截
  en-US: Switch intercept
```

## zh-CN

设置 `beforeChange` 函数，函数的返回值将用于判断是否阻止切换。

---

## en-US

Set the `beforeChange` function, and the return value of the function will be used to determine whether to block the switch.

---

```vue
<template>
  <sd-space size="large">
    <sd-switch :beforeChange="handleChangeIntercept" />
    <sd-switch type="round" :beforeChange="handleChangeIntercept2" />
    <sd-switch type="line" :beforeChange="handleChangeIntercept3" />
  </sd-space>
</template>

<script>
  import { Message } from '@sdata/web-vue';

  export default {
    setup() {
      const handleChangeIntercept = async (newValue) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return true;
      };

      const handleChangeIntercept2 = async (newValue) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        if (!newValue) {
          Message.error("OH, You can't change");
          return false;
        }
        return true;
      };

      const handleChangeIntercept3 = async (newValue) => {
        await new Promise((_, reject) =>
          setTimeout(() => {
            Message.error('OH, Something went wrong');
            reject();
          }, 1000),
        );
        return true;
      };

      return {
        handleChangeIntercept,
        handleChangeIntercept2,
        handleChangeIntercept3,
      };
    },
  };
</script>
```
