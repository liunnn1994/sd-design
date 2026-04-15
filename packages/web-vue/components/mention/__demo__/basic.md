```yaml
title:
  zh-CN: 基本使用
  en-US: Basic Usage
```

## zh-CN

用于在输入中提及某人或某事，常用于发布、聊天或评论功能。

---

## en-US

Used to mention someone or something in the input, often used for posting, chatting or commenting.

---

```vue
<template>
  <sd-space direction="vertical" size="large" style="width: 100%">
    <sd-mention
      v-model="value"
      :data="['Bytedance', 'Bytedesign', 'Bytenumner']"
      placeholder="enter something"
    />
    <sd-mention
      v-model="text"
      :data="['Bytedance', 'Bytedesign', 'Bytenumner']"
      type="textarea"
      placeholder="enter something"
    />
  </sd-space>
</template>

<script>
  import { ref } from 'vue';

  export default {
    setup() {
      const value = ref('');
      const text = ref('');

      return {
        value,
        text,
      };
    },
  };
</script>
```
