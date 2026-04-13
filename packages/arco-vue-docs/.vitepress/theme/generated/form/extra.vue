<template>
  <a-form :model="form" :style="{width:'600px'}">
    <a-form-item field="name" label="Username" validate-trigger="input" required>
      <a-input v-model="form.name" placeholder="please enter your username..." />
      <template #extra>
        <div>Used to login</div>
      </template>
    </a-form-item>
    <a-form-item field="post" label="Post" validate-trigger="input" required>
      <a-input v-model="form.post" placeholder="please enter your post..." />
      <template #extra>
        <div>Used to login</div>
      </template>
      <template #help>
        <div>Custom valitae message</div>
      </template>
    </a-form-item>
    <a-form-item field="isRead">
      <a-checkbox v-model="form.isRead">
        I have read the manual
      </a-checkbox>
    </a-form-item>
  </a-form>
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
    })

    return {
      form,
    }
  },
}
</script>
