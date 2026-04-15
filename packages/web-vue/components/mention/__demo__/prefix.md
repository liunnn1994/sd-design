```yaml
title:
  zh-CN: 自定义触发字符
  en-US: Custom Prefix
```

## zh-CN

指定 `prefix` 来自定义触发字符。默认为 `@`，可以自定义为任意字符。

---

## en-US

Specify `prefix` to customize the trigger character. The default is `@`, which can be customized to any character.

---

```vue
<template>
  <sd-space direction="vertical" size="large" style="width: 100%">
    <sd-mention :data="['Bytedance', 'Bytedesign', 'Bytenumner']" placeholder="input @" />
    <sd-mention :data="['Bytedance', 'Bytedesign', 'Bytenumner']" prefix="#" placeholder="input #" />
    <sd-mention :data="['Bytedance', 'Bytedesign', 'Bytenumner']" prefix="$" placeholder="input $" />
  </sd-space>
</template>
```
