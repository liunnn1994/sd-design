```yaml
title:
  zh-CN: 带图标的标签
  en-US: Icon
```

## zh-CN

可通过 `icon` 插槽在标签中加入图标。

---

## en-US

An icon can be added to the tag through the `icon` slot.

---

```vue
<template>
  <sd-space>
    <sd-tag color="gray">
      <template #icon>
        <icon-github />
      </template>
      Github
    </sd-tag>
    <sd-tag color="orangered">
      <template #icon>
        <icon-gitlab />
      </template>
      Gitlab
    </sd-tag>
    <sd-tag color="blue">
      <template #icon>
        <icon-twitter />
      </template>
      Twitter
    </sd-tag>
    <sd-tag color="sdblue">
      <template #icon>
        <icon-facebook />
      </template>
      Facebook
    </sd-tag>
  </sd-space>
</template>
```
