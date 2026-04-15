```yaml
title:
  zh-CN: 额外信息和帮助信息
  en-US: Extra Message & Help Message
```

## zh-CN

可以使用 `extra` 添加额外信息。如果需要在外部自定义校验信息，可以使用 `help` 属性或插槽。设置 `help` 时校验信息会被屏蔽。

---

## en-US

You can use `extra` to add extra information. You can use the `help` attribute or slot. The verification information will be blocked when `help` is set.

---

```vue
<template>
  <sd-form :model="form" :style="{ width: '600px' }">
    <sd-form-item field="name" label="Username" validate-trigger="input" required>
      <sd-input v-model="form.name" placeholder="please enter your username..." />
      <template #extra>
        <div>Used to login</div>
      </template>
    </sd-form-item>
    <sd-form-item field="post" label="Post" validate-trigger="input" required>
      <sd-input v-model="form.post" placeholder="please enter your post..." />
      <template #extra>
        <div>Used to login</div>
      </template>
      <template #help>
        <div>Custom valitae message</div>
      </template>
    </sd-form-item>
    <sd-form-item field="isRead">
      <sd-checkbox v-model="form.isRead"> I have read the manual </sd-checkbox>
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
