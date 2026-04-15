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
