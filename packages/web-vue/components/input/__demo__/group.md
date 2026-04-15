```yaml
title:
  zh-CN: 输入框组合
  en-US: Input group
```

## zh-CN

通过 `input-group` 可以组合使用输入框。

---

## en-US

Input boxes can be combined by `input-group`.

---

```vue
<template>
  <sd-space direction="vertical" size="large">
    <sd-input-group>
      <sd-input :style="{ width: '160px' }" placeholder="first" />
      <sd-input :style="{ width: '160px' }" placeholder="second" />
    </sd-input-group>
    <sd-input-group>
      <sd-select
        :options="['Option1', 'Option2', 'Option3']"
        :style="{ width: '160px' }"
        placeholder="first"
      />
      <sd-input :style="{ width: '160px' }" placeholder="second" />
    </sd-input-group>
  </sd-space>
</template>
```
