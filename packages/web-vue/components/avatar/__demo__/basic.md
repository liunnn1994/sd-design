```yaml
title:
  zh-CN: 基本用法
  en-US: Basic Usage
```

## zh-CN

头像的基础使用。如果头像是文字的话，会自动调节字体大小，来适应头像框。

---

## en-US

The basic use of avatars. If the avatar is text, the font size will be automatically adjusted to fit the avatar.

---

```vue
<template>
  <sd-space size="large">
    <sd-avatar>A</sd-avatar>
    <sd-avatar :style="{ backgroundColor: '#3370ff' }">
      <IconUser />
    </sd-avatar>
    <sd-avatar :style="{ backgroundColor: '#14a9f8' }">SD</sd-avatar>
    <sd-avatar :style="{ backgroundColor: '#00d0b6' }">Design</sd-avatar>
    <sd-avatar>
      <img
        alt="avatar"
        src="https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/3ee5f13fb09879ecb5185e440cef6eb9.png~tplv-uwbnlip3yd-webp.webp"
      />
    </sd-avatar>
  </sd-space>
</template>

<script>
  import { IconUser } from '@sdata/web-vue/es/icon';

  export default {
    components: { IconUser },
  };
</script>
```
