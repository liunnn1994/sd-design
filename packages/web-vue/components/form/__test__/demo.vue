<template>
  <a-form :model="form">
    <a-form-item
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
      <a-input id="name" v-model="form.name" />
    </a-form-item>
    <a-form-item
      field="post"
      label="Post"
      :rules="[{ required: true, message: 'post is required' }]"
    >
      <a-input id="post" v-model="form.post" />
    </a-form-item>
  </a-form>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';

  import Input from '../../input';
  import Form from '../index';

  const FormItem = Form.Item;

  export default defineComponent({
    name: 'BasicDemo',
    components: {
      AForm: Form,
      AFormItem: FormItem,
      AInput: Input,
    },
    data() {
      return {
        form: {
          name: '',
          post: '',
        },
      };
    },
    methods: {},
  });
</script>
