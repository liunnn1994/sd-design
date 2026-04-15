```yaml
title:
  zh-CN: 额外节点
  en-US: Extra slot
```

## zh-CN

通过 `extra` 可以设置额外节点。`extra` 单击可以以设置 `stop` 修饰符，以阻止当前项目展开。

---

## en-US

The extra node on the far right can be set by `extra`. `extra` click to set `stop` modifier to prevent the current item from expanding.

---

```vue
<template>
  <sd-collapse>
    <sd-collapse-item header="Beijing Toutiao Technology Co., Ltd." key="1">
      <template #extra>
        <icon-copy />
      </template>
      <div>Beijing Toutiao Technology Co., Ltd.</div>
      <div>Beijing Toutiao Technology Co., Ltd.</div>
    </sd-collapse-item>
    <sd-collapse-item header="Beijing Toutiao Technology Co., Ltd." :key="2">
      <template #extra>
        <sd-button type="primary" size="mini" @click.stop="sayHello">hello</sd-button>
      </template>
      <div>Beijing Toutiao Technology Co., Ltd.</div>
      <div>Beijing Toutiao Technology Co., Ltd.</div>
    </sd-collapse-item>
    <sd-collapse-item header="Beijing Toutiao Technology Co., Ltd." key="3">
      <template #extra>
        <sd-tag size="small">city</sd-tag>
      </template>
      <div>Beijing Toutiao Technology Co., Ltd.</div>
      <div>Beijing Toutiao Technology Co., Ltd.</div>
    </sd-collapse-item>
  </sd-collapse>
</template>

<script>
  import { Message } from '@sdata/web-vue';

  export default {
    setup() {
      const sayHello = () => {
        Message.info('hello');
      };

      return {
        sayHello,
      };
    },
  };
</script>
```
