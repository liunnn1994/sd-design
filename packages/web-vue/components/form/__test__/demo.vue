<template>
  <sd-form :model="form">
    <sd-form-item
      field="name"
      label="Username"
      :rules="[
        { required: true, message: 'name is required' },
        {
          minLength: 6,
          message: 'name should up 6 chars',
        },
      ]"
    >
      <sd-input id="name" v-model="form.name" />
    </sd-form-item>
    <sd-form-item
      field="post"
      label="Post"
      :rules="[{ required: true, message: 'post is required' }]"
    >
      <sd-input id="post" v-model="form.post" />
    </sd-form-item>
  </sd-form>
</template>

<script setup lang="ts">
  import { reactive } from 'vue';

  import SdInput from '../../input';
  import SdForm from '../index';

  defineOptions({ name: 'BasicDemo' });
  const SdFormItem = SdForm.Item;
  const form = reactive({ name: '', post: '' });
</script>
