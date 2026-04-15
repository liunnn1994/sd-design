```yaml
title:
  zh-CN: 输入框状态
  en-US: Status
```

## zh-CN

输入框有禁用、只读和错误三种状态。

---

## en-US

The input box has three states: disabled, readonly and error.

---

```vue
<template>
  <sd-space direction="vertical" size="large">
    <sd-input-tag
      :default-value="['test']"
      :style="{ width: '320px' }"
      placeholder="Please Enter"
      disabled
    />
    <sd-input-tag
      :default-value="['test']"
      :style="{ width: '320px' }"
      placeholder="Please Enter"
      readonly
    />
    <sd-input-tag
      :default-value="['test']"
      :style="{ width: '320px' }"
      placeholder="Please Enter"
      error
    />
  </sd-space>
</template>
```
