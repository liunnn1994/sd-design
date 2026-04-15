```yaml
title:
  zh-CN: 列表元素
  en-US: List Item Meta
```

## zh-CN

使用 `list-item-meta` 组件可快速指定头像、标题、文字。

---

## en-US

Use the `list-item-meta` component to quickly specify the avatar, title, and text.

---

```vue
<template>
  <sd-list>
    <sd-list-item v-for="idx in 4" :key="idx">
      <sd-list-item-meta
        title="Beijing Bytedance Technology Co., Ltd."
        description="Beijing ByteDance Technology Co., Ltd. is an enterprise located in China."
      >
        <template #avatar>
          <sd-avatar shape="square">
            <img
              alt="avatar"
              src="https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/3ee5f13fb09879ecb5185e440cef6eb9.png~tplv-uwbnlip3yd-webp.webp"
            />
          </sd-avatar>
        </template>
      </sd-list-item-meta>
    </sd-list-item>
  </sd-list>
</template>
```
