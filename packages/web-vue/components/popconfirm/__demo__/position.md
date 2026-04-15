```yaml
title:
  zh-CN: 弹出位置
  en-US: Popup Position
```

## zh-CN

`popconfirm` 支持 12 个不同的方位。分别为：`上左` `上` `上右` `下左` `下` `下右` `左上` `左` `左下` `右上` `右` `右下`。

---

## en-US

`popconfirm` supports 12 different positions. They are: `upper left` `upper` `upper right` `lower left` `down` `lower right` `upper left` `left` `lower left` `upper right` `right` `lower right`.

---

```vue
<template>
  <div :style="{ position: 'relative', width: '440px', height: '280px' }">
    <sd-popconfirm content="This is a Popconfirm" position="tl">
      <sd-button class="button" :style="{ position: 'absolute', top: '0', left: '70px' }"
        >TL</sd-button
      >
    </sd-popconfirm>
    <sd-popconfirm content="This is a Popconfirm" position="top">
      <sd-button class="button" :style="{ position: 'absolute', top: '0', left: '180px' }"
        >TOP</sd-button
      >
    </sd-popconfirm>
    <sd-popconfirm content="This is a Popconfirm" position="tr">
      <sd-button class="button" :style="{ position: 'absolute', top: '0', left: '290px' }"
        >TR</sd-button
      >
    </sd-popconfirm>
    <sd-popconfirm content="This is a Popconfirm" position="bl">
      <sd-button class="button" :style="{ position: 'absolute', top: '240px', left: '70px' }"
        >BL</sd-button
      >
    </sd-popconfirm>
    <sd-popconfirm content="This is a Popconfirm" position="bottom">
      <sd-button class="button" :style="{ position: 'absolute', top: '240px', left: '180px' }"
        >BOTTOM</sd-button
      >
    </sd-popconfirm>
    <sd-popconfirm content="This is a Popconfirm" position="br">
      <sd-button class="button" :style="{ position: 'absolute', top: '240px', left: '290px' }"
        >BR</sd-button
      >
    </sd-popconfirm>
    <sd-popconfirm content="This is a Popconfirm" position="lt">
      <sd-button class="button" :style="{ position: 'absolute', top: '60px', left: '10px' }"
        >LT</sd-button
      >
    </sd-popconfirm>
    <sd-popconfirm content="This is a Popconfirm" position="left">
      <sd-button class="button" :style="{ position: 'absolute', top: '120px', left: '10px' }"
        >LEFT</sd-button
      >
    </sd-popconfirm>
    <sd-popconfirm content="This is a Popconfirm" position="lb">
      <sd-button class="button" :style="{ position: 'absolute', top: '180px', left: '10px' }"
        >LB</sd-button
      >
    </sd-popconfirm>
    <sd-popconfirm content="This is a Popconfirm" position="rt">
      <sd-button class="button" :style="{ position: 'absolute', top: '60px', left: '350px' }"
        >RT</sd-button
      >
    </sd-popconfirm>
    <sd-popconfirm content="This is a Popconfirm" position="right">
      <sd-button class="button" :style="{ position: 'absolute', top: '120px', left: '350px' }"
        >RIGHT</sd-button
      >
    </sd-popconfirm>
    <sd-popconfirm content="This is a Popconfirm" position="rb">
      <sd-button class="button" :style="{ position: 'absolute', top: '180px', left: '350px' }"
        >RB</sd-button
      >
    </sd-popconfirm>
  </div>
</template>

<style scoped lang="less">
  .button {
    width: 100px;
  }
</style>
```
