```yaml
title:
  zh-CN: 头像组
  en-US: Group
```

## zh-CN

使用 `Avatar.Group` 可以使用头像组功能，可通过 `size` 指定头像的大小。

---

## en-US

Use `Avatar.Group` to group a list of avatars. `size` can be used to specify the size of each avatar..

---

```vue
<template>
  <sd-space :size="32">
    <sd-avatar-group>
      <sd-avatar :style="{ backgroundColor: '#7BC616' }">A</sd-avatar>
      <sd-avatar :style="{ backgroundColor: '#14C9C9' }">B</sd-avatar>
      <sd-avatar :style="{ backgroundColor: '#168CFF' }">C</sd-avatar>
      <sd-avatar :style="{ backgroundColor: '#FF7D00' }">SD</sd-avatar>
      <sd-avatar :style="{ backgroundColor: '#FFC72E' }">Design</sd-avatar>
    </sd-avatar-group>

    <sd-avatar-group :size="24">
      <sd-avatar :style="{ backgroundColor: '#7BC616' }">A</sd-avatar>
      <sd-avatar :style="{ backgroundColor: '#14C9C9' }">B</sd-avatar>
      <sd-avatar :style="{ backgroundColor: '#168CFF' }">C</sd-avatar>
      <sd-avatar :style="{ backgroundColor: '#FF7D00' }">SD</sd-avatar>
      <sd-avatar :style="{ backgroundColor: '#FFC72E' }">Design</sd-avatar>
    </sd-avatar-group>

    <sd-avatar-group :size="24" :max-count="3">
      <sd-avatar :style="{ backgroundColor: '#7BC616' }">A</sd-avatar>
      <sd-avatar :style="{ backgroundColor: '#14C9C9' }">B</sd-avatar>
      <sd-avatar :style="{ backgroundColor: '#168CFF' }">C</sd-avatar>
      <sd-avatar :style="{ backgroundColor: '#FF7D00' }">SD</sd-avatar>
      <sd-avatar :style="{ backgroundColor: '#FFC72E' }">Design</sd-avatar>
    </sd-avatar-group>
  </sd-space>
</template>
```
