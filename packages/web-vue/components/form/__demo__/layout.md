```yaml
title:
  zh-CN: 表单布局
  en-US: Form Layout
```

## zh-CN

表单支持三种布局方式： `horizontal` - 水平排列 **（默认）**， `vertical` - 垂直排列， `inline` - 行内排列。

---

## en-US

The form supports three layout methods: `horizontal`, `vertical` and `inline`.

---

```vue
<template>
  <sd-space direction="vertical" size="large" :style="{ width: '600px' }">
    <sd-radio-group v-model="layout" type="button">
      <sd-radio value="horizontal">horizontal</sd-radio>
      <sd-radio value="vertical">vertical</sd-radio>
      <sd-radio value="inline">inline</sd-radio>
    </sd-radio-group>
    <sd-form :model="form" :layout="layout">
      <sd-form-item field="name" label="Username">
        <sd-input v-model="form.name" placeholder="please enter your username..." />
      </sd-form-item>
      <sd-form-item field="post" label="Post">
        <sd-input v-model="form.post" placeholder="please enter your post..." />
      </sd-form-item>
      <sd-form-item field="isRead">
        <sd-checkbox v-model="form.isRead"> I have read the manual </sd-checkbox>
      </sd-form-item>
      <sd-form-item>
        <sd-button>Submit</sd-button>
      </sd-form-item>
    </sd-form>
    <div>
      {{ form }}
    </div>
  </sd-space>
</template>

<script>
  import { reactive, ref } from 'vue';

  export default {
    setup() {
      const layout = ref('horizontal');
      const form = reactive({
        name: '',
        post: '',
        isRead: false,
      });

      return {
        layout,
        form,
      };
    },
  };
</script>
```
