```yaml
title:
  zh-CN: 错误状态
  en-US: Error state
```

## zh-CN

当加载图片失败的时候显示的内容。

---

## en-US

Content displayed when the image fails to load.

---

```vue
<template>
  <sd-space :size="20">
    <sd-image width="400" height="300" src="some-error.png" />
    <sd-image
      width="400"
      height="300"
      src="some-error.png"
      alt="This is a picture of humans eating ice cream. The humans on the screen are very happy just now. The ice cream is green, it seems to be flavored with matcha. The gender of the human is unknown. It has very long hair and the human hair is brown."
    />
  </sd-space>
</template>
```
