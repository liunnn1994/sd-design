```yaml
title:
  zh-CN: 全局禁用
  en-US: Global Disabled
```

## zh-CN

通过 `disabled` 属性可以禁用整个表单。

---

## en-US

The entire form can be disabled through the `disabled` attribute.

---

```vue
<template>
  <sd-form :model="form" :style="{ width: '600px' }" disabled>
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
  {{ form }}
</template>

<script>
  import { reactive } from 'vue';

  export default {
    setup() {
      const form = reactive({
        name: '',
        post: '',
        isRead: false,
      });

      return {
        form,
      };
    },
  };
</script>
```
